import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '600px' }}>
        <p style={{ fontSize: '12px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0F6E56', marginBottom: '1rem' }}>Ajax, Ontario</p>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '1.5rem', color: '#111' }}>Your council.<br />In plain sight.</h1>
        <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.7', marginBottom: '2.5rem' }}>Who donated to your councillor? How did they vote on the housing development down the street? This site exists because that information is public — it's just buried.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/council" style={{ padding: '12px 24px', background: '#0F6E56', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '500' }}>View council</Link>
          <Link href="/elections/2022" style={{ padding: '12px 24px', border: '1px solid #ddd', color: '#333', borderRadius: '10px', textDecoration: 'none' }}>2022 election results</Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '5rem', paddingTop: '4rem', borderTop: '1px solid #f0f0f0' }}>
        {[['7','Sitting councillors','/council'],['26','2022 candidates','/elections/2022'],['22.5%','Voter turnout','/elections/2022']].map(([v,l,h]) => (
          <Link key={l} href={h} style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111', marginBottom: '0.25rem' }}>{v}</div>
            <div style={{ fontSize: '14px', color: '#999' }}>{l}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
