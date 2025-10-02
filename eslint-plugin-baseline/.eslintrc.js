module.exports = {
  plugins: ['baseline-compatibility'],
  rules: {
    'baseline-compatibility/check-baseline': ['warn', {
      baselineLevel: 'all',
      includePolyfills: true,
      includeAlternatives: true
    }]
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  }
};