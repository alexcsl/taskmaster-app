'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '@/lib/supabase/types'

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time')
    if (data) setEvents(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  async function createEvent(insert: Omit<CalendarEventInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('calendar_events')
      .insert({ ...insert, user_id: user.id })
      .select()
      .single()
    if (data) setEvents((prev) => [...prev, data])
    return data
  }

  async function updateEvent(id: string, update: CalendarEventUpdate) {
    const { data } = await supabase
      .from('calendar_events')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (data) setEvents((prev) => prev.map((e) => (e.id === id ? data : e)))
    return data
  }

  async function deleteEvent(id: string) {
    await supabase.from('calendar_events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, loading, createEvent, updateEvent, deleteEvent, refetch: fetchEvents }
}
