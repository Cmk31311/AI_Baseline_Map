# Baseline Map VS Code Extension

A comprehensive VS Code extension that provides real-time baseline compatibility information for web features directly in your editor. This extension is part of the AI Baseline Tool monorepo and integrates seamlessly with the web application and ESLint plugin.

## ✨ Features

### 🎯 Hover Information
- **Real-time Compatibility**: Hover over web features in CSS, JavaScript, TypeScript, HTML, JSX, and TSX files
- **Baseline Status Indicators**: Visual indicators showing whether a feature is widely available, newly available, or has limited availability
- **Browser Support Details**: Displays specific browser version requirements and support status
- **Quick Access Links**: Direct links to specifications and Can I Use data

### 🔍 Supported File Types
- **CSS**: All CSS properties, selectors, and at-rules
- **JavaScript/TypeScript**: APIs, methods, and language features
- **HTML**: Elements, attributes, and semantic tags
- **JSX/TSX**: React components and JSX-specific features

### 📊 Baseline Status Types
- **🟢 Widely Available**: Safe to use in production (Baseline: High)
- **🔵 Newly Available**: Recently reached baseline (Baseline: Low)
- **🟡 Limited Availability**: Not yet baseline (Limited Support)

## 🌐 Supported Web Features

### CSS Features (100+ properties)
- **Layout**: CSS Grid, Flexbox, CSS Subgrid, Container Queries
- **Typography**: Font features, text properties, writing modes
- **Visual Effects**: Filters, backdrop-filter, clip-path, mask
- **Animation**: CSS Animations, Transitions, Transform
- **Responsive**: Media queries, container queries, aspect-ratio
- **Modern Features**: CSS Custom Properties, CSS Layers, Cascade Layers

### JavaScript Features (200+ APIs)
- **Web APIs**: Fetch, Intersection Observer, Web Components, Service Workers
- **Language Features**: Optional Chaining (`?.`), Nullish Coalescing (`??`), BigInt
- **DOM APIs**: Element methods, Event handling, Mutation Observer
- **Storage**: Local Storage, Session Storage, IndexedDB
- **Performance**: Web Workers, SharedArrayBuffer, Performance API

### HTML Features (50+ elements)
- **Semantic Elements**: `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`
- **Form Elements**: `<input>` types, `<datalist>`, `<output>`
- **Media Elements**: `<video>`, `<audio>`, `<picture>`, `<source>`
- **Interactive Elements**: `<details>`, `<dialog>`, `<popover>`
- **Accessibility**: ARIA attributes, semantic roles

## 🚀 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Baseline Map"
4. Click Install

**Direct Link**: [Baseline Map Extension](https://marketplace.visualstudio.com/items?itemName=ckhadar3.baseline-map-extension)

### From Source (Development)
```bash
# Clone the monorepo
git clone <repository-url>
cd AI_Baseline_Map/vscode-extension

# Install dependencies
npm install

# Build the extension
npm run compile

# Package for installation
npm run package
```

### Development Setup
1. Open the `vscode-extension` folder in VS Code
2. Press `F5` to open a new Extension Development Host window
3. Test the extension by opening files with web features
4. Use `Ctrl+Shift+P` → "Developer: Reload Window" to reload changes

## 💡 Usage

Simply hover over web features in your code to see baseline compatibility information:

### CSS Example
```css
/* Hover over 'grid' to see CSS Grid baseline info */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Hover over 'backdrop-filter' to see support info */
.modal {
  backdrop-filter: blur(10px);
}
```

### JavaScript Example
```javascript
// Hover over 'fetch' to see Fetch API baseline info
const response = await fetch('/api/data');

// Hover over '?.' to see Optional Chaining baseline info
const value = obj?.property?.nested;

// Hover over 'IntersectionObserver' to see API support
const observer = new IntersectionObserver(callback);
```

### HTML Example
```html
<!-- Hover over 'dialog' to see element support -->
<dialog>
  <p>This is a dialog element</p>
</dialog>

<!-- Hover over 'popover' to see attribute support -->
<button popover="auto">Click me</button>
```

## ⚙️ Configuration

The extension can be configured through VS Code settings:

### Available Settings
- `baselineMap.enabled`: Enable/disable the extension (default: true)
- `baselineMap.showIcons`: Show status icons in hover information (default: true)
- `baselineMap.showBrowserSupport`: Display browser version requirements (default: true)
- `baselineMap.showSpecLinks`: Show links to specifications (default: true)
- `baselineMap.hoverDelay`: Delay before showing hover information in ms (default: 300)

### Settings Example
```json
{
  "baselineMap.enabled": true,
  "baselineMap.showIcons": true,
  "baselineMap.showBrowserSupport": true,
  "baselineMap.showSpecLinks": true,
  "baselineMap.hoverDelay": 300
}
```

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
- VS Code
- TypeScript
- npm or yarn

### Building
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Testing
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Packaging
```bash
# Install vsce globally
npm install -g vsce

# Package the extension
vsce package

# Publish to marketplace (requires authentication)
vsce publish
```

### Project Structure
```
vscode-extension/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── hoverProvider.ts      # Hover information provider
│   └── baselineData.ts       # Baseline data processing
├── test/
│   └── extension.test.ts     # Extension tests
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔗 Integration with Monorepo

This extension is part of the AI Baseline Tool monorepo and shares:
- **Data Source**: Same web-features package as the main application
- **Baseline Logic**: Consistent baseline checking across all tools
- **Configuration**: Shared baseline rules and settings

### Related Tools
- **Web Application**: `/app` - Interactive baseline map
- **ESLint Plugin**: `/eslint-plugin-baseline` - Code quality checking
- **CLI Tools**: `/tools` - Command-line baseline checking

## 📄 License

MIT License - see LICENSE file for details

## 📦 Published Package

### VS Code Marketplace
- **Extension ID**: `ckhadar3.baseline-map-extension`
- **Marketplace URL**: [Baseline Map Extension](https://marketplace.visualstudio.com/items?itemName=ckhadar3.baseline-map-extension)
- **Install**: Search for "Baseline Map" in VS Code Extensions or use the direct link
- **Version**: Latest stable release with baseline compatibility checking

## 🙏 Acknowledgments

- Built for Google Chrome Hackathon
- Uses data from [web-features](https://github.com/web-platform-dx/web-features)
- Inspired by [Baseline Map](https://github.com/web-platform-dx/baseline-map)
- Part of the AI Baseline Tool monorepo
