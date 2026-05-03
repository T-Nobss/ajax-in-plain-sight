import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ajax in Plain Sight',
  description: 'Municipal election data and council information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Sticky Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side: Site name */}
              <Link
                href="/"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Ajax in Plain Sight
              </Link>

              {/* Right side: Navigation links and button */}
              <div className="flex items-center gap-6">
                <Link
                  href="/council"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Council
                </Link>
                <Link
                  href="/elections/2022"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Elections 2022
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors"
                >
                  Register to vote
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Ajax in Plain Sight
                </h3>
                <p className="text-xs text-gray-600">
                  Municipal election data and council information for Ontario municipalities.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Navigation
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/council"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Council
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/elections/2022"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Elections 2022
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      About
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Legal
                </h3>
                <p className="text-xs text-gray-600">
                  This site contains data subject to Ontario&apos;s Municipal Elections Act.
                </p>
              </div>
              <div>
                <Link
                  href="/register"
                  className="inline-block px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors"
                >
                  Register to vote
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                © {new Date().getFullYear()} Ajax in Plain Sight. Data compiled from Ontario&apos;s Municipal Elections Act records.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
