import * as vscode from 'vscode';
import { BaselineDataProvider, FeatureNode } from './baselineData';

export class BaselineHoverProvider implements vscode.HoverProvider {
    constructor(private baselineData: BaselineDataProvider) {}

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
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

    private detectWebFeature(
        word: string, 
        lineText: string, 
        position: vscode.Position, 
        document: vscode.TextDocument
    ): FeatureNode | null {
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

    private detectCSSFeature(word: string, lineText: string): FeatureNode | null {
        const cssFeatureMap: Record<string, string> = {
            // Grid Layout
            'grid': 'css-grid',
            'grid-template': 'css-grid',
            'grid-area': 'css-grid',
            'grid-column': 'css-grid',
            'grid-row': 'css-grid',
            'subgrid': 'css-subgrid',
            
            // Flexbox
            'flex': 'css-flexbox',
            'flexbox': 'css-flexbox',
            'flex-direction': 'css-flexbox',
            'justify-content': 'css-flexbox',
            'align-items': 'css-flexbox',
            'flex-wrap': 'css-flexbox',
            'flex-grow': 'css-flexbox',
            'flex-shrink': 'css-flexbox',
            'flex-basis': 'css-flexbox',
            'align-self': 'css-flexbox',
            'align-content': 'css-flexbox',
            
            // Custom Properties
            '--': 'css-custom-properties',
            'var(': 'css-custom-properties',
            
            // Container Queries
            'container': 'css-container-queries',
            'container-type': 'css-container-queries',
            'container-name': 'css-container-queries',
            
            // Transforms & Animations
            'transform': 'css-transforms',
            'rotate': 'css-transforms',
            'scale': 'css-transforms',
            'translate': 'css-transforms',
            'transition': 'css-transitions',
            'animation': 'css-animations',
            'keyframes': 'css-animations',
            
            // Layout Properties
            'position': 'css-position-sticky',
            'sticky': 'css-position-sticky',
            'object-fit': 'css-object-fit',
            'aspect-ratio': 'css-aspect-ratio',
            'gap': 'css-gap',
            'row-gap': 'css-gap',
            'column-gap': 'css-gap',
            
            // Selectors
            ':has': 'css-has',
            'has(': 'css-has',
            ':nth-child': 'css-nth-child-of'
        };

        // Check for CSS properties - improved detection
        for (const [cssProp, featureId] of Object.entries(cssFeatureMap)) {
            const wordLower = word.toLowerCase();
            const propClean = cssProp.replace(/[^a-zA-Z]/g, '');
            
            // Direct word match or line contains the property
            if (wordLower === propClean || wordLower === cssProp || lineText.includes(cssProp)) {
                const feature = this.baselineData.getFeature(featureId);
                if (feature) {
                    return feature;
                }
            }
        }

        // Check for CSS at-rules
        if (lineText.includes('@container')) {
            return this.baselineData.getFeature('css-container-queries') || null;
        }

        return null;
    }

    private detectJSFeature(word: string, lineText: string): FeatureNode | null {
        const jsFeatureMap: Record<string, string> = {
            // Async/Await & Promises
            'fetch': 'fetch-api',
            'async': 'async-await',
            'await': 'async-await',
            'Promise': 'promise',
            'then': 'promise',
            'catch': 'promise',
            
            // Modern Operators
            '?.': 'optional-chaining',
            '??': 'nullish-coalescing',
            '...': 'spread-operator',
            
            // ES6+ Features
            '=>': 'arrow-functions',
            '`': 'template-literals',
            '${': 'template-literals',
            
            // Array Methods
            'includes': 'array-includes',
            'find': 'array-find',
            'findIndex': 'array-find',
            
            // Object Methods
            'assign': 'object-assign',
            
            // Web Components
            'customElements': 'web-components',
            'define': 'web-components',
            'connectedCallback': 'web-components',
            'disconnectedCallback': 'web-components',
            'attributeChangedCallback': 'web-components',
            'adoptedCallback': 'web-components'
        };

        // Check for JavaScript features - improved detection
        for (const [jsFeature, featureId] of Object.entries(jsFeatureMap)) {
            const wordLower = word.toLowerCase();
            const featureClean = jsFeature.replace(/[^a-zA-Z]/g, '');
            
            // Direct word match or line contains the feature
            if (wordLower === featureClean || wordLower === jsFeature || lineText.includes(jsFeature)) {
                const feature = this.baselineData.getFeature(featureId);
                if (feature) {
                    return feature;
                }
            }
        }

        // Check for specific patterns
        if (lineText.includes('?.') && (word === '?.' || word === '?' || lineText.includes('?.'))) {
            return this.baselineData.getFeature('optional-chaining') || null;
        }

        if (lineText.includes('??') && (word === '??' || word === '?' || lineText.includes('??'))) {
            return this.baselineData.getFeature('nullish-coalescing') || null;
        }

        return null;
    }

    private detectHTMLFeature(word: string, lineText: string): FeatureNode | null {
        // Check for web components
        if (lineText.includes('<') && lineText.includes('>') && 
            word.includes('-') && word.length > 3) {
            return this.baselineData.getFeature('web-components') || null;
        }

        return null;
    }

    private createHoverContent(feature: FeatureNode): vscode.Hover {
        const color = this.baselineData.getBaselineColor(feature.baseline);
        const label = this.baselineData.getBaselineLabel(feature.baseline);
        const icon = this.baselineData.getBaselineIcon(feature.baseline);

        // Create markdown content that VS Code actually supports
        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;

        // Header with feature name and status icon
        markdown.appendMarkdown(`# ${icon} ${feature.name}\n\n`);
        
        // Enhanced status badge with proper emojis and styling
        const statusEmoji = feature.baseline === 'high' ? '🟢' : feature.baseline === 'low' ? '🟡' : '🔴';
        const statusText = feature.baseline === 'high' ? '✅ Widely Available' : 
                          feature.baseline === 'low' ? '⚠️ Newly Available' : 
                          '❌ Limited Availability';
        
        markdown.appendMarkdown(`${statusEmoji} **${statusText}**\n\n`);
        
        // Description with styling
        if (feature.description) {
            markdown.appendMarkdown(`💭 *${feature.description}*\n\n`);
        }

        // Baseline dates with proper emojis
        if (feature.baseline_high_date) {
            markdown.appendMarkdown(`🎉 **Widely Available Since:** \`${feature.baseline_high_date}\`\n\n`);
        } else if (feature.baseline_low_date) {
            markdown.appendMarkdown(`⚡ **Newly Available Since:** \`${feature.baseline_low_date}\`\n\n`);
        }

        // Enhanced Browser support table with actual versions
        if (feature.support && Object.keys(feature.support).length > 0) {
            markdown.appendMarkdown(`### 🌐 Browser Support Details\n\n`);
            markdown.appendMarkdown(`| Browser | Minimum Version | Support Level |\n`);
            markdown.appendMarkdown(`|---------|-----------------|---------------|\n`);
            
            Object.entries(feature.support).forEach(([browser, version]) => {
                const browserIcon = this.getBrowserIcon(browser);
                const supportLevel = this.getDetailedSupportStatus(browser, version, feature.baseline);
                markdown.appendMarkdown(`| ${browserIcon} **${browser}** | \`v${version}+\` | ${supportLevel} |\n`);
            });
            markdown.appendMarkdown(`\n`);
        } else {
            // Fallback if no support data
            markdown.appendMarkdown(`### 🌐 Browser Support\n\n`);
            markdown.appendMarkdown(`*Browser support information not available for this feature.*\n\n`);
        }

        // Enhanced recommendations with alternatives for limited availability
        if (feature.baseline === false) {
            markdown.appendMarkdown(`### ⚠️ Limited Availability - Alternatives Recommended\n\n`);
            markdown.appendMarkdown(`> 🚨 **Not Baseline Compatible** - This feature has limited browser support.\n\n`);
            
            // Add specific alternatives based on feature type
            const alternatives = this.getAlternatives(feature.id);
            markdown.appendMarkdown(`**🔄 Recommended Alternatives:**\n\n`);
            alternatives.forEach(alt => {
                markdown.appendMarkdown(`• ${alt}\n`);
            });
            markdown.appendMarkdown(`\n`);
            
            markdown.appendMarkdown(`**💡 Consider using:**\n`);
            markdown.appendMarkdown(`• Polyfills for backward compatibility\n`);
            markdown.appendMarkdown(`• Feature detection with fallbacks\n`);
            markdown.appendMarkdown(`• Progressive enhancement strategies\n\n`);
            
        } else if (feature.baseline === 'low') {
            markdown.appendMarkdown(`### ✨ Newly Baseline - Use with Caution\n\n`);
            markdown.appendMarkdown(`> 🆕 **Recently Baseline** - Safe for modern apps, consider fallbacks for older browsers.\n\n`);
            markdown.appendMarkdown(`**💡 Best Practices:**\n`);
            markdown.appendMarkdown(`• Test thoroughly in target browsers\n`);
            markdown.appendMarkdown(`• Provide graceful degradation\n`);
            markdown.appendMarkdown(`• Consider user base requirements\n\n`);
            
        } else {
            markdown.appendMarkdown(`### 🎉 Widely Available - Safe to Use\n\n`);
            markdown.appendMarkdown(`> ✅ **Fully Baseline Compatible** - Excellent browser support across all modern browsers!\n\n`);
            markdown.appendMarkdown(`**🚀 You can safely use this feature without polyfills or fallbacks.**\n\n`);
        }

        // Enhanced Links section with emojis
        const links = [];
        if (feature.spec) {
            links.push(`[📋 Official Specification](${feature.spec})`);
        }
        if (feature.caniuse) {
            const caniuseUrl = `https://caniuse.com/${feature.caniuse}`;
            links.push(`[📊 Can I Use Data](${caniuseUrl})`);
        }
        
        if (links.length > 0) {
            markdown.appendMarkdown(`### 🔗 Additional Resources\n\n`);
            markdown.appendMarkdown(links.join(' • ') + '\n\n');
        }

        // Footer with enhanced Baseline Map link
        
        markdown.appendMarkdown(`---\n`);
        markdown.appendMarkdown(`### 🧭 Explore More Web Features\n\n`);
        markdown.appendMarkdown(`🔍 **[Discover more baseline compatibility features →](https://ai-baseline-map.vercel.app/)**\n\n`);
        markdown.appendMarkdown(`*✨ Powered by **Baseline Map** - Your complete guide to web platform baseline compatibility 🌐*`);

        return new vscode.Hover(markdown);
    }

    private getSupportStatus(baseline: 'high' | 'low' | false): string {
        switch (baseline) {
            case 'high': return '✅ Supported';
            case 'low': return '⚠️ Recent';
            case false: return '❌ Limited';
            default: return '❓ Unknown';
        }
    }

    private getDetailedSupportStatus(browser: string, version: string, baseline: 'high' | 'low' | false): string {
        if (baseline === 'high') {
            return '🟢 Full Support';
        } else if (baseline === 'low') {
            return '🟡 Recent Support';
        } else {
            return '🔴 Limited/Partial';
        }
    }

    private getAlternatives(featureId: string): string[] {
        const alternatives: Record<string, string[]> = {
            'css-container-queries': [
                '📱 Use media queries with JavaScript for responsive design',
                '🎯 Element queries polyfill library',
                '📐 ResizeObserver API for element size detection'
            ],
            'css-subgrid': [
                '🔲 Use regular CSS Grid with explicit track definitions',
                '📏 CSS Flexbox for simpler layouts',
                '📐 CSS Grid with manual gap calculations'
            ],
            'css-has': [
                '🎯 Use JavaScript to query and style parent elements',
                '📝 Add classes to parents based on child content',
                '🔧 Use CSS-in-JS libraries for dynamic styling'
            ],
            'css-nth-child-of': [
                '🎯 Use regular :nth-child() with specific selectors',
                '📝 Add classes to target specific elements',
                '🔧 Use JavaScript to apply styles conditionally'
            ],
            'css-aspect-ratio': [
                '📐 Use padding-top percentage trick',
                '🎯 JavaScript to calculate and set dimensions',
                '📦 CSS aspect-ratio polyfill libraries'
            ],
            'web-components': [
                '⚛️ React, Vue, or Angular components',
                '🔧 Lit library for lightweight web components',
                '📦 Stencil.js for cross-framework components'
            ],
            'optional-chaining': [
                '🔍 Manual null/undefined checks: `obj && obj.prop`',
                '📦 Lodash `get()` function for safe property access',
                '🛡️ Try-catch blocks for error handling'
            ],
            'nullish-coalescing': [
                '🔍 Use logical OR with explicit checks: `value != null ? value : default`',
                '📝 Ternary operator: `value !== null && value !== undefined ? value : default`',
                '🛡️ Helper function for null/undefined checking'
            ],
            'array-includes': [
                '🔍 Use `indexOf() !== -1` for checking existence',
                '📦 Lodash `includes()` function',
                '🔧 Custom includes polyfill'
            ],
            'array-find': [
                '🔄 Use `filter()[0]` to get first match',
                '📦 Lodash `find()` function',
                '🔧 Custom find implementation with for loop'
            ],
            'object-assign': [
                '📦 Lodash `assign()` or `merge()` functions',
                '🔧 Manual property copying with for...in loop',
                '📋 Spread operator for shallow copying (if supported)'
            ],
            'arrow-functions': [
                '📝 Regular function expressions: `function() {}`',
                '🔧 Bind method for this context: `function.bind(this)`',
                '📦 Use Babel for transpilation'
            ],
            'template-literals': [
                '➕ String concatenation with + operator',
                '📝 Array join method: `[str1, str2].join("")`',
                '🔧 String formatting libraries'
            ],
            'spread-operator': [
                '📋 Array.prototype.concat for arrays',
                '🔧 Object.assign for object spreading',
                '📦 Lodash merge/concat functions'
            ],
            'destructuring': [
                '📝 Manual property assignment: `var a = obj.a`',
                '🔧 Helper functions for extracting values',
                '📦 Use Babel for transpilation'
            ]
        };
        
        return alternatives[featureId] || [
            '🔍 Check MDN documentation for alternatives',
            '📚 Look for polyfills on npm or GitHub',
            '🛠️ Consider using a build tool transformation'
        ];
    }

    private getBrowserIcon(browser: string): string {
        const icons: Record<string, string> = {
            'Chrome': '🟢',
            'Firefox': '🟠', 
            'Safari': '🔵',
            'Edge': '🟦',
            'Opera': '🔴',
            'Internet Explorer': '⚪'
        };
        return icons[browser] || '🌐';
    }
}
