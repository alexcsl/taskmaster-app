'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskInsert, TaskUpdate } from '@/lib/supabase/types'
import { addDays, addWeeks, addMonths } from 'date-fns'

export function useTasks(parentId?: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('position')
      .order('created_at')

    if (parentId === null) {
      query = query.is('parent_id', null)
    } else if (parentId) {
      query = query.eq('parent_id', parentId)
    } else {
      query = query.is('parent_id', null)
    }

    const { data } = await query
    if (data) setTasks(data)
    setLoading(false)
  }, [parentId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function createTask(insert: Omit<TaskInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...insert, user_id: user.id })
      .select()
      .single()
    if (data) {
      setTasks((prev) => [...prev, data])
      scheduleNotification(data)
    }
    return data
  }

  async function updateTask(id: string, update: TaskUpdate) {
    const { data } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
      if (update.status === 'done' && data.is_recurring && data.recurrence_pattern) {
        await createRecurringNext(data)
      }
    }
    return data
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function toggleTask(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    await updateTask(id, { status: newStatus })
  }

  async function createRecurringNext(task: Task) {
    if (!task.due_date || !task.recurrence_pattern) return
    const nextDue = task.recurrence_pattern === 'daily'
      ? addDays(new Date(task.due_date), 1)
      : task.recurrence_pattern === 'weekly'
        ? addWeeks(new Date(task.due_date), 1)
        : addMonths(new Date(task.due_date), 1)

    await createTask({
      title: task.title,
      notes: task.notes,
      status: 'todo',
      priority: task.priority,
      due_date: nextDue.toISOString(),
      is_recurring: true,
      recurrence_pattern: task.recurrence_pattern,
      parent_id: task.parent_id,
    })
  }

  return { tasks, loading, createTask, updateTask, deleteTask, toggleTask, refetch: fetchTasks }
}

function scheduleNotification(task: Task) {
  if (!task.due_date || typeof window === 'undefined') return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const dueTime = new Date(task.due_date).getTime()
  const reminderTime = dueTime - 24 * 60 * 60 * 1000
  const now = Date.now()
  const delay = reminderTime - now

  if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      new Notification(`Due tomorrow: ${task.title}`, {
        body: task.notes?.substring(0, 100) || '',
        icon: '/favicon.ico',
      })
    }, delay)
  }
}
