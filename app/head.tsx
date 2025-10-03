import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-baseline-map.vercel.app'),
  title: 'Baseline Map',
  description: 'Web features baseline compatibility checker',
  keywords: ['web features', 'baseline', 'compatibility', 'browser support'],
  openGraph: {
    title: 'Baseline Map',
    description: 'Web features baseline compatibility checker',
    type: 'website',
  },
}

export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      <meta name="format-detection" content="telephone=no" />
    </>
  )
}
