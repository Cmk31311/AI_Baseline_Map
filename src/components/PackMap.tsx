'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { buildHierarchy, colorForBaseline, labelForBaseline } from '../lib/baseline';
import type { FeatureLeaf, GroupNode, RootNode } from '../lib/baseline';

interface PackMapProps {
  filterText: string;
  statusFilter: 'all' | 'high' | 'low' | 'false';
  onSelectFeature: (leaf: FeatureLeaf) => void;
}

function matchesFilter(name: string, term: string) {
  return name.toLowerCase().includes(term.toLowerCase());
}

export default function PackMap({ filterText, statusFilter, onSelectFeature }: PackMapProps) {
  // Compute filtered set of feature IDs based on text/status filters
  const filteredIds = useMemo(() => {
    if (!filterText && statusFilter === 'all') return undefined;

    const ids = new Set<string>();
    const all = buildHierarchy();
    const stack: Array<GroupNode | FeatureLeaf> = [...all.children];

    const wantStatus = (baseline: 'high' | 'low' | false) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'false') return baseline === false;
      return baseline === statusFilter;
    };

    while (stack.length) {
      const n = stack.pop()!;
      if ('type' in n && n.type === 'feature') {
        const name = n.data.name ?? n.data.id;
        const okText = filterText ? matchesFilter(name, filterText) : true;
        const okStatus = wantStatus(n.data.baseline);
        if (okText && okStatus) ids.add(n.data.id);
      } else if ('children' in n) {
        stack.push(...n.children);
      }
    }
    return ids;
  }, [filterText, statusFilter]);

  // Create hierarchical data
  const rootData: RootNode = useMemo(() => buildHierarchy(filteredIds), [filteredIds]);

  // Extract all features from the hierarchy
  const features = useMemo(() => {
    const features: FeatureLeaf[] = [];
    const stack: Array<GroupNode | FeatureLeaf> = [...rootData.children];

    while (stack.length) {
      const n = stack.pop()!;
      if ('type' in n && n.type === 'feature') {
        features.push(n);
      } else if ('children' in n) {
        stack.push(...n.children);
      }
    }
    return features;
  }, [rootData]);

  // Group all features under single "Baseline Features" heading
  const groupedFeatures = useMemo(() => {
    return {
      'Baseline Features': features
    };
  }, [features]);

  const [hoveredFeature, setHoveredFeature] = useState<FeatureLeaf | null>(null);

  // Animated particles effect
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  const getStatusIcon = (baseline: 'high' | 'low' | false) => {
    if (baseline === 'high') return '✨';
    if (baseline === 'low') return '🆕';
    return '⚠️';
  };

  const getStatusGradient = (baseline: 'high' | 'low' | false) => {
    if (baseline === 'high') return 'linear-gradient(135deg,rgb(58, 245, 182),rgb(41, 230, 160))';
    if (baseline === 'low') return 'linear-gradient(135deg,rgb(73, 142, 252),rgb(73, 150, 245))';
    return 'linear-gradient(135deg,rgb(228, 209, 6),rgb(226, 208, 3))';
  };

  return (
    <div className="honeycomb-container">
      {/* Animated Background Particles */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>


      {/* Modern Card Grid */}
      <div className="modern-grid">
        {Object.entries(groupedFeatures).map(([groupName, groupFeatures]) => {
          return (
            <div key={groupName} className="feature-group">
              <div className="group-header">
                <h3 className="group-title">{groupName}</h3>
                <div className="status-legend">
                  <div className="legend-item">
                    <div className="legend-bar legend-widely"></div>
                    <span className="legend-text">Widely Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-bar legend-newly"></div>
                    <span className="legend-text">Newly Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-bar legend-limited"></div>
                    <span className="legend-text">Limited Availability</span>
                  </div>
                </div>
              </div>
              <div className="cards-container">
                {groupFeatures.map((feature, index) => {
                  const statusColor = colorForBaseline(feature.data.baseline);
                  const statusIcon = getStatusIcon(feature.data.baseline);
                  const statusGradient = getStatusGradient(feature.data.baseline);
                  
                  return (
                    <div
                      key={feature.data.id}
                      className="feature-card-modern"
                      onClick={() => onSelectFeature(feature)}
                      onMouseEnter={() => setHoveredFeature(feature)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      style={{
                        '--status-color': statusColor,
                        '--status-gradient': statusGradient,
                        animationDelay: `${index * 0.05}s`
                      } as React.CSSProperties}
                    >
                      <div className="card-header">
                        <div className="status-indicator-modern">
                          <span className="status-icon-modern">{statusIcon}</span>
                        </div>
                        <div className="feature-name-modern">{feature.data.name || feature.data.id}</div>
                      </div>
                      
                      <div className="card-content">
                        {feature.data.description && (
                          <div className="feature-description-modern">
                            {feature.data.description.length > 80 
                              ? `${feature.data.description.substring(0, 80)}...`
                              : feature.data.description
                            }
                          </div>
                        )}
                        
                        <div className="card-footer">
                          {feature.data.baseline_high_date && (
                            <span className="meta-text">Widely since: {feature.data.baseline_high_date}</span>
                          )}
                          {!feature.data.baseline_high_date && feature.data.baseline_low_date && (
                            <span className="meta-text">Newly since: {feature.data.baseline_low_date}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Subtle glow effect */}
                      <div className="card-glow"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Tooltip */}
      {hoveredFeature && (
        <div className="enhanced-tooltip">
          <div 
            className="tooltip-content"
            style={{
              '--status-color': hoveredFeature.data.baseline === 'high' ? '#6bb86b' : 
                               hoveredFeature.data.baseline === 'low' ? 'var(--blue)' : '#D4AF37',
              '--status-gradient': hoveredFeature.data.baseline === 'high' ? 'linear-gradient(90deg, #6bb86b, #8dd48d)' :
                                 hoveredFeature.data.baseline === 'low' ? 'linear-gradient(90deg, var(--blue), var(--blue-light))' :
                                 'linear-gradient(90deg, #D4AF37, #F4D03F)',
              '--status-border': hoveredFeature.data.baseline === 'high' ? '#6bb86b' :
                               hoveredFeature.data.baseline === 'low' ? 'var(--blue)' : '#D4AF37'
            } as React.CSSProperties}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon">{getStatusIcon(hoveredFeature.data.baseline)}</span>
              <div className="tooltip-title">{hoveredFeature.data.name}</div>
            </div>
            <div className="tooltip-status">{labelForBaseline(hoveredFeature.data.baseline)}</div>
            {hoveredFeature.data.description && (
              <div className="tooltip-description">{hoveredFeature.data.description}</div>
            )}
            {hoveredFeature.data.baseline_high_date && (
              <div className="tooltip-meta">Widely since: {hoveredFeature.data.baseline_high_date}</div>
            )}
            {!hoveredFeature.data.baseline_high_date && hoveredFeature.data.baseline_low_date && (
              <div className="tooltip-meta">Newly since: {hoveredFeature.data.baseline_low_date}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

