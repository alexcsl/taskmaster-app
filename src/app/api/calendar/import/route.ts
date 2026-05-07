import { createClient } from '@/lib/supabase/server'
import { parseICalFile } from '@/lib/ical'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  let events
  try {
    events = parseICalFile(text)
  } catch {
    return NextResponse.json({ error: 'Invalid iCal file' }, { status: 400 })
  }

  const inserts = events.map((e) => ({
    user_id: user.id,
    title: e.title,
    description: e.description,
    start_time: e.start_time,
    end_time: e.end_time,
    all_day: e.all_day,
    source: 'ical' as const,
    external_id: e.external_id,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('calendar_events') as any)
    .upsert(inserts, { onConflict: 'user_id,external_id', ignoreDuplicates: true })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: data?.length ?? 0 })
}
