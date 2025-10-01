/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'src', 'lib'],
  },
  serverExternalPackages: [],
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
