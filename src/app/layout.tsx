import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Nunito, Prompt, Sarabun } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'], weight: ['800'], variable: '--font-brand' })
const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['600', '700', '800'], variable: '--font-heading' })
const sarabun = Sarabun({ subsets: ['thai', 'latin'], weight: ['400', '500', '600'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Tamdee — CRM สำหรับตัวแทนประกัน',
  description: 'Planner + CRM สำหรับตัวแทนประกันและนักขายเดี่ยว',
  icons: {
    icon: '/tamdee-logo.png',
    apple: '/tamdee-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${nunito.variable} ${prompt.variable} ${sarabun.variable}`}>
      <body className="h-full antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
