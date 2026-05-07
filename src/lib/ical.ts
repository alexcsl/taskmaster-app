import ICAL from 'ical.js'

export interface ParsedEvent {
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  all_day: boolean
  external_id: string | null
}

export function parseICalFile(icalString: string): ParsedEvent[] {
  const jcalData = ICAL.parse(icalString)
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents('vevent')

  return vevents.map((vevent) => {
    const event = new ICAL.Event(vevent)
    const dtstart = event.startDate
    const dtend = event.endDate

    const allDay = dtstart.isDate

    return {
      title: event.summary || 'Untitled Event',
      description: event.description || null,
      start_time: dtstart.toJSDate().toISOString(),
      end_time: dtend ? dtend.toJSDate().toISOString() : null,
      all_day: allDay,
      external_id: event.uid || null,
    }
  })
}
