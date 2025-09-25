import data from 'web-features/data.json';
const { features: featureMap, groups: groupMap } = data as any;

export type BaselineLevel = 'high' | 'low' | false;

export interface FeatureNode {
  id: string;
  name: string;
  description?: string;
  group?: string;
  spec?: string;
  caniuse?: string;
  baseline: BaselineLevel;
  baseline_low_date?: string;
  baseline_high_date?: string;
  support?: Record<string, string>;
}

export interface GroupNode {
  id: string;
  name: string;
  parent?: string;
  children: Array<GroupNode | FeatureLeaf>;
}

export interface FeatureLeaf {
  type: 'feature';
  data: FeatureNode;
}

export interface RootNode {
  name: string;
  children: GroupNode[];
}

export function getAllFeatures(): FeatureNode[] {
  return Object.entries(featureMap).map(([id, f]) => ({
    id,
    name: f.name,
    description: f.description,
    group: f.group,
    spec: f.spec,
    caniuse: f.caniuse,
    baseline: f.status?.baseline ?? false,
    baseline_low_date: f.status?.baseline_low_date,
    baseline_high_date: f.status?.baseline_high_date,
    support: f.status?.support
  }));
}

export function buildHierarchy(filteredIds?: Set<string>): RootNode {
  // Build group nodes
  const groups: Record<string, GroupNode> = {};
  Object.entries(groupMap).forEach(([id, g]) => {
    groups[id] = { id, name: g.name, parent: g.parent, children: [] };
  });

  // Root-level groups (no parent)
  function getRootGroups(): GroupNode[] {
    const root: GroupNode[] = [];
    Object.values(groups).forEach((g) => {
      if (!g.parent) root.push(g);
    });
    return root;
  }

  // Attach subgroups to their parents
  Object.values(groups).forEach((g) => {
    if (g.parent && groups[g.parent]) {
      groups[g.parent].children.push(g);
    }
  });

  // Attach features to their group (fallback to "misc" group if missing)
  const miscId = 'misc';
  if (!groups[miscId]) {
    groups[miscId] = { id: miscId, name: 'Misc', children: [] };
  }

  for (const [id, f] of Object.entries(featureMap)) {
    if (filteredIds && !filteredIds.has(id)) continue;

    const leaf: FeatureLeaf = {
      type: 'feature',
      data: {
        id,
        name: f.name,
        description: f.description,
        group: f.group,
        spec: f.spec,
        caniuse: f.caniuse,
        baseline: f.status?.baseline ?? false,
        baseline_low_date: f.status?.baseline_low_date,
        baseline_high_date: f.status?.baseline_high_date,
        support: f.status?.support,
      },
    };

    const gId = f.group ?? miscId;
    const target = groups[gId] ?? groups[miscId];
    target.children.push(leaf);
  }

  // Only keep top-level groups (no parent) with at least 1 child
  const top = getRootGroups().filter((g) => g.children.length > 0);

  return {
    name: 'Web Platform',
    children: top,
  };
}

export function colorForBaseline(level: BaselineLevel): string {
  if (level === 'high') return '#22c55e'; // green
  if (level === 'low') return '#f59e0b';  // amber
  return '#ef4444';                       // red
}

export function labelForBaseline(level: BaselineLevel): string {
  if (level === 'high') return 'Baseline: Widely available';
  if (level === 'low') return 'Baseline: Newly available';
  return 'Baseline: Limited availability';
}
