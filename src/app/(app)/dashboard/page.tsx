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
import { formatDateTime, formatDate } from '@/lib/utils'
import { isToday, isFuture, parseISO, format } from 'date-fns'
import { Plus, CalendarDays, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

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
  const noDateTasks = tasks.filter((t) => t.status !== 'done' && !t.due_date).slice(0, 3)
  const upcomingEvents = events
    .filter((e) => isFuture(parseISO(e.start_time)) || isToday(parseISO(e.start_time)))
    .slice(0, 4)
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .filter((n) => !n.parent_id)
    .slice(0, 4)

  const activeTasks = tasks.filter((t) => t.status !== 'done').length
  const doneTodayCount = tasks.filter((t) =>
    t.status === 'done' && t.updated_at && isToday(parseISO(t.updated_at))
  ).length

  async function handleCreateNote() {
    const note = await createNote()
    if (note) router.push(`/notes/${note.id}`)
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      {/* Header — greeting style */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">{greeting()}</h1>

        {/* Inline stats — no heavy cards */}
        {!tasksLoading && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-sm">
            <span className="text-slate-400">
              <span className="text-white font-medium">{activeTasks}</span> active tasks
            </span>
            {todayTasks.length > 0 && (
              <span className="text-amber-400">
                <span className="font-medium">{todayTasks.length}</span> due today
              </span>
            )}
            {doneTodayCount > 0 && (
              <span className="text-emerald-400">
                <span className="font-medium">{doneTodayCount}</span> done today
              </span>
            )}
            {upcomingEvents.length > 0 && (
              <span className="text-sky-400">
                <span className="font-medium">{upcomingEvents.length}</span> upcoming events
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: tasks */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Today</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> add
                </button>
                <Link href="/tasks" className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-0.5">
                  all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {tasksLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-white/4 animate-pulse" />)}</div>
            ) : todayTasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-slate-600 text-sm">Nothing due today</p>
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="mt-1.5 text-xs underline underline-offset-2"
                  style={{ color: 'var(--accent-color)' }}
                >
                  plan something
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                ))}
              </div>
            )}
          </section>

          {/* Tasks with no date */}
          {!tasksLoading && noDateTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">No due date</h2>
              <div className="space-y-2">
                {noDateTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Upcoming events */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                Upcoming
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEventModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <Link href="/calendar" className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-0.5">
                  calendar <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {eventsLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-11 rounded-lg bg-white/4 animate-pulse" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-slate-600 text-sm py-2">No upcoming events</p>
            ) : (
              <div className="space-y-1.5">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href="/calendar">
                    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: event.color ?? 'var(--accent-color)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.all_day ? formatDate(event.start_time) : formatDateTime(event.start_time)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Notes
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateNote}
                  className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <Link href="/notes" className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-0.5">
                  all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {notesLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-11 rounded-lg bg-white/4 animate-pulse" />)}</div>
            ) : recentNotes.length === 0 ? (
              <p className="text-slate-600 text-sm py-2">No notes yet</p>
            ) : (
              <div className="space-y-1.5">
                {recentNotes.map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <span className="text-base leading-none">{note.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{note.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(note.updated_at)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

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
