import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SignageLog AI — Log Investigation for Digital Signage',
  description: 'Paste device logs. AI finds the root cause and writes the customer reply.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-lg text-white">
            SignageLog <span className="text-violet-400">AI</span>
          </a>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/investigate" className="hover:text-white transition-colors">Investigate</a>
            <a href="/investigations" className="hover:text-white transition-colors">History</a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
