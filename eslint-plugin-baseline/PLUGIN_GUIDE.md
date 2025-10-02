# ESLint Baseline Plugin - Complete Guide

## 🎯 What This Plugin Does

The ESLint Baseline Plugin scans your JavaScript and CSS code for web features and tells you:

- ✅ **Safe to use** (Baseline - Widely Available)
- ⚠️ **Needs fallback** (Newly Baseline - Limited Support)  
- ❌ **Not Baseline** (Requires polyfill)

## 🚀 Quick Start

### 1. Install the Plugin

```bash
npm install --save-dev eslint-plugin-baseline
```

### 2. Configure ESLint

Add to your `.eslintrc.js` or `eslint.config.js`:

```javascript
module.exports = {
  plugins: ['baseline'],
  rules: {
    'baseline/check-baseline': ['warn', {
      baselineLevel: 'all',
      includePolyfills: true,
      includeAlternatives: true
    }]
  }
};
```

### 3. Test It Out

Create a test file with various web features:

```javascript
// test.js
async function example() {
  // ✅ Baseline features
  const response = await fetch('/api');
  const data = response?.json();
  const result = data ?? 'default';
  
  // ⚠️ Newly baseline features
  const lastItem = array.at(-1);
  const cloned = structuredClone(data);
  
  // ❌ Not baseline features
  const grouped = array.group(item => item.type);
}
```

Run ESLint:

```bash
npx eslint test.js
```

## 📋 Configuration Options

### baselineLevel
- `"high"`: Only check widely available features
- `"low"`: Check newly available and limited features  
- `"all"`: Check all features (default)

### includePolyfills
- `true`: Show polyfill suggestions (default)
- `false`: Hide polyfill suggestions

### includeAlternatives
- `true`: Show alternative syntax suggestions (default)
- `false`: Hide alternative suggestions

## 🎨 Example Output

When you run ESLint, you'll see messages like:

```
test.js
  5:15  warning  ✅ Fetch API is Baseline (Widely Available)  baseline/check-baseline
  6:15  warning  ✅ Optional Chaining is Baseline (Widely Available)  baseline/check-baseline
  7:15  warning  ✅ Nullish Coalescing is Baseline (Widely Available)  baseline/check-baseline
  10:15  warning  ⚠️ Array.at() is newly Baseline  baseline/check-baseline
  11:15  warning  ⚠️ Structured Clone is newly Baseline  baseline/check-baseline
  14:15  warning  ❌ Array Grouping is not Baseline - needs polyfill  baseline/check-baseline
```

## 🔧 Advanced Configuration

### Different Baseline Levels

```javascript
// Only check for widely available features
'baseline/check-baseline': ['warn', { baselineLevel: 'high' }]

// Only check for newly available features
'baseline/check-baseline': ['warn', { baselineLevel: 'low' }]

// Check all features (default)
'baseline/check-baseline': ['warn', { baselineLevel: 'all' }]
```

### Custom Messages

```javascript
'baseline/check-baseline': ['error', {
  baselineLevel: 'all',
  includePolyfills: true,
  includeAlternatives: false
}]
```

## 🎯 Supported Features

### JavaScript Features

| Feature | Baseline Status | Message |
|---------|----------------|---------|
| `fetch()` | ✅ High | Safe to use |
| `async/await` | ✅ High | Safe to use |
| `?.` (Optional Chaining) | ✅ High | Safe to use |
| `??` (Nullish Coalescing) | ✅ High | Safe to use |
| `#private` (Private Fields) | ⚠️ Low | Newly baseline |
| `array.at()` | ⚠️ Low | Newly baseline |
| `structuredClone()` | ⚠️ Low | Newly baseline |
| `array.group()` | ❌ False | Needs polyfill |

### CSS Features

| Feature | Baseline Status | Message |
|---------|----------------|---------|
| `display: grid` | ✅ High | Safe to use |
| `display: flex` | ✅ High | Safe to use |
| `var(--custom)` | ✅ High | Safe to use |
| `@container` | ⚠️ Low | Newly baseline |
| `subgrid` | ⚠️ Low | Newly baseline |
| `margin-inline-start` | ⚠️ Low | Newly baseline |
| `@layer` | ⚠️ Low | Newly baseline |
| `color-mix()` | ⚠️ Low | Newly baseline |
| `anchor-name` | ❌ False | Needs polyfill |

## 🔗 Integration with VS Code

This plugin works great with the [Baseline Map VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ckhadar.baseline-map-extension):

1. **VS Code Extension**: Hover over features to see baseline info
2. **ESLint Plugin**: Get warnings while coding
3. **Combined**: Complete baseline compatibility checking

## 🛠️ Development

### Building the Plugin

```bash
npm run build
```

### Testing the Plugin

```bash
npm test
```

### Project Structure

```
eslint-plugin-baseline/
├── src/
│   └── index.ts          # Main plugin code
├── lib/                  # Compiled JavaScript
├── test/                 # Test files
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Documentation
```

## 🎉 Benefits

1. **Instant Feedback**: Know immediately if a feature is safe to use
2. **No Extra Steps**: Works automatically with your existing ESLint setup
3. **Smart Suggestions**: Get polyfills and alternatives automatically
4. **Comprehensive**: Covers both CSS and JavaScript features
5. **Configurable**: Choose what level of checking you want

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test your changes
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

---

**Happy coding with baseline compatibility! 🚀**
