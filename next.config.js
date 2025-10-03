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
  
  // Aggressive performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  output: 'standalone',
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    unoptimized: false,
  },
  
  // Experimental performance features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
    webpackBuildWorker: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
    
    // Aggressive performance optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 100000,
        maxAsyncRequests: 6,
        maxInitialRequests: 4,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
        },
      };
      
      // Enable aggressive tree shaking and optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.concatenateModules = true;
      config.optimization.providedExports = true;
      config.optimization.innerGraph = true;
      
      // Minimize bundle size
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
    }
    
    return config;
  },
}

module.exports = nextConfig
