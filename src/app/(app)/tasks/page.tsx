'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskModal } from '@/components/tasks/task-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isToday, isFuture, isPast, parseISO } from 'date-fns'
import { Plus, CheckSquare, ListTodo, Clock, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'today' | 'upcoming' | 'done'

export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTask } = useTasks(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const filters: { key: Filter; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'All', icon: ListTodo },
    { key: 'today', label: 'Today', icon: Clock },
    { key: 'upcoming', label: 'Upcoming', icon: CheckSquare },
    { key: 'done', label: 'Done', icon: CheckCheck },
  ]

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return t.status !== 'done'
    if (filter === 'done') return t.status === 'done'
    if (filter === 'today') return t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'done'
    if (filter === 'upcoming') return t.due_date && isFuture(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'done'
    return true
  })

  const counts = {
    all: tasks.filter((t) => t.status !== 'done').length,
    today: tasks.filter((t) => t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'done').length,
    upcoming: tasks.filter((t) => t.due_date && isFuture(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'done').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-0.5">{counts.all} active tasks</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="text-white font-semibold gap-2"
          style={{ background: 'var(--accent-color)' }}
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
              filter === key
                ? 'text-white'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
            )}
            style={filter === key ? { background: 'rgba(var(--accent-rgb), 0.2)', color: 'var(--accent-color)' } : {}}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {counts[key] > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                filter === key ? 'bg-white/20' : 'bg-white/10 text-slate-400'
              )}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm">
            {filter === 'done' ? 'No completed tasks yet' : 'No tasks here. Add one!'}
          </p>
          {filter !== 'done' && (
            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
              className="mt-4 border-white/10 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          ))}
        </div>
      )}

      <TaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={async (task) => { await createTask(task) }}
      />
    </div>
  )
}
