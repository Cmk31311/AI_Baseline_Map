declare module 'web-features' {
  export const features: Record<string, {
    name: string;
    group?: string;
    description?: string;
    description_html?: string;
    spec?: string;
    caniuse?: string;
    compat_features?: string[];
    status: {
      baseline: 'high' | 'low' | false;
      baseline_low_date?: string;
      baseline_high_date?: string;
      support?: Record<string, string>;
    };
  }>;

  export const groups: Record<string, {
    name: string;
    parent?: string;
  }>;

  export const browsers: any;
  export const snapshots: any;
}
declare module 'web-features/data.json' {
  const data: any;
  export default data;
}

