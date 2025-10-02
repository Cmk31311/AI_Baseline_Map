import * as vscode from 'vscode';

export interface FeatureNode {
    id: string;
    name: string;
    description?: string;
    baseline: 'high' | 'low' | false;
    baseline_low_date?: string;
    baseline_high_date?: string;
    support?: Record<string, string>;
    spec?: string;
    caniuse?: string;
}

export class BaselineDataProvider {
    private features: Map<string, FeatureNode> = new Map();
    private initialized = false;

    constructor() {
        this.initializeData();
    }

    private async initializeData() {
        try {
            // In a real extension, you would load this from web-features package
            // For now, we'll create a sample dataset
            const sampleFeatures: FeatureNode[] = [
                // CSS Layout Features
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
                },
                
                // Additional CSS Properties
                {
                    id: 'css-transforms',
                    name: 'CSS Transforms',
                    description: '2D and 3D transformations',
                    baseline: 'high',
                    baseline_high_date: '2015-07-29',
                    spec: 'https://www.w3.org/TR/css-transforms-1/',
                    caniuse: 'transforms2d',
                    support: {
                        'Chrome': '36',
                        'Firefox': '16',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                {
                    id: 'css-transitions',
                    name: 'CSS Transitions',
                    description: 'Smooth transitions between CSS property values',
                    baseline: 'high',
                    baseline_high_date: '2015-07-29',
                    spec: 'https://www.w3.org/TR/css-transitions-1/',
                    caniuse: 'css-transitions',
                    support: {
                        'Chrome': '26',
                        'Firefox': '16',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                {
                    id: 'css-animations',
                    name: 'CSS Animations',
                    description: 'Keyframe-based animations',
                    baseline: 'high',
                    baseline_high_date: '2015-07-29',
                    spec: 'https://www.w3.org/TR/css-animations-1/',
                    caniuse: 'css-animation',
                    support: {
                        'Chrome': '43',
                        'Firefox': '16',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                {
                    id: 'css-position-sticky',
                    name: 'CSS position: sticky',
                    description: 'Sticky positioning',
                    baseline: 'high',
                    baseline_high_date: '2020-01-15',
                    spec: 'https://www.w3.org/TR/css-position-3/',
                    caniuse: 'css-sticky',
                    support: {
                        'Chrome': '56',
                        'Firefox': '32',
                        'Safari': '13',
                        'Edge': '16'
                    }
                },
                {
                    id: 'css-object-fit',
                    name: 'CSS object-fit',
                    description: 'Control how replaced elements fit their container',
                    baseline: 'high',
                    baseline_high_date: '2020-01-15',
                    spec: 'https://www.w3.org/TR/css-images-3/',
                    caniuse: 'object-fit',
                    support: {
                        'Chrome': '32',
                        'Firefox': '36',
                        'Safari': '10',
                        'Edge': '16'
                    }
                },
                {
                    id: 'css-aspect-ratio',
                    name: 'CSS aspect-ratio',
                    description: 'Set preferred aspect ratio for elements',
                    baseline: 'low',
                    baseline_low_date: '2023-03-14',
                    spec: 'https://www.w3.org/TR/css-sizing-4/',
                    caniuse: 'mdn-css_properties_aspect-ratio',
                    support: {
                        'Chrome': '88',
                        'Firefox': '89',
                        'Safari': '15',
                        'Edge': '88'
                    }
                },
                {
                    id: 'css-gap',
                    name: 'CSS gap',
                    description: 'Gap between flex and grid items',
                    baseline: 'high',
                    baseline_high_date: '2021-09-14',
                    spec: 'https://www.w3.org/TR/css-align-3/',
                    caniuse: 'flexbox-gap',
                    support: {
                        'Chrome': '84',
                        'Firefox': '63',
                        'Safari': '14.1',
                        'Edge': '84'
                    }
                },
                
                // JavaScript ES6+ Features
                {
                    id: 'arrow-functions',
                    name: 'Arrow Functions',
                    description: 'Concise function syntax with lexical this binding',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'arrow-functions',
                    support: {
                        'Chrome': '45',
                        'Firefox': '22',
                        'Safari': '10',
                        'Edge': '12'
                    }
                },
                {
                    id: 'template-literals',
                    name: 'Template Literals',
                    description: 'String literals with embedded expressions',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'template-literals',
                    support: {
                        'Chrome': '41',
                        'Firefox': '34',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                {
                    id: 'destructuring',
                    name: 'Destructuring Assignment',
                    description: 'Extract values from arrays or properties from objects',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'mdn-javascript_operators_destructuring',
                    support: {
                        'Chrome': '49',
                        'Firefox': '41',
                        'Safari': '8',
                        'Edge': '14'
                    }
                },
                {
                    id: 'spread-operator',
                    name: 'Spread Operator',
                    description: 'Expand iterables into individual elements',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'mdn-javascript_operators_spread',
                    support: {
                        'Chrome': '46',
                        'Firefox': '16',
                        'Safari': '8',
                        'Edge': '12'
                    }
                },
                {
                    id: 'rest-parameters',
                    name: 'Rest Parameters',
                    description: 'Collect multiple arguments into an array',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'rest-parameters',
                    support: {
                        'Chrome': '47',
                        'Firefox': '15',
                        'Safari': '10',
                        'Edge': '12'
                    }
                },
                {
                    id: 'default-parameters',
                    name: 'Default Parameters',
                    description: 'Default values for function parameters',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'es6-default-parameters',
                    support: {
                        'Chrome': '49',
                        'Firefox': '15',
                        'Safari': '10',
                        'Edge': '14'
                    }
                },
                
                // Modern JavaScript APIs
                {
                    id: 'promise',
                    name: 'Promises',
                    description: 'Asynchronous operation handling',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'promises',
                    support: {
                        'Chrome': '32',
                        'Firefox': '29',
                        'Safari': '8',
                        'Edge': '12'
                    }
                },
                {
                    id: 'array-includes',
                    name: 'Array.prototype.includes',
                    description: 'Check if array contains a value',
                    baseline: 'high',
                    baseline_high_date: '2018-01-29',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'array-includes',
                    support: {
                        'Chrome': '47',
                        'Firefox': '43',
                        'Safari': '9',
                        'Edge': '14'
                    }
                },
                {
                    id: 'array-find',
                    name: 'Array.prototype.find',
                    description: 'Find first element matching condition',
                    baseline: 'high',
                    baseline_high_date: '2017-03-14',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'array-find',
                    support: {
                        'Chrome': '45',
                        'Firefox': '25',
                        'Safari': '8',
                        'Edge': '12'
                    }
                },
                {
                    id: 'object-assign',
                    name: 'Object.assign',
                    description: 'Copy properties from source objects to target',
                    baseline: 'high',
                    baseline_high_date: '2018-01-29',
                    spec: 'https://tc39.es/ecma262/',
                    caniuse: 'object-assign',
                    support: {
                        'Chrome': '45',
                        'Firefox': '34',
                        'Safari': '9',
                        'Edge': '12'
                    }
                },
                
                // CSS Selectors
                {
                    id: 'css-has',
                    name: 'CSS :has() Selector',
                    description: 'Parent selector based on child elements',
                    baseline: 'low',
                    baseline_low_date: '2023-12-14',
                    spec: 'https://www.w3.org/TR/selectors-4/',
                    caniuse: 'css-has',
                    support: {
                        'Chrome': '105',
                        'Firefox': '121',
                        'Safari': '15.4',
                        'Edge': '105'
                    }
                },
                {
                    id: 'css-nth-child-of',
                    name: 'CSS :nth-child(An+B of S)',
                    description: 'Advanced nth-child selector with of syntax',
                    baseline: false,
                    spec: 'https://www.w3.org/TR/selectors-4/',
                    caniuse: 'css-nth-child-of',
                    support: {
                        'Chrome': '111',
                        'Firefox': '113',
                        'Safari': '9',
                        'Edge': '111'
                    }
                }
            ];

            // Populate the features map
            sampleFeatures.forEach(feature => {
                this.features.set(feature.id, feature);
            });

            this.initialized = true;
            console.log(`Baseline Map: Loaded ${this.features.size} web features`);
            console.log('Baseline Map: Available features:', Array.from(this.features.keys()));
        } catch (error) {
            console.error('Failed to initialize baseline data:', error);
        }
    }

    public getFeature(featureId: string): FeatureNode | undefined {
        return this.features.get(featureId);
    }

    public findFeatureByKeyword(keyword: string): FeatureNode | undefined {
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

    public getAllFeatures(): FeatureNode[] {
        return Array.from(this.features.values());
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    public getBaselineColor(baseline: 'high' | 'low' | false): string {
        switch (baseline) {
            case 'high': return '#22c55e'; // green
            case 'low': return '#3b82f6';  // blue
            case false: return '#B8860B';  // dark gold
        }
    }

    public getBaselineLabel(baseline: 'high' | 'low' | false): string {
        switch (baseline) {
            case 'high': return 'Baseline: Widely Available';
            case 'low': return 'Baseline: Newly Available';
            case false: return 'Baseline: Limited Availability';
        }
    }

    public getBaselineIcon(baseline: 'high' | 'low' | false): string {
        switch (baseline) {
            case 'high': return '✅';
            case 'low': return '⚠️';
            case false: return '❌';
        }
    }
}
