'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/supabase'

export default function VotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const [votes, setVotes] = useState<any[]>([])
  const [name, setName] = useState('')
  const [filter, setFilter] = useState<'all' | 'for' | 'against' | 'absent'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { slug } = await params
      const r1 = await fetch('/api/council')
      if (!r1.ok) { setError('Could not load council data'); setLoading(false); return }
      const councillors = await r1.json()
      const person = councillors.find((c: any) => c.slug === slug)
      if (!person) { setError(`No councillor found for slug "${slug}"`); setLoading(false); return }
      setName(person.full_name)

      const r2 = await fetch(`/api/votes/${person.id}`)
      if (!r2.ok) { setError('Could not load votes'); setLoading(false); return }
      setVotes(await r2.json())
      setLoading(false)
    })()
  }, [params])

  const filtered = filter === 'all' ? votes : votes.filter(v => v.position === filter)
  const total = votes.length
  const pctFor = total > 0 ? Math.round((votes.filter(v => v.position === 'for').length / total) * 100) : 0
  const against = votes.filter(v => v.position === 'against').length

  const posClass = (p: string) =>
    p === 'for' ? 'bg-emerald-50 text-emerald-700' :
    p === 'against' ? 'bg-red-50 text-red-700' :
    'bg-gray-100 text-gray-400'

  if (loading) return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-56" />
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
    </main>
  )

  if (error) return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/council" className="text-xs text-gray-400 hover:text-teal-600">← Council</Link>
      <p className="mt-6 text-red-500 text-sm">{error}</p>
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href="/council" className="text-xs text-gray-400 hover:text-teal-600">← All councillors</Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{name}</h1>
      <p className="text-gray-400 text-sm mb-8">Voting record</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['Total votes', total], ['Voted for', `${pctFor}%`], ['Against', against]].map(([label, val]) => (
          <div key={label as string} className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'for', 'against', 'absent'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'
            }`}>
            {f === 'all' ? `All (${total})` : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">
            {total === 0
              ? 'No vote records yet. The minutes scraper needs to run first.'
              : `No votes matching "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date', 'Motion', 'Vote', 'Result'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap align-top">
                    {v.motion?.meeting?.meeting_date ? formatDate(v.motion.meeting.meeting_date) : '—'}
                    <div className="text-gray-300 mt-0.5">{v.motion?.meeting?.committee}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 align-top">
                    {v.motion?.meeting?.source_url ? (
                      <a href={v.motion.meeting.source_url} target="_blank" rel="noopener noreferrer"
                        className="hover:text-teal-600 transition-colors">
                        {v.motion?.title ?? '—'}
                      </a>
                    ) : v.motion?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${posClass(v.position)}`}>
                      {v.position}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-medium align-top ${
                    v.motion?.outcome === 'CARRIED' ? 'text-emerald-600' :
                    v.motion?.outcome === 'LOST' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {v.motion?.outcome ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-4">
        Source: Ajax Town Council meeting minutes ·{' '}
        <a href="https://events.ajax.ca/Meetings" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500">
          events.ajax.ca
        </a>
      </p>
    </main>
  )
}
