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
  webpack: (config) => {
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
    
    return config;
  },
}

module.exports = nextConfig
