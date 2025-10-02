# Installation Guide for Baseline Map VS Code Extension

## Quick Start

1. **Open VS Code**
2. **Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)**
3. **Type "Extensions: Install from VSIX"**
4. **Select the `baseline-map-extension-1.0.0.vsix` file**

## Development Installation

### Prerequisites
- VS Code
- Node.js (v16 or higher)
- Git

### Steps

1. **Clone the extension**
   ```bash
   git clone <repository-url>
   cd vscode-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile the extension**
   ```bash
   npm run compile
   ```

4. **Open in VS Code**
   ```bash
   code .
   ```

5. **Run the extension**
   - Press `F5` to open a new Extension Development Host window
   - The extension will be loaded in the new window

6. **Test the extension**
   - Open the `test-files` folder in the new window
   - Hover over web features in the sample files to see baseline compatibility information

## Testing

### Test Files
The extension includes sample files in the `test-files` directory:

- `sample.css` - CSS features (Grid, Flexbox, Custom Properties, Container Queries, Subgrid)
- `sample.js` - JavaScript features (Fetch API, Async/Await, Optional Chaining, Nullish Coalescing, Web Components)
- `sample.html` - HTML with web components

### How to Test
1. Open any of the test files
2. Hover over the following features:
   - CSS: `grid`, `flex`, `--`, `@container`, `subgrid`
   - JavaScript: `fetch`, `async`, `await`, `?.`, `??`, `customElements`
   - HTML: Custom elements like `<my-component>`

## Packaging for Distribution

1. **Install vsce (Visual Studio Code Extension manager)**
   ```bash
   npm install -g vsce
   ```

2. **Package the extension**
   ```bash
   vsce package
   ```

3. **Install the packaged extension**
   - The `baseline-map-extension-1.0.0.vsix` file will be created
   - Install it using "Extensions: Install from VSIX" in VS Code

## Configuration

The extension can be configured through VS Code settings:

```json
{
  "baselineMap.enabled": true,
  "baselineMap.showIcons": true
}
```

## Troubleshooting

### Extension not working
1. Check that the extension is enabled in VS Code settings
2. Restart VS Code
3. Check the Developer Console for errors (`Help > Toggle Developer Tools`)

### No hover information
1. Make sure you're hovering over supported web features
2. Check that the file language is supported (CSS, JavaScript, TypeScript, HTML, JSX, TSX)
3. Verify the extension is activated (check the status bar)

### Build errors
1. Make sure Node.js v16+ is installed
2. Run `npm install` to ensure all dependencies are installed
3. Check that TypeScript is properly configured

## Support

For issues and feature requests, please open an issue on the GitHub repository.
