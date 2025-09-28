import type { Metadata } from 'next'
import '../src/index.css'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'AI Baseline Map',
  description: 'Baseline Compatibility Analyzer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
