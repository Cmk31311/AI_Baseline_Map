"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsPatterns = exports.cssPatterns = exports.baselineFeatures = void 0;
// Baseline feature database
exports.baselineFeatures = {
    // CSS Features
    'css-grid': {
        name: 'CSS Grid Layout',
        description: 'Two-dimensional grid-based layout system',
        baseline: 'high',
        message: '✅ CSS Grid is Baseline (Widely Available)',
    },
    'css-flexbox': {
        name: 'CSS Flexbox',
        description: 'One-dimensional layout method',
        baseline: 'high',
        message: '✅ CSS Flexbox is Baseline (Widely Available)',
    },
    'css-variables': {
        name: 'CSS Custom Properties',
        description: 'Custom properties for cascading variables',
        baseline: 'high',
        message: '✅ CSS Variables are Baseline (Widely Available)',
    },
    'css-container-queries': {
        name: 'CSS Container Queries',
        description: 'Querying parent container size or style',
        baseline: 'low',
        message: '⚠️ Container Queries are newly Baseline - consider fallback for older browsers',
        suggestion: 'Use @supports (container-type: inline-size) for progressive enhancement',
        polyfill: 'container-query-polyfill',
    },
    'css-subgrid': {
        name: 'CSS Subgrid',
        description: 'Nested grids inheriting track sizing',
        baseline: 'low',
        message: '⚠️ Subgrid is newly Baseline - limited browser support',
        suggestion: 'Use regular grid with explicit track sizing as fallback',
        alternative: 'Use CSS Grid with explicit grid-template-columns/rows',
    },
    'css-logical-properties': {
        name: 'CSS Logical Properties',
        description: 'Direction-agnostic properties (inline-start, block-end, etc.)',
        baseline: 'low',
        message: '⚠️ Logical Properties are newly Baseline',
        suggestion: 'Provide fallback with physical properties',
        alternative: 'Use margin-left/right instead of margin-inline-start/end',
    },
    'css-cascade-layers': {
        name: 'CSS Cascade Layers',
        description: 'Explicit cascade ordering with @layer',
        baseline: 'low',
        message: '⚠️ Cascade Layers are newly Baseline',
        suggestion: 'Use traditional specificity or !important as fallback',
    },
    'css-color-mix': {
        name: 'CSS color-mix()',
        description: 'Color mixing function',
        baseline: 'low',
        message: '⚠️ color-mix() is newly Baseline',
        suggestion: 'Use pre-calculated colors or CSS variables as fallback',
        alternative: 'Use CSS custom properties with pre-mixed colors',
    },
    'css-anchor-positioning': {
        name: 'CSS Anchor Positioning',
        description: 'Position elements relative to anchor elements',
        baseline: false,
        message: '❌ Anchor Positioning is not Baseline - needs fallback',
        suggestion: 'Use JavaScript positioning or CSS transforms as fallback',
        polyfill: 'anchor-positioning-polyfill',
    },
    // JavaScript Features
    'fetch-api': {
        name: 'Fetch API',
        description: 'Interface for fetching resources',
        baseline: 'high',
        message: '✅ Fetch API is Baseline (Widely Available)',
    },
    'async-await': {
        name: 'Async/Await',
        description: 'Syntactic sugar for Promises',
        baseline: 'high',
        message: '✅ Async/Await is Baseline (Widely Available)',
    },
    'optional-chaining': {
        name: 'Optional Chaining',
        description: 'Safe property access with ?.',
        baseline: 'high',
        message: '✅ Optional Chaining is Baseline (Widely Available)',
    },
    'nullish-coalescing': {
        name: 'Nullish Coalescing',
        description: 'Logical operator with ??',
        baseline: 'high',
        message: '✅ Nullish Coalescing is Baseline (Widely Available)',
    },
    'web-components': {
        name: 'Web Components',
        description: 'Custom elements, shadow DOM, templates',
        baseline: 'low',
        message: '⚠️ Web Components are newly Baseline - consider polyfill for older browsers',
        suggestion: 'Use @webcomponents/webcomponentsjs for older browser support',
        polyfill: '@webcomponents/webcomponentsjs',
    },
    'top-level-await': {
        name: 'Top-level await',
        description: 'Using await outside of async functions',
        baseline: 'low',
        message: '⚠️ Top-level await is newly Baseline',
        suggestion: 'Wrap in async IIFE or use dynamic imports',
        alternative: 'Use (async () => { await ... })()',
    },
    'private-fields': {
        name: 'Private Class Fields',
        description: 'Private fields with # syntax',
        baseline: 'low',
        message: '⚠️ Private fields are newly Baseline',
        suggestion: 'Use TypeScript private or naming conventions as fallback',
        alternative: 'Use TypeScript private modifier or _ prefix',
    },
    'array-at': {
        name: 'Array.at()',
        description: 'Array method for negative indexing',
        baseline: 'low',
        message: '⚠️ Array.at() is newly Baseline',
        suggestion: 'Use array[array.length - 1] for negative indexing',
        alternative: 'Use array[array.length + index] for negative indices',
    },
    'structured-clone': {
        name: 'Structured Clone',
        description: 'Deep cloning of objects',
        baseline: 'low',
        message: '⚠️ Structured Clone is newly Baseline',
        suggestion: 'Use JSON.parse(JSON.stringify()) or lodash.cloneDeep',
        polyfill: '@ungap/structured-clone',
    },
    'array-group': {
        name: 'Array Grouping',
        description: 'Array.group() and Array.groupToMap() methods',
        baseline: false,
        message: '❌ Array Grouping is not Baseline - needs polyfill',
        suggestion: 'Use lodash.groupBy or custom implementation',
        polyfill: 'array.prototype.group',
    },
};
// CSS feature detection patterns
exports.cssPatterns = {
    'css-grid': /display\s*:\s*grid|grid-template|grid-area|grid-gap/gi,
    'css-flexbox': /display\s*:\s*flex|flex-direction|justify-content|align-items/gi,
    'css-variables': /var\s*\(\s*--[^)]+\)/gi,
    'css-container-queries': /@container|container-type|container-name/gi,
    'css-subgrid': /subgrid/gi,
    'css-logical-properties': /(margin|padding|border|inset)-(inline|block)-(start|end)/gi,
    'css-cascade-layers': /@layer/gi,
    'css-color-mix': /color-mix\s*\(/gi,
    'css-anchor-positioning': /anchor-name|anchor-scope|position-anchor/gi,
};
// JavaScript feature detection patterns
exports.jsPatterns = {
    'fetch-api': /\bfetch\s*\(/gi,
    'async-await': /\b(async\s+function|await\s+)/gi,
    'optional-chaining': /\?\./gi,
    'nullish-coalescing': /\?\?/gi,
    'web-components': /customElements\.|define\(|connectedCallback|disconnectedCallback/gi,
    'top-level-await': /^(?!.*function|.*=>|.*async).*await\s+/gm,
    'private-fields': /#\w+/gi,
    'array-at': /\.at\s*\(/gi,
    'structured-clone': /structuredClone\s*\(/gi,
    'array-group': /\.group\s*\(|\.groupToMap\s*\(/gi,
};
const plugin = {
    meta: {
        name: 'eslint-plugin-baseline-compatibility',
        version: '1.0.2',
    },
    rules: {
        'check-baseline': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Check web features against Baseline compatibility',
                    category: 'Best Practices',
                    recommended: true,
                },
                fixable: null,
                schema: [
                    {
                        type: 'object',
                        properties: {
                            baselineLevel: {
                                type: 'string',
                                enum: ['high', 'low', 'all'],
                                default: 'all',
                            },
                            includePolyfills: {
                                type: 'boolean',
                                default: true,
                            },
                            includeAlternatives: {
                                type: 'boolean',
                                default: true,
                            },
                        },
                        additionalProperties: false,
                    },
                ],
                messages: {
                    baselineCheck: '{{message}}',
                    withSuggestion: '{{message}} {{suggestion}}',
                    withPolyfill: '{{message}} Consider polyfill: {{polyfill}}',
                    withAlternative: '{{message}} Alternative: {{alternative}}',
                },
            },
            create(context) {
                const options = context.options[0] || {};
                const baselineLevel = options.baselineLevel || 'all';
                const includePolyfills = options.includePolyfills !== false;
                const includeAlternatives = options.includeAlternatives !== false;
                return {
                    Program(node) {
                        const sourceCode = context.getSourceCode();
                        const text = sourceCode.getText();
                        const filename = context.getFilename();
                        // Determine file type
                        const isCSS = filename.endsWith('.css') || filename.endsWith('.scss') || filename.endsWith('.less');
                        const isJS = filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.jsx') || filename.endsWith('.tsx');
                        if (!isCSS && !isJS)
                            return;
                        const patterns = isCSS ? exports.cssPatterns : exports.jsPatterns;
                        // Check each pattern
                        Object.entries(patterns).forEach(([featureId, pattern]) => {
                            const feature = exports.baselineFeatures[featureId];
                            if (!feature)
                                return;
                            // Skip based on baseline level
                            if (baselineLevel === 'high' && feature.baseline !== 'high')
                                return;
                            if (baselineLevel === 'low' && feature.baseline === false)
                                return;
                            const matches = text.match(pattern);
                            if (matches) {
                                matches.forEach((match) => {
                                    const index = text.indexOf(match);
                                    const loc = sourceCode.getLocFromIndex(index);
                                    let messageId = 'baselineCheck';
                                    let messageData = { message: feature.message };
                                    if (feature.suggestion) {
                                        messageId = 'withSuggestion';
                                        messageData.suggestion = feature.suggestion;
                                    }
                                    else if (feature.polyfill && includePolyfills) {
                                        messageId = 'withPolyfill';
                                        messageData.polyfill = feature.polyfill;
                                    }
                                    else if (feature.alternative && includeAlternatives) {
                                        messageId = 'withAlternative';
                                        messageData.alternative = feature.alternative;
                                    }
                                    context.report({
                                        node,
                                        messageId,
                                        data: messageData,
                                        loc,
                                    });
                                });
                            }
                        });
                    },
                };
            },
        },
    },
};
module.exports = plugin;
//# sourceMappingURL=index.js.map