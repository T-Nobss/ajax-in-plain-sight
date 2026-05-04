import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ajax in Plain Sight',
  description: 'Who donated to your councillor? How did they vote? Public data made searchable.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: 'white' }}>
        <nav style={{ borderBottom: '1px solid #f0f0f0', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontWeight: '600', color: '#111', textDecoration: 'none' }}>Ajax in Plain Sight</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Link href="/council" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px' }}>Council</Link>
              <Link href="/elections/2022" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px' }}>2022 Election</Link>
              <Link href="/about" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px' }}>About</Link>
              <Link href="/register" style={{ fontSize: '14px', fontWeight: '500', color: 'white', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: '#0F6E56' }}>Register to vote</Link>
            </div>
          </div>
        </nav>
        {children}
        <footer style={{ borderTop: '1px solid #f0f0f0', marginTop: '6rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
            <span>Ajax in Plain Sight · Data from public records under Ontario's Municipal Elections Act</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/council" style={{ color: '#999', textDecoration: 'none' }}>Council</Link>
              <Link href="/elections/2022" style={{ color: '#999', textDecoration: 'none' }}>Elections</Link>
              <Link href="/about" style={{ color: '#999', textDecoration: 'none' }}>About</Link>
              <a href="https://www.registertovoteon.ca" target="_blank" rel="noopener noreferrer" style={{ color: '#999', textDecoration: 'none' }}>Register</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
