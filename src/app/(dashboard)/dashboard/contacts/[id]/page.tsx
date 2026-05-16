import { getContactWithHistory, getContactActivity } from '../actions'
import { ContactDetail } from '@/components/contacts/contact-detail'
import { notFound } from 'next/navigation'

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, activity] = await Promise.all([
    getContactWithHistory(id),
    getContactActivity(id),
  ])
  if (!data) notFound()
  return (
    <ContactDetail
      contact={data.contact}
      history={data.history}
      linkedTasks={activity.tasks}
      linkedEvents={activity.events}
    />
  )
}
