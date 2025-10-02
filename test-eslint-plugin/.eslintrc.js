module.exports = {
  plugins: ['baseline-compatibility'],
  rules: {
    'baseline-compatibility/check-baseline': 'warn'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  }
};
