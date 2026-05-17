import { getContactWithHistory } from '../../actions'
import { ContactForm } from '@/components/contacts/contact-form'
import { notFound } from 'next/navigation'

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getContactWithHistory(id)
  if (!data) notFound()

  return (
    <div className="p-5 max-w-2xl">
      <h1 className="text-xl font-800 text-[oklch(18%_0.012_254)] mb-6 tracking-tight">แก้ไข Contact</h1>
      <ContactForm contact={data.contact} />
    </div>
  )
}
