'use client'

export const dynamic = 'force-dynamic'

import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEvents } from '@/hooks/use-events'
import { EventModal } from '@/components/calendar/event-modal'
import { Button } from '@/components/ui/button'
import type { CalendarEvent } from '@/lib/supabase/types'
import { Plus, Upload, Loader2 } from 'lucide-react'

export default function CalendarPage() {
  const { events, loading, createEvent, updateEvent, deleteEvent, refetch } = useEvents()
  const [createOpen, setCreateOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time ?? undefined,
    allDay: e.all_day,
    backgroundColor: e.color ?? 'var(--accent-color)',
    borderColor: e.color ?? 'var(--accent-color)',
    extendedProps: { event: e },
  }))

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/calendar/import', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) {
      setImportMsg(`Imported ${json.imported} events`)
      refetch()
    } else {
      setImportMsg(json.error ?? 'Import failed')
    }
    setImporting(false)
    e.target.value = ''
  }

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">{events.length} events</p>
        </div>
        <div className="flex items-center gap-2">
          {importMsg && (
            <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg">{importMsg}</span>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".ics"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="border-white/10 text-slate-300 hover:bg-white/10 gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import .ics
          </Button>

          <Button
            onClick={() => { setSelectedDate(new Date()); setCreateOpen(true) }}
            className="text-white font-semibold gap-2"
            style={{ background: 'var(--accent-color)' }}
          >
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 glass-card p-4 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={fcEvents}
            editable
            selectable
            selectMirror
            height="100%"
            dateClick={(info) => {
              setSelectedDate(info.date)
              setCreateOpen(true)
            }}
            eventClick={(info) => {
              setEditEvent(info.event.extendedProps.event as CalendarEvent)
            }}
            eventDrop={async (info) => {
              await updateEvent(info.event.id, {
                start_time: info.event.start!.toISOString(),
                end_time: info.event.end?.toISOString() ?? null,
              })
            }}
            eventResize={async (info) => {
              await updateEvent(info.event.id, {
                end_time: info.event.end?.toISOString() ?? null,
              })
            }}
          />
        )}
      </div>

      {/* Create modal */}
      <EventModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDate={selectedDate}
        onSave={async (evt) => { await createEvent(evt) }}
      />

      {/* Edit modal */}
      {editEvent && (
        <EventModal
          open={!!editEvent}
          onOpenChange={(o) => !o && setEditEvent(null)}
          title="Edit Event"
          initial={editEvent}
          onSave={async (update) => { await updateEvent(editEvent.id, update); setEditEvent(null) }}
          onDelete={async () => { await deleteEvent(editEvent.id); setEditEvent(null) }}
        />
      )}
    </div>
  )
}
