import { ContactForm } from '@/components/contacts/contact-form'

export default function NewContactPage() {
  return (
    <div className="p-5 max-w-2xl">
      <h1 className="text-xl font-800 text-[oklch(18%_0.012_254)] mb-6 tracking-tight">เพิ่ม Contact ใหม่</h1>
      <ContactForm />
    </div>
  )
}
