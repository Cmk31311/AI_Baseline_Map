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
  serverExternalPackages: ['groq-sdk'],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental performance features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom', 'lucide-react', '@radix-ui/react-icons'],
    webpackBuildWorker: true,
    serverMinification: true,
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
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
        },
      };
      
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
}

module.exports = nextConfig
