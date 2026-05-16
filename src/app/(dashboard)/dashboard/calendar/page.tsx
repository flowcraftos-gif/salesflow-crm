import { getEvents } from './actions'
import { CalendarView } from './calendar-view'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const now = new Date()
  const currentMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const events = await getEvents(currentMonth)

  return (
    <div className="p-5">
      <CalendarView month={currentMonth} initialEvents={events} />
    </div>
  )
}
