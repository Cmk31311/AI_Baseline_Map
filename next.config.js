/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'src', 'lib'],
  },
  serverExternalPackages: [],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Experimental performance features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom', 'lucide-react'],
    webpackBuildWorker: true,
  },
  
  webpack: (config, { dev, isServer }) => {
    // Exclude VS Code extension and ESLint plugin directories from compilation
    config.module = {
      ...config.module,
      rules: config.module.rules.map((rule) => {
        if (typeof rule === 'object' && rule.test && rule.test.toString().includes('tsx?')) {
          return {
            ...rule,
            exclude: [
              ...(Array.isArray(rule.exclude) ? rule.exclude : [rule.exclude || /node_modules/]),
              /vscode-extension\/.*/,
              /eslint-plugin-baseline\/.*/,
            ],
          };
        }
        return rule;
      }),
    };
    
    // Add fallback for vscode module
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        'vscode': false,
      },
    };
    
    // Performance optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
