export interface BaselineRule {
    name: string;
    description: string;
    baseline: 'high' | 'low' | false;
    message: string;
    suggestion?: string;
    polyfill?: string;
    alternative?: string;
}
export declare const baselineFeatures: Record<string, BaselineRule>;
export declare const cssPatterns: Record<string, RegExp>;
export declare const jsPatterns: Record<string, RegExp>;
//# sourceMappingURL=index.d.ts.map