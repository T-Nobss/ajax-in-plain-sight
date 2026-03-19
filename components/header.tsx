import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            APS
          </div>
          <span className="hidden sm:inline font-bold text-foreground">Ajax in Plain Sight</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/council" className="text-sm text-foreground hover:text-primary transition-colors">
            Council
          </Link>
          <Link href="/elections/2022" className="text-sm text-foreground hover:text-primary transition-colors">
            Elections
          </Link>
          <Link href="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Register to Vote
          </Link>
        </nav>
      </div>
    </header>
  )
}
