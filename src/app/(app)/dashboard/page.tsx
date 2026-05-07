'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { useEvents } from '@/hooks/use-events'
import { useNotes } from '@/hooks/use-notes'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskModal } from '@/components/tasks/task-modal'
import { EventModal } from '@/components/calendar/event-modal'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime } from '@/lib/utils'
import { isToday, isFuture, parseISO } from 'date-fns'
import {
  Plus,
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks(null)
  const { events, loading: eventsLoading, createEvent } = useEvents()
  const { notes, loading: notesLoading, createNote } = useNotes()

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)

  const todayTasks = tasks.filter((t) =>
    t.status !== 'done' && t.due_date && isToday(parseISO(t.due_date))
  )
  const allActiveTasks = tasks.filter((t) => t.status !== 'done')

  const upcomingEvents = events
    .filter((e) => isFuture(parseISO(e.start_time)) || isToday(parseISO(e.start_time)))
    .slice(0, 5)

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .filter((n) => !n.parent_id)
    .slice(0, 4)

  const doneTodayCount = tasks.filter((t) =>
    t.status === 'done' && t.due_date && isToday(parseISO(t.due_date))
  ).length

  async function handleCreateNote() {
    const note = await createNote()
    if (note) router.push(`/notes/${note.id}`)
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-slate-400 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Tasks', value: allActiveTasks.length, icon: CheckSquare, color: 'text-purple-400' },
          { label: 'Due Today', value: todayTasks.length, icon: Clock, color: 'text-amber-400' },
          { label: 'Done Today', value: doneTodayCount, icon: CheckSquare, color: 'text-green-400' },
          { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
              Today&apos;s Tasks
              {todayTasks.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">
                  {todayTasks.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setTaskModalOpen(true)}
                size="sm"
                className="text-xs text-white gap-1"
                style={{ background: 'rgba(var(--accent-rgb), 0.3)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
              <Link href="/tasks" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                All tasks <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {tasksLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />)}</div>
          ) : todayTasks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-slate-500 text-sm">No tasks due today 🎉</p>
              <button onClick={() => setTaskModalOpen(true)} className="mt-2 text-xs underline" style={{ color: 'var(--accent-color)' }}>
                Add a task for today
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
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

          {/* Active tasks without due date */}
          {allActiveTasks.filter((t) => !t.due_date).length > 0 && (
            <>
              <h3 className="text-sm font-medium text-slate-500 mt-2">No due date</h3>
              <div className="space-y-2">
                {allActiveTasks.filter((t) => !t.due_date).slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column: Events + Notes */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Upcoming
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setEventModalOpen(true)}
                  size="sm"
                  className="text-xs text-white gap-1"
                  style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Link href="/calendar" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                  Calendar <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {eventsLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="glass-card p-4 text-center">
                <p className="text-slate-600 text-xs">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href="/calendar">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div
                        className="w-1 self-stretch rounded-full flex-shrink-0"
                        style={{ background: event.color ?? 'var(--accent-color)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.all_day ? formatDate(event.start_time) : formatDateTime(event.start_time)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                Recent Notes
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateNote}
                  size="sm"
                  className="text-xs text-white gap-1"
                  style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Link href="/notes" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                  All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {notesLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />)}</div>
            ) : recentNotes.length === 0 ? (
              <div className="glass-card p-4 text-center">
                <p className="text-slate-600 text-xs">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-lg">{note.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{note.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(note.updated_at)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSave={async (task) => { await createTask(task) }}
      />
      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onSave={async (evt) => { await createEvent(evt) }}
      />
    </div>
  )
}
