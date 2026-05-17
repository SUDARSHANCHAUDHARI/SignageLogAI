'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Investigation } from '@/lib/types'

const SEVERITY_STYLE: Record<string, string> = {
  LOW: 'text-green-400 bg-green-400/10 border-green-400/20',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const LEVEL_COLOR: Record<string, string> = {
  FATAL: 'text-red-500',
  ERROR: 'text-red-400',
  WARN: 'text-yellow-400',
  INFO: 'text-blue-400',
  DEBUG: 'text-gray-500',
  UNKNOWN: 'text-gray-600',
}

function exportMarkdown(inv: Investigation) {
  const md = `# Investigation: ${inv.title}

**Severity:** ${inv.severity}
**Affected System:** ${inv.affectedSystem}
**Date:** ${new Date(inv.createdAt).toLocaleString()}

## Root Cause
${inv.rootCause}

## Customer Reply
${inv.customerReply}

## Recommended Steps
${inv.recommendedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Developer Notes
${inv.developerNotes}

## Event Timeline
${inv.events.map((e) => `- [${e.level}][${e.category}] ${e.timestamp ?? ''}: ${e.message}`).join('\n')}
`
  const blob = new Blob([md], { type: 'text/markdown' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `investigation-${inv.id}.md`
  a.click()
}

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [inv, setInv] = useState<Investigation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/investigations/${id}`)
      .then((r) => r.json())
      .then((data: Investigation & { error?: string }) => {
        if (data.error) setError(data.error)
        else setInv(data)
      })
  }, [id])

  if (error) return <div className="max-w-3xl mx-auto px-6 py-12 text-red-400">{error}</div>
  if (!inv) return <div className="max-w-3xl mx-auto px-6 py-12 text-gray-500">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{inv.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date(inv.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${SEVERITY_STYLE[inv.severity]}`}>{inv.severity}</span>
          <button onClick={() => exportMarkdown(inv)} className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg px-3 py-1 transition-colors">
            Export .md
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Events', value: inv.events.length },
          { label: 'Affected system', value: inv.affectedSystem },
          { label: 'Confidence', value: inv.confidence },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className="text-white font-semibold text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-2">Root Cause</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{inv.rootCause}</p>
      </div>

      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-2">Customer Reply</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{inv.customerReply}</p>
        <button onClick={() => navigator.clipboard.writeText(inv.customerReply)} className="mt-3 text-violet-400 text-xs hover:text-violet-300">
          Copy reply →
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-3">Recommended Steps</h2>
        <ol className="space-y-1.5">
          {inv.recommendedSteps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </div>

      {inv.events.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-3">Event Timeline ({inv.events.length})</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
            {inv.events.map((e, i) => (
              <div key={i} className="flex gap-2 text-gray-400">
                <span className={`shrink-0 ${LEVEL_COLOR[e.level]}`}>[{e.level}]</span>
                <span className="text-gray-600 shrink-0">[{e.category}]</span>
                <span className="truncate">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-2">Developer Notes</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{inv.developerNotes}</p>
      </div>
    </div>
  )
}
