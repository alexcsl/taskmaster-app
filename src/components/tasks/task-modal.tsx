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
import { cn } from '@/lib/utils'

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Omit<TaskInsert, 'user_id'>) => Promise<void>
  initial?: Partial<Task>
  title?: string
  parentId?: string | null
}

export function TaskModal({ open, onOpenChange, onSave, initial, title = 'New Task', parentId }: TaskModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single')

  // Single mode state
  const [taskTitle, setTaskTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [priority, setPriority] = useState<string>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(
    initial?.due_date ? format(new Date(initial.due_date), 'yyyy-MM-dd') : ''
  )
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false)
  const [recurrencePattern, setRecurrencePattern] = useState(initial?.recurrence_pattern ?? 'weekly')

  // Bulk mode state
  const [bulkText, setBulkText] = useState('')
  const [bulkPriority, setBulkPriority] = useState('medium')
  const [bulkDueDate, setBulkDueDate] = useState('')

  const [saving, setSaving] = useState(false)

  function reset() {
    setTaskTitle('')
    setNotes('')
    setDueDate('')
    setBulkText('')
    setBulkDueDate('')
  }

  async function handleSaveSingle() {
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
    reset()
  }

  async function handleSaveBulk() {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    setSaving(true)
    for (const line of lines) {
      await onSave({
        title: line,
        notes: null,
        priority: bulkPriority,
        due_date: bulkDueDate ? new Date(bulkDueDate).toISOString() : null,
        is_recurring: false,
        recurrence_pattern: null,
        parent_id: parentId ?? null,
        status: 'todo',
      })
    }
    setSaving(false)
    onOpenChange(false)
    reset()
  }

  const bulkCount = bulkText.split('\n').filter((l) => l.trim()).length

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="glass border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        {/* Mode tabs */}
        {!initial && (
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/8 w-fit">
            {(['single', 'bulk'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-medium transition-all',
                  mode === m ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                )}
                style={mode === m ? { background: 'rgba(var(--accent-rgb), 0.2)', color: 'var(--accent-color)' } : {}}
              >
                {m === 'single' ? 'Single task' : 'Quick add multiple'}
              </button>
            ))}
          </div>
        )}

        {mode === 'single' ? (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title…"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSingle()}
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
              <Label className="text-slate-300 text-sm">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes or context… (markdown supported)"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none min-h-[72px]"
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-sm text-white font-medium">Recurring</p>
                <p className="text-xs text-slate-500">Auto-creates next on completion</p>
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

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSingle}
                disabled={saving || !taskTitle.trim()}
                className="flex-1 text-white font-semibold"
                style={{ background: 'var(--accent-color)' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Tasks — one per line</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Buy groceries\nCall dentist\nFinish project report\nReview pull requests"}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 resize-none min-h-[140px] font-mono text-sm"
                autoFocus
              />
              {bulkCount > 0 && (
                <p className="text-xs text-slate-500">{bulkCount} task{bulkCount !== 1 ? 's' : ''} will be created</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Priority for all</Label>
                <Select value={bulkPriority} onValueChange={setBulkPriority}>
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
                <Label className="text-slate-300 text-sm">Due date (optional)</Label>
                <Input
                  type="date"
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBulk}
                disabled={saving || bulkCount === 0}
                className="flex-1 text-white font-semibold"
                style={{ background: 'var(--accent-color)' }}
              >
                {saving ? 'Adding…' : `Add ${bulkCount > 0 ? bulkCount : ''} task${bulkCount !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
