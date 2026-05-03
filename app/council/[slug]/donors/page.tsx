'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDollars } from '@/lib/supabase'
import type { Donation } from '@/lib/supabase'

export default function DonorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [name, setName] = useState('')
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

      const r2 = await fetch(`/api/donors/${person.id}`)
      if (!r2.ok) { setError('Could not load donations'); setLoading(false); return }
      setDonations(await r2.json())
      setLoading(false)
    })()
  }, [params])

  const total = donations.reduce((s, d) => s + d.amount_cents, 0)
  const largest = donations[0]?.amount_cents ?? 0

  // Build Form 4 URL from name — matches the ajax.ca URL pattern
  const form4Url = name
    ? `https://www.ajax.ca/en/inside-townhall/resources/Documents/${
        name.toUpperCase().replace(/\s+/g, '-')
      }---Financial-Statements.pdf`
    : null

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
      <p className="text-gray-400 text-sm mb-8">Campaign finance — 2022 election</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['Total raised', formatDollars(total)], ['Named donors', donations.length], ['Largest donation', formatDollars(largest)]].map(([label, val]) => (
          <div key={label as string} className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border-l-2 border-amber-300 px-4 py-3 rounded-r-lg mb-6 text-xs text-amber-800">
        Only donations over $100 are individually disclosed under Ontario's <em>Municipal Elections Act</em>.
        {form4Url && (
          <> · <a href={form4Url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
            View original Form 4 →
          </a></>
        )}
      </div>

      {donations.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No donor records yet.</p>
          <p className="text-gray-300 text-xs mt-2">Run the Form 4 parser to populate donation data.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Donor', 'Address', 'Amount', 'Type'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">{d.donor_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{d.donor_address ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-gray-700 text-right">{formatDollars(d.amount_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.contribution_type === 'goods_services' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {d.contribution_type === 'goods_services' ? 'goods/services' : 'monetary'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-4">
        Source: Form 4 Financial Statement ·{' '}
        <a href="https://www.ajax.ca/en/inside-townhall/elections.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500">
          ajax.ca/elections
        </a>
      </p>
    </main>
  )
}
