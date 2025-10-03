export const metadata = {
  metadataBase: new URL('https://ai-baseline-map.vercel.app'),
  title: {
    default: 'Baseline Map',
    template: '%s | Baseline Map'
  },
  description: 'Web features baseline compatibility checker - Check browser support and compatibility for modern web technologies',
  keywords: ['web features', 'baseline', 'compatibility', 'browser support', 'web standards', 'CSS', 'JavaScript', 'HTML5', 'web APIs'],
  authors: [{ name: 'Baseline Map Team' }],
  creator: 'Baseline Map',
  publisher: 'Baseline Map',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-baseline-map.vercel.app',
    title: 'Baseline Map - Web Features Compatibility Checker',
    description: 'Check browser support and compatibility for modern web technologies',
    siteName: 'Baseline Map',
  },
  twitter: {
    card: 'summary',
    title: 'Baseline Map - Web Features Compatibility Checker',
    description: 'Check browser support and compatibility for modern web technologies',
  },
  category: 'technology',
}
