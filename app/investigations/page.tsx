'use client'

import { useEffect, useState } from 'react'
import type { Investigation } from '@/lib/types'

const SEVERITY_STYLE: Record<string, string> = {
  LOW: 'text-green-400 bg-green-400/10',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10',
  HIGH: 'text-orange-400 bg-orange-400/10',
  CRITICAL: 'text-red-400 bg-red-400/10',
}

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investigations')
      .then((r) => r.json())
      .then((data: Investigation[]) => setInvestigations(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Investigations</h1>
        <a href="/investigate" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          New →
        </a>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && investigations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No investigations in this session.</p>
          <a href="/investigate" className="text-violet-400 hover:underline">Start your first investigation →</a>
        </div>
      )}

      <div className="space-y-3">
        {investigations.map((inv) => (
          <a
            key={inv.id}
            href={`/investigations/view?id=${inv.id}`}
            className="block bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-white">{inv.title}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_STYLE[inv.severity]}`}>
                {inv.severity}
              </span>
            </div>
            <p className="text-gray-400 text-sm truncate">{inv.rootCause}</p>
            <p className="text-gray-600 text-xs mt-2">
              {inv.events.length} events · {inv.affectedSystem} · {new Date(inv.createdAt).toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
