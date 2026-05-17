import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'], weight: ['800'], variable: '--font-brand' })

export const metadata: Metadata = {
  title: 'Tamdee — CRM สำหรับตัวแทนประกัน',
  description: 'Planner + CRM สำหรับตัวแทนประกันและนักขายเดี่ยว',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${nunito.variable}`}>
      <body className="h-full antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
