'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { FileText, Plus, ChevronRight } from 'lucide-react'

export function NoteTree() {
  const pathname = usePathname()
  const [notes, setNotes] = useState<Note[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('position')
      if (data) setNotes(data)
    }
    fetchNotes()
  }, [])

  async function createNote(parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: 'Untitled', parent_id: parentId ?? null })
      .select()
      .single()
    if (data) setNotes((prev) => [...prev, data])
  }

  const topLevel = notes.filter((n) => !n.parent_id)

  function renderNode(note: Note, depth = 0) {
    const children = notes.filter((n) => n.parent_id === note.id)
    const isExpanded = expanded.has(note.id)
    const isActive = pathname === `/notes/${note.id}`

    return (
      <div key={note.id}>
        <div className={cn(
          'flex items-center gap-1 py-1 px-2 rounded-md text-sm group cursor-pointer transition-colors',
          isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5',
          depth > 0 && 'ml-3'
        )}
          style={isActive ? { background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-color)' } : {}}
        >
          {children.length > 0 && (
            <button
              onClick={() => setExpanded((prev) => {
                const next = new Set(prev)
                next.has(note.id) ? next.delete(note.id) : next.add(note.id)
                return next
              })}
              className="flex-shrink-0"
            >
              <ChevronRight className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
            </button>
          )}
          {children.length === 0 && <div className="w-3" />}

          <Link href={`/notes/${note.id}`} className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-sm">{note.icon || '📄'}</span>
            <span className="truncate text-xs">{note.title}</span>
          </Link>

          <button
            onClick={() => createNote(note.id)}
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {isExpanded && children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pages</span>
        <button
          onClick={() => createNote()}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {topLevel.map((note) => renderNode(note))}
      {topLevel.length === 0 && (
        <div className="text-xs text-slate-600 px-2 py-1">No pages yet</div>
      )}
    </div>
  )
}
