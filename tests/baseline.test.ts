import { describe, it, expect } from 'vitest'
import { getAllFeatures, buildHierarchy, colorForBaseline, labelForBaseline } from '../src/lib/baseline'
import type { BaselineLevel } from '../src/lib/baseline'

describe('Baseline feature mapping and web-features integration', () => {
  it('should load features from web-features package', () => {
    const features = getAllFeatures()
    
    expect(features.length).toBeGreaterThan(0)
    expect(features[0]).toHaveProperty('id')
    expect(features[0]).toHaveProperty('name')
    expect(features[0]).toHaveProperty('baseline')
  })

  it('should correctly categorize baseline status levels', () => {
    const features = getAllFeatures()
    
    // Find features with different baseline statuses
    const baselineFeatures = features.filter(f => f.baseline !== false)
    expect(baselineFeatures.length).toBeGreaterThan(0)
    
    // Verify baseline level values are valid
    features.forEach(feature => {
      expect(typeof feature.baseline).toMatch(/^(string|boolean)$/)
      if (typeof feature.baseline === 'string') {
        expect(['high', 'low']).toContain(feature.baseline)
      }
    })
  })

  it('should build feature hierarchy correctly', () => {
    const root = buildHierarchy()
    
    expect(root.name).toBe('Web Platform')
    expect(root.children.length).toBeGreaterThan(0)
    
    root.children.forEach(group => {
      expect(group).toHaveProperty('id')
      expect(group).toHaveProperty('name')
      expect(group).toHaveProperty('children')
    })
  })

  it('should filter features by IDs when provided', () => {
    const features = getAllFeatures()
    const testFeatureIds = new Set([features[0].id, features[1]?.id].filter(Boolean))
    
    const filteredRoot = buildHierarchy(testFeatureIds)
    
    // Count total features in filtered hierarchy
    const allFilteredFeatures: any[] = []
    const stack = [...filteredRoot.children]
    
    while (stack.length > 0) {
      const node = stack.pop()
      if (node && 'type' in node && node.type === 'feature') {
        allFilteredFeatures.push(node)
      } else if (node && 'children' in node) {
        stack.push(...node.children)
      }
    }
    
    expect(allFilteredFeatures.length).toBeLessThanOrEqual(testFeatureIds.size)
  })

  it('should provide consistent baseline color mapping', () => {
    const testCases: { level: BaselineLevel; expectedColor: string }[] = [
      { level: 'high', expectedColor: '#22c55e' },
      { level: 'low', expectedColor: '#f59e0b' },
      { level: false, expectedColor: '#ef4444' }
    ]

    testCases.forEach(({ level, expectedColor }) => {
      expect(colorForBaseline(level)).toBe(expectedColor)
    })
  })

  it('should provide readable baseline labels', () => {
    const testCases: { level: BaselineLevel; expectedLabel: string }[] = [
      { level: 'high', expectedLabel: 'Baseline: Widely available' },
      { level: 'low', expectedLabel: 'Baseline: Newly available' },
      { level: false, expectedLabel: 'Baseline: Limited availability' }
    ]

    testCases.forEach(({ level, expectedLabel }) => {
      expect(labelForBaseline(level)).toBe(expectedLabel)
    })
  })

  it('should extract proper groups from known feature patterns', () => {
    const features = getAllFeatures()
    
    // Test CSS features
    const cssFeatures = features.filter(f => f.id.startsWith('css-'))
    if (cssFeatures.length > 0) {
      expect(cssFeatures[0].group).toBe('css')
    }
    
    // Test JavaScript features  
    const jsFeatures = features.filter(f => f.id.startsWith('js-') || f.id.includes('javascript'))
    if (jsFeatures.length > 0) {
      expect(jsFeatures[0].group).toMatch(/javascript|misc/)
    }
  })

  it('should have valid support data for features with support', () => {
    const features = getAllFeatures()
    const featuresWithSupport = features.filter(f => f.support && Object.keys(f.support).length > 0)
    
    if (featuresWithSupport.length > 0) {
      const feature = featuresWithSupport[0]
      const browsers = Object.keys(feature.support!)
      
      expect(browsers.length).toBeGreaterThan(0)
      // Check if any browser names match known browser patterns
      const knownBrowserPatterns = ['chrome', 'firefox', 'safari', 'edge', 'webkit', 'blink']
      const firstBrowser = browsers[0].toLowerCase()
      const matchesKnownPattern = knownBrowserPatterns.some(pattern => 
        firstBrowser.includes(pattern) || pattern.includes(firstBrowser)
      )
      expect(matchesKnownPattern).toBeTruthy()
    }
  })
})
