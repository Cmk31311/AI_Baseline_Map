# ESLint Plugin Baseline Compatibility

An ESLint plugin that checks web features against Baseline compatibility standards, providing instant feedback during development.

## Features

- ✅ **Baseline Compatibility Checking**: Warns about non-baseline web features
- ⚠️ **Smart Suggestions**: Provides polyfills and alternative syntax
- 🎯 **File Type Support**: Works with CSS, SCSS, JavaScript, TypeScript, JSX, TSX
- 🔧 **Configurable**: Choose baseline level (high, low, all)
- 📚 **Comprehensive**: Covers CSS Grid, Flexbox, Fetch API, Async/Await, and more

## Installation

```bash
npm install --save-dev eslint-plugin-baseline-compatibility
```

## Usage

Add to your ESLint configuration:

```json
{
  "plugins": ["baseline-compatibility"],
  "rules": {
    "baseline-compatibility/check-baseline": ["warn", {
      "baselineLevel": "all",
      "includePolyfills": true,
      "includeAlternatives": true
    }]
  }
}
```

## Configuration Options

- `baselineLevel`: `"high"` | `"low"` | `"all"` (default: `"all"`)
  - `"high"`: Only check for widely available baseline features
  - `"low"`: Check for newly available and limited features
  - `"all"`: Check all features

- `includePolyfills`: `boolean` (default: `true`)
  - Include polyfill suggestions for unsupported features

- `includeAlternatives`: `boolean` (default: `true`)
  - Include alternative syntax suggestions

## Supported Features

### CSS Features
- ✅ CSS Grid Layout (Baseline)
- ✅ CSS Flexbox (Baseline)
- ✅ CSS Custom Properties (Baseline)
- ⚠️ CSS Container Queries (Newly Baseline)
- ⚠️ CSS Subgrid (Newly Baseline)
- ⚠️ CSS Logical Properties (Newly Baseline)
- ⚠️ CSS Cascade Layers (Newly Baseline)
- ⚠️ CSS color-mix() (Newly Baseline)
- ❌ CSS Anchor Positioning (Not Baseline)

### JavaScript Features
- ✅ Fetch API (Baseline)
- ✅ Async/Await (Baseline)
- ✅ Optional Chaining (Baseline)
- ✅ Nullish Coalescing (Baseline)
- ⚠️ Web Components (Newly Baseline)
- ⚠️ Top-level await (Newly Baseline)
- ⚠️ Private Class Fields (Newly Baseline)
- ⚠️ Array.at() (Newly Baseline)
- ⚠️ Structured Clone (Newly Baseline)
- ❌ Array Grouping (Not Baseline)

## Example Output

```css
/* CSS Example */
.container {
  display: grid; /* ✅ CSS Grid is Baseline (Widely Available) */
  container-type: inline-size; /* ⚠️ Container Queries are newly Baseline - consider fallback for older browsers */
}
```

```javascript
// JavaScript Example
const data = await fetch('/api'); // ✅ Fetch API is Baseline (Widely Available)
const result = data?.property; // ✅ Optional Chaining is Baseline (Widely Available)
const grouped = array.group(item => item.type); // ❌ Array Grouping is not Baseline - needs polyfill
```

## Integration with VS Code

This plugin works great with the [Baseline Map VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ckhadar.baseline-map-extension) for comprehensive baseline compatibility checking.

## Development

To build the plugin:

```bash
npm run build
```

To test the plugin:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Submit a pull request

## License

MIT