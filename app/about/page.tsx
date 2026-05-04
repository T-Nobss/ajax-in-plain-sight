import Link from 'next/link'

export const metadata = { title: 'About — Ajax in Plain Sight' }

export default function AboutPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>About this project</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '600px' }}>Ajax in Plain Sight makes local government data searchable. Who donated to your councillor? How did they vote? This information is public — it's just buried.</p>
      <p style={{ fontSize: '12px', color: '#999' }}>All data sourced from public records under Ontario's Municipal Elections Act.</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="https://www.registertovoteon.ca" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#0F6E56', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>Register to vote →</a>
      </div>
    </main>
  )
}
