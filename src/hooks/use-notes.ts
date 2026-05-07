'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Note, NoteInsert, NoteUpdate } from '@/lib/supabase/types'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('position')
      .order('updated_at', { ascending: false })
    if (data) setNotes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  async function createNote(insert: Omit<NoteInsert, 'user_id'> = {}): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('notes')
      .insert({ title: 'Untitled', ...insert, user_id: user.id })
      .select()
      .single()
    if (data) setNotes((prev) => [...prev, data])
    return data ?? null
  }

  async function updateNote(id: string, update: NoteUpdate) {
    const { data } = await supabase
      .from('notes')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (data) setNotes((prev) => prev.map((n) => (n.id === id ? data : n)))
    return data
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, loading, createNote, updateNote, deleteNote, refetch: fetchNotes }
}

export function useNote(id: string) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchNote = async () => {
      const { data } = await supabase.from('notes').select('*').eq('id', id).single()
      if (data) setNote(data)
      setLoading(false)
    }
    fetchNote()
  }, [id])

  async function updateNote(update: NoteUpdate) {
    const { data } = await supabase.from('notes').update(update).eq('id', id).select().single()
    if (data) setNote(data)
    return data
  }

  return { note, loading, updateNote }
}
