# ESLint Baseline Compatibility Plugin - Setup Guide

## 🚀 Quick Start

The **eslint-plugin-baseline-compatibility** plugin helps developers identify web features that may need polyfills or alternatives for better browser compatibility. It checks your code against the [Web Baseline](https://web.dev/baseline/) standards.

## 📦 Installation

```bash
npm install --save-dev eslint-plugin-baseline-compatibility
```

## ⚙️ Configuration

### For ESLint v9+ (Flat Config)

Create an `eslint.config.js` file in your project root:

```javascript
import baselinePlugin from 'eslint-plugin-baseline-compatibility';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      'baseline-compatibility': baselinePlugin.default
    },
    rules: {
      'baseline-compatibility/check-baseline': 'warn'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'baseline-compatibility': baselinePlugin.default
    },
    rules: {
      'baseline-compatibility/check-baseline': 'warn'
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];
```

### For TypeScript Projects

Install the TypeScript parser:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### For ESLint v8 (Legacy Config)

Create a `.eslintrc.js` file:

```javascript
const baselinePlugin = require('eslint-plugin-baseline-compatibility');

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
```

## 🎯 Rule Configuration

The `check-baseline` rule accepts the following options:

```javascript
'baseline-compatibility/check-baseline': ['warn', {
  baselineLevel: 'all',        // 'high' | 'low' | 'all'
  includePolyfills: true,      // Show polyfill suggestions
  includeAlternatives: true    // Show alternative suggestions
}]
```

### Options:

- **`baselineLevel`**: Which baseline levels to check
  - `'high'`: Only check widely available features
  - `'low'`: Check newly available features
  - `'all'`: Check all features (default)

- **`includePolyfills`**: Show polyfill recommendations for non-baseline features
- **`includeAlternatives`**: Show alternative approaches for non-baseline features

## 🧪 Testing the Plugin

Create a test file `test.js`:

```javascript
// Test file for ESLint Baseline Plugin
async function example() {
  // ✅ Baseline features (should show as safe)
  const response = await fetch('/api');
  const data = response?.json();
  const result = data ?? 'default';
  
  // ⚠️ Newly baseline features (should show warnings)
  const lastItem = array.at(-1);
  const cloned = structuredClone(data);
  
  // ❌ Not baseline features (should show errors)
  const grouped = array.group(item => item.type);
  const mapped = array.groupToMap(item => item.category);
}

// Test class with private fields
class MyClass {
  #privateField = 'secret';
  
  async #privateMethod() {
    return await fetch('/api');
  }
}
```

Run ESLint:

```bash
npx eslint test.js
```

## 📊 Expected Output

```
test.js
  2:1   warning  ✅ Async/Await is Baseline (Widely Available)
  4:1   warning  ⚠️ Top-level await is newly Baseline Wrap in async IIFE or use dynamic imports
  4:20  warning  ✅ Async/Await is Baseline (Widely Available)
  4:26  warning  ✅ Fetch API is Baseline (Widely Available)
  5:24  warning  ✅ Optional Chaining is Baseline (Widely Available)
  6:23  warning  ✅ Nullish Coalescing is Baseline (Widely Available)
  9:25  warning  ⚠️ Array.at() is newly Baseline Use array[array.length - 1] for negative indexing
  10:18 warning  ⚠️ Structured Clone is newly Baseline Use JSON.parse(JSON.stringify()) or lodash.cloneDeep
  13:24 warning  ❌ Array Grouping is not Baseline - needs polyfill Use lodash.groupBy or custom implementation
  14:23 warning  ❌ Array Grouping is not Baseline - needs polyfill Use lodash.groupBy or custom implementation
  19:3   warning  ⚠️ Private fields are newly Baseline Use TypeScript private or naming conventions as fallback
  21:9   warning  ⚠️ Private fields are newly Baseline Use TypeScript private or naming conventions as fallback
  22:1   warning  ⚠️ Top-level await is newly Baseline Wrap in async IIFE or use dynamic imports

✖ 15 problems (0 errors, 15 warnings)
```

## 🔍 Detected Features

### ✅ Baseline (Widely Available)
- Async/Await
- Fetch API
- Optional Chaining (`?.`)
- Nullish Coalescing (`??`)
- CSS Grid
- CSS Flexbox
- CSS Variables

### ⚠️ Newly Baseline (Recently Available)
- Array.at()
- Structured Clone
- Private Class Fields (`#field`)
- Top-level await
- CSS Container Queries
- CSS Subgrid

### ❌ Not Baseline (Needs Polyfill)
- Array Grouping (`.group()`, `.groupToMap()`)
- CSS Anchor Positioning

## 🛠️ Integration with Build Tools

### Vite
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // ... other config
  esbuild: {
    target: 'es2020' // Ensure modern features are supported
  }
});
```

### Webpack
```javascript
// webpack.config.js
module.exports = {
  // ... other config
  target: 'web',
  resolve: {
    fallback: {
      // Add polyfills for non-baseline features
    }
  }
};
```

### Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  experimental: {
    esmExternals: true
  }
};

module.exports = nextConfig;
```

## 🎨 IDE Integration

### VS Code
Install the ESLint extension and add to your `settings.json`:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": ["."]
}
```

### WebStorm/IntelliJ
1. Go to Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable ESLint
3. Set the ESLint package to your project's node_modules

## 📚 Resources

- [Web Baseline Documentation](https://web.dev/baseline/)
- [Can I Use](https://caniuse.com/) - Browser compatibility tables
- [MDN Web Docs](https://developer.mozilla.org/) - Web technology documentation
- [ESLint Configuration Guide](https://eslint.org/docs/latest/use/configure/)

## 🤝 Contributing

Found an issue or want to add a feature? Please open an issue or submit a pull request on [GitHub](https://github.com/ckhadar/eslint-plugin-baseline-compatibility).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/ckhadar/eslint-plugin-baseline-compatibility/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ckhadar/eslint-plugin-baseline-compatibility/discussions)

---

**Happy coding with baseline-compatible web features! 🎉**
