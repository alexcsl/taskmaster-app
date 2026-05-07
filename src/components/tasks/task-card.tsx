'use client'

import { useState } from 'react'
import { cn, priorityColors, priorityBgColors, formatDate, type Priority } from '@/lib/utils'
import type { Task } from '@/lib/supabase/types'
import { useTasks } from '@/hooks/use-tasks'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { TaskModal } from './task-modal'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  Calendar,
  FileText,
  MoreHorizontal,
  Edit,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ReactMarkdown from 'react-markdown'

interface TaskCardProps {
  task: Task
  onToggle: (id: string, status: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, update: Partial<Task>) => void
  depth?: number
}

export function TaskCard({ task, onToggle, onDelete, onUpdate, depth = 0 }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addSubtaskOpen, setAddSubtaskOpen] = useState(false)
  const { tasks: subtasks, createTask: createSubtask } = useTasks(task.id)

  const isDone = task.status === 'done'
  const priority = task.priority as Priority

  return (
    <div className={cn('group', depth > 0 && 'ml-6 border-l border-white/5 pl-4')}>
      <div className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-all duration-150',
        'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]',
        isDone && 'opacity-60'
      )}>
        {/* Checkbox */}
        <div className="flex items-center pt-0.5">
          <Checkbox
            checked={isDone}
            onCheckedChange={() => onToggle(task.id, task.status)}
            className="border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-sm font-medium',
              isDone ? 'line-through text-slate-500' : 'text-white'
            )}>
              {task.title}
            </span>

            {/* Priority badge */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-1.5 py-0 border',
                priorityColors[priority],
                priorityBgColors[priority]
              )}
            >
              {task.priority}
            </Badge>

            {/* Recurring badge */}
            {task.is_recurring && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-400 bg-blue-400/10 border-blue-400/20">
                <RefreshCw className="w-2.5 h-2.5 mr-1" />
                {task.recurrence_pattern}
              </Badge>
            )}
          </div>

          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">{formatDate(task.due_date)}</span>
            </div>
          )}

          {/* Notes toggle */}
          {task.notes && (
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{notesExpanded ? 'Hide notes' : 'Show notes'}</span>
              {notesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {notesExpanded && task.notes && (
            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/5 prose prose-invert prose-sm max-w-none text-slate-300">
              <ReactMarkdown>{task.notes}</ReactMarkdown>
            </div>
          )}

          {/* Subtasks count */}
          {subtasks.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>{subtasks.filter((s) => s.status === 'done').length}/{subtasks.length} subtasks</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setAddSubtaskOpen(true)}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Add subtask"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
              <DropdownMenuItem onClick={() => setEditOpen(true)} className="hover:bg-white/10 cursor-pointer">
                <Edit className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="hover:bg-red-500/10 text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subtasks */}
      {expanded && subtasks.length > 0 && (
        <div className="mt-1 space-y-1">
          {subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      <TaskModal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Task"
        initial={task}
        onSave={async (update) => {
          onUpdate(task.id, update)
        }}
      />

      {/* Add subtask modal */}
      <TaskModal
        open={addSubtaskOpen}
        onOpenChange={setAddSubtaskOpen}
        title="Add Subtask"
        parentId={task.id}
        onSave={async (insert) => {
          await createSubtask(insert)
          setExpanded(true)
        }}
      />
    </div>
  )
}
