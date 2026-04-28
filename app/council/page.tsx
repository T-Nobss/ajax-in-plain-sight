import Link from 'next/link'
import { getSittingCouncillors } from '@/lib/db'

export const revalidate = 3600

export const metadata = {
  title: 'Town Council — Ajax in Plain Sight',
}

export default async function CouncilPage() {
  let councillors: Awaited<ReturnType<typeof getSittingCouncillors>> = []
  let dbError = false

  try {
    councillors = await getSittingCouncillors()
  } catch {
    dbError = true
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
          Current term 2022–2026
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Town Council</h1>
        <p className="text-gray-500 text-lg">
          {councillors.length > 0
            ? `${councillors.length} sitting members`
            : 'Ajax Town Council'}
          {' · '}Voting records and campaign donors for each member.
        </p>
      </div>

      {dbError && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Could not connect to database. Check that NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel environment variables.
        </div>
      )}

      {!dbError && councillors.length === 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Database connected but no councillors found. Run the seed script to populate data.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {councillors.map((c) => (
          <div key={c.id} className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-tight">{c.full_name}</h2>
                <p className="text-teal-700 text-sm font-medium mt-0.5">{c.role?.title}</p>
                {c.role?.ward && <p className="text-gray-400 text-xs mt-0.5">{c.role.ward}</p>}
              </div>
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-xs text-gray-400 hover:text-teal-600">
                  Email
                </a>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Link
                href={`/council/${c.slug}/votes`}
                className="flex-1 text-center text-xs font-medium py-2 px-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors"
              >
                Voting record
              </Link>
              <Link
                href={`/council/${c.slug}/donors`}
                className="flex-1 text-center text-xs font-medium py-2 px-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors"
              >
                Campaign donors
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
