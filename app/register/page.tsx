import Link from 'next/link'

export const metadata = { title: 'Register to Vote — Ajax in Plain Sight' }

export default function RegisterPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Register to vote</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '600px' }}>The next Ajax municipal election is October 26, 2026. Make sure you're on the voters' list.</p>
      <a href="https://www.registertovoteon.ca" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '14px 28px', background: '#0F6E56', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: '600' }}>Check your registration at registertovoteon.ca →</a>
    </main>
  )
}
