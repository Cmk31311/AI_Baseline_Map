"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineDataProvider = void 0;
class BaselineDataProvider {
    constructor() {
        this.features = new Map();
        this.initialized = false;
        this.initializeData();
    }
    async initializeData() {
        try {
            // In a real extension, you would load this from web-features package
            // For now, we'll create a sample dataset
            const sampleFeatures = [
                {
                    id: 'css-grid',
                    name: 'CSS Grid Layout',
                    description: 'Two-dimensional grid-based layout system',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://www.w3.org/TR/css-grid-1/',
                    caniuse: 'css-grid',
                    support: {
                        'Chrome': '57',
                        'Firefox': '52',
                        'Safari': '10.1',
                        'Edge': '16'
                    }
                },
                {
                    id: 'css-flexbox',
                    name: 'CSS Flexbox',
                    description: 'One-dimensional layout method for arranging items',
                    baseline: 'high',
                    baseline_high_date: '2016-09-29',
                    spec: 'https://www.w3.org/TR/css-flexbox-1/',
                    caniuse: 'flexbox',
                    support: {
                        'Chrome': '29',
                        'Firefox': '28',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                {
                    id: 'css-custom-properties',
                    name: 'CSS Custom Properties (Variables)',
                    description: 'User-defined values that can be reused throughout a stylesheet',
                    baseline: 'high',
                    baseline_high_date: '2017-10-31',
                    spec: 'https://www.w3.org/TR/css-variables-1/',
                    caniuse: 'css-variables',
                    support: {
                        'Chrome': '49',
                        'Firefox': '31',
                        'Safari': '9.1',
                        'Edge': '16'
                    }
                },
                {
                    id: 'css-container-queries',
                    name: 'CSS Container Queries',
                    description: 'Query the size of a container to style its children',
                    baseline: 'low',
                    baseline_low_date: '2023-09-14',
                    spec: 'https://www.w3.org/TR/css-contain-3/',
                    caniuse: 'css-container-queries',
                    support: {
                        'Chrome': '105',
                        'Firefox': '110',
                        'Safari': '16',
                        'Edge': '105'
                    }
                },
                {
                    id: 'css-subgrid',
                    name: 'CSS Subgrid',
                    description: 'Grid items can participate in their parent grid',
                    baseline: false,
                    spec: 'https://www.w3.org/TR/css-grid-2/',
                    caniuse: 'css-subgrid',
                    support: {
                        'Chrome': '117',
                        'Firefox': '71',
                        'Safari': '16',
                        'Edge': '117'
                    }
                },
                {
                    id: 'fetch-api',
                    name: 'Fetch API',
                    description: 'Modern replacement for XMLHttpRequest',
                    baseline: 'high',
                    baseline_high_date: '2017-10-31',
                    spec: 'https://fetch.spec.whatwg.org/',
                    caniuse: 'fetch',
                    support: {
                        'Chrome': '42',
                        'Firefox': '39',
                        'Safari': '10.1',
                        'Edge': '14'
                    }
                },
                {
                    id: 'async-await',
                    name: 'Async/Await',
                    description: 'Syntactic sugar for promises',
                    baseline: 'high',
                    baseline_high_date: '2017-10-31',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'async-functions',
                    support: {
                        'Chrome': '55',
                        'Firefox': '52',
                        'Safari': '10.1',
                        'Edge': '14'
                    }
                },
                {
                    id: 'optional-chaining',
                    name: 'Optional Chaining',
                    description: 'Safe property access with ?. operator',
                    baseline: 'low',
                    baseline_low_date: '2020-03-10',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'mdn-javascript_operators_optional_chaining',
                    support: {
                        'Chrome': '91',
                        'Firefox': '74',
                        'Safari': '13.1',
                        'Edge': '91'
                    }
                },
                {
                    id: 'nullish-coalescing',
                    name: 'Nullish Coalescing',
                    description: '?? operator for null/undefined checks',
                    baseline: 'low',
                    baseline_low_date: '2020-03-10',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'mdn-javascript_operators_nullish_coalescing',
                    support: {
                        'Chrome': '80',
                        'Firefox': '72',
                        'Safari': '13.1',
                        'Edge': '80'
                    }
                },
                {
                    id: 'web-components',
                    name: 'Web Components',
                    description: 'Custom elements, shadow DOM, and HTML templates',
                    baseline: 'high',
                    baseline_high_date: '2018-10-30',
                    spec: 'https://www.w3.org/TR/components-intro/',
                    caniuse: 'custom-elementsv1',
                    support: {
                        'Chrome': '67',
                        'Firefox': '63',
                        'Safari': '10.1',
                        'Edge': '79'
                    }
                }
            ];
            // Populate the features map
            sampleFeatures.forEach(feature => {
                this.features.set(feature.id, feature);
            });
            this.initialized = true;
            console.log(`Baseline Map: Loaded ${this.features.size} web features`);
        }
        catch (error) {
            console.error('Failed to initialize baseline data:', error);
        }
    }
    getFeature(featureId) {
        return this.features.get(featureId);
    }
    findFeatureByKeyword(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        // Direct ID match
        if (this.features.has(lowerKeyword)) {
            return this.features.get(lowerKeyword);
        }
        // Search by name or description
        for (const feature of this.features.values()) {
            if (feature.name.toLowerCase().includes(lowerKeyword) ||
                feature.description?.toLowerCase().includes(lowerKeyword)) {
                return feature;
            }
        }
        return undefined;
    }
    getAllFeatures() {
        return Array.from(this.features.values());
    }
    isInitialized() {
        return this.initialized;
    }
    getBaselineColor(baseline) {
        switch (baseline) {
            case 'high': return '#22c55e'; // green
            case 'low': return '#3b82f6'; // blue
            case false: return '#B8860B'; // dark gold
        }
    }
    getBaselineLabel(baseline) {
        switch (baseline) {
            case 'high': return 'Baseline: Widely Available';
            case 'low': return 'Baseline: Newly Available';
            case false: return 'Baseline: Limited Availability';
        }
    }
    getBaselineIcon(baseline) {
        switch (baseline) {
            case 'high': return '✅';
            case 'low': return '⚠️';
            case false: return '❌';
        }
    }
}
exports.BaselineDataProvider = BaselineDataProvider;
//# sourceMappingURL=baselineData.js.map