#!/usr/bin/env node
/**
 * Script to verify baseline data import and show key stats
 * Demonstrates web-features package integration
 */

import data from 'web-features/data.json'
import { getAllFeatures, buildHierarchy } from '../src/lib/baseline'

interface WebFeaturesData {
  features: Record<string, any>
  groups: Record<string, any>
}

function showBaselineStats() {
  const { features, groups } = data as WebFeaturesData
  
  const featureCount = Object.keys(features).length
  const groupCount = Object.keys(groups).length
  
  console.log('📊 Baseline Data Integration Stats')
  console.log('=====================================')
  console.log(`Features loaded: ${featureCount}`)
  console.log(`Groups loaded: ${groupCount}`)
  
  const allFeatures = getAllFeatures()
  const hierarchy = buildHierarchy()
  
  // Analyze baseline coverage
  const baselineStats = {
    widely: allFeatures.filter(f => f.baseline === 'high').length,
    newly: allFeatures.filter(f => f.baseline === 'low').length,
    limited: allFeatures.filter(f => f.baseline === false).length
  }
  
  console.log('\n🎯 Baseline Distribution')
  console.log('========================')
  console.log(`Widely available: ${baselineStats.widely}`)
  console.log(`Newly available:  ${baselineStats.newly}`)
  console.log(`Limited coverage: ${baselineStats.limited}`)
  
  // Show top feature groups by size
  const groupSizes: { [key: string]: number } = {}
  const stack = [...hierarchy.children]
  
  while (stack.length > 0) {
    const node = stack.pop()
    if (node && 'type' in node && node.type === 'feature') {
      const group = (node as any).data.group || 'uncategorized'
      groupSizes[group] = (groupSizes[group] || 0) + 1
    } else if (node && 'children' in node) {
      stack.push(...(node as any).children)
    }
  }
  
  const topGroups = Object.entries(groupSizes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
  
  console.log('\n📈 Top Categories by Feature Count')
  console.log('==================================')
  topGroups.forEach(([group, count]) => {
    console.log(`${group}: ${count} features`)
  })
  
  console.log('\n✅ Baseline data loaded successfully')
}

// Execute baseline stats when script runs
showBaselineStats()
