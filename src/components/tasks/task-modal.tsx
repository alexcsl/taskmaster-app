'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { Task, TaskInsert } from '@/lib/supabase/types'
import { format } from 'date-fns'

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Omit<TaskInsert, 'user_id'>) => Promise<void>
  initial?: Partial<Task>
  title?: string
  parentId?: string | null
}

export function TaskModal({ open, onOpenChange, onSave, initial, title = 'New Task', parentId }: TaskModalProps) {
  const [taskTitle, setTaskTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [priority, setPriority] = useState<string>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(
    initial?.due_date ? format(new Date(initial.due_date), 'yyyy-MM-dd') : ''
  )
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false)
  const [recurrencePattern, setRecurrencePattern] = useState(initial?.recurrence_pattern ?? 'weekly')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!taskTitle.trim()) return
    setSaving(true)
    await onSave({
      title: taskTitle.trim(),
      notes: notes || null,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      parent_id: parentId ?? null,
      status: initial?.status ?? 'todo',
    })
    setSaving(false)
    onOpenChange(false)
    setTaskTitle('')
    setNotes('')
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
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title…"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="high" className="text-red-400">🔴 High</SelectItem>
                  <SelectItem value="medium" className="text-amber-400">🟡 Medium</SelectItem>
                  <SelectItem value="low" className="text-green-400">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Notes (Markdown)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes, instructions, or context… (supports markdown)"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-sm text-white font-medium">Recurring task</p>
              <p className="text-xs text-slate-500">Auto-creates next instance on completion</p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Repeat</Label>
              <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !taskTitle.trim()}
              className="flex-1 text-white font-semibold"
              style={{ background: 'var(--accent-color)' }}
            >
              {saving ? 'Saving…' : 'Save task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
