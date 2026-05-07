'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotes } from '@/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Plus, FileText, Loader2, Trash2 } from 'lucide-react'

export default function NotesPage() {
  const router = useRouter()
  const { notes, loading, createNote, deleteNote } = useNotes()
  const [creating, setCreating] = useState(false)

  const topLevel = notes.filter((n) => !n.parent_id)

  async function handleCreateNote() {
    setCreating(true)
    const note = await createNote()
    if (note) router.push(`/notes/${note.id}`)
    setCreating(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-slate-400 text-sm mt-0.5">{topLevel.length} pages</p>
        </div>
        <Button
          onClick={handleCreateNote}
          disabled={creating}
          className="text-white font-semibold gap-2"
          style={{ background: 'var(--accent-color)' }}
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Page
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm mb-4">No pages yet. Start writing!</p>
          <Button
            onClick={handleCreateNote}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create first page
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topLevel.map((note) => {
            const children = notes.filter((n) => n.parent_id === note.id)
            return (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="group glass-card p-5 cursor-pointer hover:border-white/15 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg hover:shadow-black/20 relative"
              >
                <div className="text-2xl mb-2">{note.icon || '📄'}</div>
                <h3 className="font-semibold text-white text-sm truncate">{note.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{formatDate(note.updated_at)}</p>
                {children.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">{children.length} sub-page{children.length > 1 ? 's' : ''}</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
