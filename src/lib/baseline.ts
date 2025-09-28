'use client';

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

/**
 * Transform web-features data into normalized feature nodes
 * Adds consistent baseline mapping for our UI components
 */
export function getAllFeatures(): FeatureNode[] {
  return Object.entries(featureMap).map(([id, featureData]) => {
    const typedFeature = featureData as any;
    const rawBaseline = typedFeature.status?.baseline ?? false;
    let normalizedBaseline: BaselineLevel = false;
    
    // Normalize baseline to our standard levels
    if (rawBaseline === 'high' || rawBaseline === true) {
      normalizedBaseline = 'high';
    } else if (rawBaseline === 'low') {
      normalizedBaseline = 'low';
    } else {
      normalizedBaseline = false;
    }
    
    return {
      id,
      name: typedFeature.name,
      description: typedFeature.description,
      group: extractGroupFromFeature(id),
      spec: typedFeature.compat?.spec,
      caniuse: typedFeature.compat?.caniuse,
      baseline: normalizedBaseline,
      baseline_low_date: typedFeature.status?.baseline_low_date,
      baseline_high_date: typedFeature.status?.baseline_high_date,
      support: typedFeature.status?.support
    };
  });
}

/**
 * Build a hierarchical structure of features and groups for map visualization
 * Filters features by IDs if provided, otherwise returns all features
 */
export function buildHierarchy(filteredIds?: Set<string>): RootNode {
  // Create group nodes from web-features data
  const groups: Record<string, GroupNode> = {};
  Object.entries(groupMap).forEach(([id, groupData]) => {
    const typedGroup = groupData as any;
    groups[id] = { id, name: typedGroup.name, parent: typedGroup.parent, children: [] };
  });

  // Helper: get top-level groups without parents
  function getRootGroups(): GroupNode[] {
    return Object.values(groups).filter(group => !group.parent);
  }

  // Create parent-child relationships between groups
  Object.values(groups).forEach(group => {
    if (group.parent && groups[group.parent]) {
      groups[group.parent].children.push(group);
    }
  });

  // Create fallback group for baseline features
  const baselineId = 'baseline';
  if (!groups[baselineId]) {
    groups[baselineId] = { id: baselineId, name: 'Baseline Features', children: [] };
  }

  // Process each feature and attach to appropriate group
  Object.entries(featureMap).forEach(([featureId, featureData]) => {
    if (filteredIds && !filteredIds.has(featureId)) return;

    // Normalize baseline level consistently
    const typedFeature = featureData as any;
    const rawBaseline = typedFeature.status?.baseline ?? false;
    let normalizedBaseline: BaselineLevel = false;
    
    if (rawBaseline === 'high' || rawBaseline === true) {
      normalizedBaseline = 'high';
    } else if (rawBaseline === 'low') {
      normalizedBaseline = 'low';
    }

    const leaf: FeatureLeaf = {
      type: 'feature',
      data: {
        id: featureId,
        name: typedFeature.name,
        description: typedFeature.description,
        group: extractGroupFromFeature(featureId),
        spec: typedFeature.compat?.spec,
        caniuse: typedFeature.compat?.caniuse,
        baseline: normalizedBaseline,
        baseline_low_date: typedFeature.status?.baseline_low_date,
        baseline_high_date: typedFeature.status?.baseline_high_date,
        support: typedFeature.status?.support,
      },
    };

    // Attach feature to its corresponding group or baseline
    const groupId = leaf.data.group ?? baselineId;
    const targetGroup = groups[groupId] ?? groups[baselineId];
    targetGroup.children.push(leaf);
  });

  // Filter out empty groups and return top-level structure
  const populatedRootGroups = getRootGroups().filter(group => group.children.length > 0);

  return {
    name: 'Web Platform',
    children: populatedRootGroups,
  };
}

/**
 * Extract category group from feature ID based on common patterns
 */
function extractGroupFromFeature(featureId: string): string {
  if (featureId.startsWith('css-')) return 'css';
  if (featureId.startsWith('js-')) return 'javascript';
  if (featureId.startsWith('html-')) return 'html';
  if (featureId.startsWith('api-')) return 'api';
  if (featureId.startsWith('security-')) return 'security';
  return 'baseline';
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
