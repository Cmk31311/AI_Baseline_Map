/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'src', 'lib'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
