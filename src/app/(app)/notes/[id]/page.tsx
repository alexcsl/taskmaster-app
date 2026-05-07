'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNote, useNotes } from '@/hooks/use-notes'
import { BlockEditor } from '@/components/notes/block-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settings-store'
import type { Json } from '@/lib/supabase/types'
import {
  ChevronRight,
  Plus,
  Loader2,
  Trash2,
  AlignLeft,
  Code2,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import dynamicImport from 'next/dynamic'
import { formatDistanceToNow } from 'date-fns'

const MDEditor = dynamicImport(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { note, loading, updateNote } = useNote(id)
  const { notes, createNote, deleteNote } = useNotes()
  const { editorMode } = useSettingsStore()
  const [localMode, setLocalMode] = useState<'block' | 'markdown'>(editorMode)
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('')
  const [mdContent, setMdContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeout = useCallback(() => {}, [])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setIcon(note.icon ?? '')
    }
  }, [note])

  const debouncedSave = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>
      return (update: Parameters<typeof updateNote>[0]) => {
        clearTimeout(timer)
        timer = setTimeout(async () => {
          setSaving(true)
          await updateNote(update)
          setLastSaved(new Date())
          setSaving(false)
        }, 600)
      }
    })(),
    [updateNote]
  )

  function handleTitleChange(val: string) {
    setTitle(val)
    debouncedSave({ title: val })
  }

  function handleContentChange(content: Json) {
    debouncedSave({ content })
  }

  function handleMdChange(val?: string) {
    setMdContent(val ?? '')
    debouncedSave({ content: val ?? '' as unknown as Json })
  }

  async function handleCreateSubpage() {
    const newNote = await createNote({ parent_id: id })
    if (newNote) router.push(`/notes/${newNote.id}`)
  }

  async function handleDeleteSubpage(subId: string) {
    await deleteNote(subId)
    window.dispatchEvent(new Event('notesUpdated'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-500">Page not found</p>
        <Link href="/notes">
          <Button variant="outline" className="border-white/10 text-white">Back to notes</Button>
        </Link>
      </div>
    )
  }

  // Build breadcrumb
  const breadcrumb: Array<{ id: string; title: string; icon: string | null }> = []
  let current: typeof note | undefined = note
  while (current?.parent_id) {
    const parent = notes.find((n) => n.id === current!.parent_id)
    if (parent) {
      breadcrumb.unshift({ id: parent.id, title: parent.title, icon: parent.icon })
      current = parent
    } else break
  }

  const subpages = notes.filter((n) => n.parent_id === id)

  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 lg:px-12 py-8">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-6 text-sm text-slate-500">
          <Link href="/notes" className="hover:text-white transition-colors">Notes</Link>
          {breadcrumb.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/notes/${crumb.id}`} className="hover:text-white transition-colors">
                {crumb.icon || '📄'} {crumb.title}
              </Link>
            </span>
          ))}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white">{note.icon || '📄'} {note.title}</span>
        </nav>
      )}

      {/* Page icon + title */}
      <div className="mb-8">
        <button
          className="text-5xl mb-4 hover:opacity-70 transition-opacity"
          title="Change icon"
          onClick={() => {
            const emojis = ['📄', '✅', '📅', '🗒️', '💡', '⭐', '🔖', '📌', '🎯', '🚀']
            const next = emojis[(emojis.indexOf(icon || '📄') + 1) % emojis.length]
            setIcon(next)
            debouncedSave({ icon: next })
          }}
        >
          {icon || '📄'}
        </button>

        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-4xl font-bold text-white placeholder:text-slate-700 outline-none border-none resize-none"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setLocalMode('block')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all',
              localMode === 'block' ? 'text-white' : 'text-slate-400 hover:text-white'
            )}
            style={localMode === 'block' ? { background: 'rgba(var(--accent-rgb), 0.2)', color: 'var(--accent-color)' } : {}}
          >
            <AlignLeft className="w-3.5 h-3.5" /> Block Editor
          </button>
          <button
            onClick={() => setLocalMode('markdown')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all',
              localMode === 'markdown' ? 'text-white' : 'text-slate-400 hover:text-white'
            )}
            style={localMode === 'markdown' ? { background: 'rgba(var(--accent-rgb), 0.2)', color: 'var(--accent-color)' } : {}}
          >
            <Code2 className="w-3.5 h-3.5" /> Markdown
          </button>
        </div>

        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
          {lastSaved && !saving && (
            <span className="text-xs text-slate-600">Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
          )}

          <Button
            variant="outline"
            onClick={handleCreateSubpage}
            className="text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10 gap-1.5 h-8 px-3"
          >
            <Plus className="w-3 h-3" /> Sub-page
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="mb-8">
        {localMode === 'block' ? (
          <BlockEditor
            content={typeof note.content === 'string' ? null : note.content}
            onChange={handleContentChange}
          />
        ) : (
          <div data-color-mode="dark">
            <MDEditor
              value={typeof note.content === 'string' ? note.content : ''}
              onChange={handleMdChange}
              height={500}
              preview="live"
              className="!bg-transparent !border-white/10"
            />
          </div>
        )}
      </div>

      {/* Sub-pages */}
      {subpages.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Sub-pages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {subpages.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 group">
                <Link
                  href={`/notes/${sub.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 transition-all flex-1 min-w-0"
                >
                  <span>{sub.icon || '📄'}</span>
                  <span className="text-sm text-slate-300 truncate">{sub.title}</span>
                </Link>
                <button
                  onClick={() => handleDeleteSubpage(sub.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                  title="Delete sub-page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
