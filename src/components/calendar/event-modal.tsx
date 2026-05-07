'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Trash2 } from 'lucide-react'
import type { CalendarEvent, CalendarEventInsert } from '@/lib/supabase/types'
import { format } from 'date-fns'

const EVENT_COLORS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'
]

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: Omit<CalendarEventInsert, 'user_id'>) => Promise<void>
  onDelete?: () => Promise<void>
  initial?: Partial<CalendarEvent>
  defaultDate?: Date
  title?: string
}

export function EventModal({
  open, onOpenChange, onSave, onDelete, initial, defaultDate, title = 'New Event'
}: EventModalProps) {
  const defaultStart = defaultDate ?? new Date()
  const [eventTitle, setEventTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startTime, setStartTime] = useState(
    initial?.start_time
      ? format(new Date(initial.start_time), "yyyy-MM-dd'T'HH:mm")
      : format(defaultStart, "yyyy-MM-dd'T'HH:mm")
  )
  const [endTime, setEndTime] = useState(
    initial?.end_time
      ? format(new Date(initial.end_time), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(defaultStart.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
  )
  const [allDay, setAllDay] = useState(initial?.all_day ?? false)
  const [color, setColor] = useState(initial?.color ?? '#8b5cf6')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!eventTitle.trim()) return
    setSaving(true)
    await onSave({
      title: eventTitle.trim(),
      description: description || null,
      start_time: new Date(startTime).toISOString(),
      end_time: allDay ? null : new Date(endTime).toISOString(),
      all_day: allDay,
      color,
      source: 'manual',
    })
    setSaving(false)
    onOpenChange(false)
    setEventTitle('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Title</Label>
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title…"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
            <Label className="text-slate-300 text-sm">All day</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>

          {!allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Start</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">End</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Date</Label>
              <Input
                type="date"
                value={startTime.split('T')[0]}
                onChange={(e) => setStartTime(`${e.target.value}T00:00`)}
                className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
              rows={2}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Color</Label>
            <div className="flex items-center gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? '2px solid white' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {onDelete && (
              <Button
                variant="outline"
                onClick={async () => { await onDelete(); onOpenChange(false) }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !eventTitle.trim()}
              className="flex-1 text-white font-semibold"
              style={{ background: color }}
            >
              {saving ? 'Saving…' : 'Save event'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
