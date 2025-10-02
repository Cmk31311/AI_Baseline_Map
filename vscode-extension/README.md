# Baseline Map VS Code Extension

A VS Code extension that shows baseline compatibility information for web features when you hover over them in your code.

## Features

- **Hover Information**: Hover over web features in CSS, JavaScript, TypeScript, HTML, JSX, and TSX files to see baseline compatibility
- **Baseline Status**: Shows whether a feature is widely available, newly available, or has limited availability
- **Browser Support**: Displays browser version requirements
- **Quick Links**: Direct links to specifications and Can I Use data

## Supported Web Features

### CSS Features
- CSS Grid Layout
- CSS Flexbox
- CSS Custom Properties (Variables)
- CSS Container Queries
- CSS Subgrid

### JavaScript Features
- Fetch API
- Async/Await
- Optional Chaining (`?.`)
- Nullish Coalescing (`??`)
- Web Components

## Installation

1. Clone this repository
2. Run `npm install` in the extension directory
3. Run `npm run compile` to build the extension
4. Press `F5` to open a new Extension Development Host window
5. Test the extension by opening a file with web features

## Usage

Simply hover over web features in your code:

```css
/* Hover over 'grid' to see CSS Grid baseline info */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

```javascript
// Hover over 'fetch' to see Fetch API baseline info
const response = await fetch('/api/data');

// Hover over '?.' to see Optional Chaining baseline info
const value = obj?.property?.nested;
```

## Configuration

The extension can be configured through VS Code settings:

- `baselineMap.enabled`: Enable/disable the extension (default: true)
- `baselineMap.showIcons`: Show status icons in hover information (default: true)

## Development

### Prerequisites

- Node.js (v16 or higher)
- VS Code
- TypeScript

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
npm run test
```

### Packaging

```bash
npm install -g vsce
vsce package
```

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Based on the [Baseline Map](https://github.com/web-platform-dx/baseline-map) project
- Uses data from [web-features](https://github.com/web-platform-dx/web-features)
