"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class BaselineHoverProvider {
    constructor(baselineData) {
        this.baselineData = baselineData;
    }
    provideHover(document, position, token) {
        if (!this.baselineData.isInitialized()) {
            return null;
        }
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }
        const word = document.getText(wordRange);
        const line = document.lineAt(position.line).text;
        const lineText = line.toLowerCase();
        // Detect web features in different contexts
        const feature = this.detectWebFeature(word, lineText, position, document);
        if (!feature) {
            return null;
        }
        return this.createHoverContent(feature);
    }
    detectWebFeature(word, lineText, position, document) {
        const language = document.languageId;
        // CSS features
        if (language === 'css') {
            return this.detectCSSFeature(word, lineText);
        }
        // JavaScript/TypeScript features
        if (language === 'javascript' || language === 'typescript' ||
            language === 'jsx' || language === 'tsx') {
            return this.detectJSFeature(word, lineText);
        }
        // HTML features
        if (language === 'html') {
            return this.detectHTMLFeature(word, lineText);
        }
        return null;
    }
    detectCSSFeature(word, lineText) {
        const cssFeatureMap = {
            'grid': 'css-grid',
            'grid-template': 'css-grid',
            'grid-area': 'css-grid',
            'grid-column': 'css-grid',
            'grid-row': 'css-grid',
            'flex': 'css-flexbox',
            'flexbox': 'css-flexbox',
            'flex-direction': 'css-flexbox',
            'justify-content': 'css-flexbox',
            'align-items': 'css-flexbox',
            '--': 'css-custom-properties',
            'var(': 'css-custom-properties',
            'container': 'css-container-queries',
            'container-type': 'css-container-queries',
            'container-name': 'css-container-queries',
            'subgrid': 'css-subgrid'
        };
        // Check for CSS properties
        for (const [cssProp, featureId] of Object.entries(cssFeatureMap)) {
            if (lineText.includes(cssProp) && word.toLowerCase().includes(cssProp.replace(/[^a-zA-Z]/g, ''))) {
                return this.baselineData.getFeature(featureId) || null;
            }
        }
        // Check for CSS at-rules
        if (lineText.includes('@container')) {
            return this.baselineData.getFeature('css-container-queries') || null;
        }
        return null;
    }
    detectJSFeature(word, lineText) {
        const jsFeatureMap = {
            'fetch': 'fetch-api',
            'async': 'async-await',
            'await': 'async-await',
            '?.': 'optional-chaining',
            '??': 'nullish-coalescing',
            'customElements': 'web-components',
            'define': 'web-components',
            'connectedCallback': 'web-components',
            'disconnectedCallback': 'web-components'
        };
        // Check for JavaScript features
        for (const [jsFeature, featureId] of Object.entries(jsFeatureMap)) {
            if (lineText.includes(jsFeature) && word.toLowerCase().includes(jsFeature.replace(/[^a-zA-Z]/g, ''))) {
                return this.baselineData.getFeature(featureId) || null;
            }
        }
        // Check for specific patterns
        if (lineText.includes('?.') && word === '?.') {
            return this.baselineData.getFeature('optional-chaining') || null;
        }
        if (lineText.includes('??') && word === '??') {
            return this.baselineData.getFeature('nullish-coalescing') || null;
        }
        return null;
    }
    detectHTMLFeature(word, lineText) {
        // Check for web components
        if (lineText.includes('<') && lineText.includes('>') &&
            word.includes('-') && word.length > 3) {
            return this.baselineData.getFeature('web-components') || null;
        }
        return null;
    }
    createHoverContent(feature) {
        const color = this.baselineData.getBaselineColor(feature.baseline);
        const label = this.baselineData.getBaselineLabel(feature.baseline);
        const icon = this.baselineData.getBaselineIcon(feature.baseline);
        // Create markdown content
        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;
        // Header with feature name and status
        markdown.appendMarkdown(`## ${icon} ${feature.name}\n\n`);
        // Baseline status with color
        markdown.appendMarkdown(`**${label}**\n\n`);
        // Description
        if (feature.description) {
            markdown.appendMarkdown(`${feature.description}\n\n`);
        }
        // Baseline dates
        if (feature.baseline_high_date) {
            markdown.appendMarkdown(`**Widely Available Since:** ${feature.baseline_high_date}\n\n`);
        }
        else if (feature.baseline_low_date) {
            markdown.appendMarkdown(`**Newly Available Since:** ${feature.baseline_low_date}\n\n`);
        }
        // Browser support
        if (feature.support) {
            markdown.appendMarkdown(`### Browser Support\n\n`);
            markdown.appendMarkdown(`| Browser | Version |\n`);
            markdown.appendMarkdown(`|---------|----------|\n`);
            Object.entries(feature.support).forEach(([browser, version]) => {
                markdown.appendMarkdown(`| ${browser} | ${version}+ |\n`);
            });
            markdown.appendMarkdown(`\n`);
        }
        // Links
        if (feature.spec) {
            markdown.appendMarkdown(`[📋 Specification](${feature.spec})`);
        }
        if (feature.caniuse) {
            const caniuseUrl = `https://caniuse.com/${feature.caniuse}`;
            markdown.appendMarkdown(` | [📊 Can I Use](${caniuseUrl})`);
        }
        // Add CSS styling for the hover
        markdown.appendMarkdown(`\n\n---\n`);
        markdown.appendMarkdown(`*Powered by [Baseline Map](https://github.com/web-platform-dx/baseline-map)*`);
        return new vscode.Hover(markdown);
    }
}
exports.BaselineHoverProvider = BaselineHoverProvider;
//# sourceMappingURL=hoverProvider.js.map