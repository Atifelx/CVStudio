import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CV Studio - Resume Editor',
  description: 'Professional resume editor with DOCX and PDF export',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
