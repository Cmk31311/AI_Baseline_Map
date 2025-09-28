import '../src/index.css'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { metadata } from './metadata'

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

export { metadata }
