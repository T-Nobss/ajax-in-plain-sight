import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CouncillorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: person } = await supabase.from('persons').select('id, full_name, slug, email').eq('slug', slug).single()
  if (!person) notFound()
  const { data: role } = await supabase.from('roles').select('title, ward').eq('person_id', person.id).is('end_date', null).single()
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <Link href="/council" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>Back to council</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#111' }}>{person.full_name}</h1>
          {role && <p style={{ color: '#666', fontSize: '14px' }}>{(role as any).title}{(role as any).ward ? ` - ${(role as any).ward}` : ''}</p>}
        </div>
        <span style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: '12px', fontWeight: '500', padding: '6px 12px', borderRadius: '99px', border: '1px solid #9FE1CB' }}>Sitting councillor</span>
      </div>
      {person.email && <div style={{ marginBottom: '2rem' }}><a href={`mailto:${person.email}`} style={{ fontSize: '14px', color: '#0F6E56', textDecoration: 'none' }}>{person.email}</a></div>}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href={`/council/${slug}/votes`} style={{ flex: 1, textAlign: 'center', padding: '14px', background: '#f9f9f7', border: '1px solid #eee', borderRadius: '10px', textDecoration: 'none', color: '#111', fontWeight: '500', fontSize: '14px' }}>Voting record</Link>
        <Link href={`/council/${slug}/donors`} style={{ flex: 1, textAlign: 'center', padding: '14px', background: '#f9f9f7', border: '1px solid #eee', borderRadius: '10px', textDecoration: 'none', color: '#111', fontWeight: '500', fontSize: '14px' }}>Campaign donors</Link>
        <Link href={`/elections/2022/${slug}`} style={{ flex: 1, textAlign: 'center', padding: '14px', background: '#f9f9f7', border: '1px solid #eee', borderRadius: '10px', textDecoration: 'none', color: '#111', fontWeight: '500', fontSize: '14px' }}>2022 result</Link>
      </div>
    </main>
  )
}
