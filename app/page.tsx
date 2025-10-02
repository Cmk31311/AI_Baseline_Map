'use client';

import { useMemo, useState, useEffect } from 'react';
import PackMap from '../src/components/PackMap';
import { labelForBaseline } from '../src/lib/baseline';
import type { FeatureLeaf } from '../src/lib/baseline';
import ChatBot from '../src/components/ChatBot';

export default function HomePage() {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'low' | 'false'>('all');
  const [selected, setSelected] = useState<FeatureLeaf | null>(null);
  const [showChat, setShowChat] = useState(false);



  return (
    <div className="app">
      
      <header className="app-header">
        <div className="title">
          <span>🧭 The Baseline Map</span>
        </div>
        <div className="controls">
          <input
            className="input"
            placeholder="Search features (e.g., subgrid, fetch, :has())"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'high' | 'low' | 'false')}
            title="Filter by Baseline status"
          >
            <option value="all">All statuses</option>
            <option value="high">Baseline: Widely Available</option>
            <option value="low">Baseline: Newly Available</option>
            <option value="false">Baseline: Limited Availability</option>
          </select>
          <button
            onClick={() => window.location.href = '/analyzer'}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📊 Code Analyzer
          </button>
          <button
            onClick={() => window.location.href = '/extensions/vscode'}
            className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            🔧 VS Code Extension
          </button>
          <button
            onClick={() => window.location.href = '/extensions/eslint'}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            📋 ESLint Plugin
          </button>
        </div>
      </header>

      <main className="main">
        <section className="canvas">
          <PackMap
            filterText={filterText}
            statusFilter={statusFilter}
            onSelectFeature={(leaf) => setSelected(leaf)}
          />
        </section>

        <aside className="sidebar">
          {!selected ? (
            <EmptyPanel />
          ) : (
            <DetailsPanel leaf={selected} />
          )}
        </aside>
      </main>

      {/* Scroll to Top Button */}
      <div style={{
        position: 'fixed',
        bottom: '15px',
        left: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => {
            console.log('Scroll to top button clicked!');
            // Force scroll to top with multiple methods
            try {
              // Method 1: Modern smooth scroll
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            } catch (e) {
              console.log('Smooth scroll failed, trying instant scroll');
            }
            
            // Method 2: Direct scrollTop assignment
            setTimeout(() => {
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
              window.scrollY = 0;
              window.pageYOffset = 0;
            }, 100);
            
            // Method 3: Force scroll with scrollIntoView
            setTimeout(() => {
              const header = document.querySelector('header');
              if (header) {
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 200);
          }}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            minWidth: '120px',
            height: '44px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          ⬆️ Scroll to Top
        </button>
      </div>

      <footer className="footer">
        <div>
          Data source: <strong>web-features</strong> (official Baseline data).<br/>
          Baseline statuses: <em>Widely</em> = &quot;high&quot;, <em>Newly</em> = &quot;low&quot;, <em>Limited</em> = false.
        </div>
      </footer>

      {/* AI Chat Button */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setShowChat(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🤖
        </button>
      </div>

      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '500px',
          height: '600px',
          zIndex: 1001
        }}>
          <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}

    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="panel-empty">
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 30%, #FFD700 60%, #DAA520 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        Welcome to the Baseline Map
      </h2>
      <p>Explore web features and their Baseline status. Hover over any bubble to see its status, or click to view detailed information.</p>
      
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--ink-secondary)' }}>
          Feature Status Guide
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="dot dot-green" />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Widely Available</strong>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Safe to use everywhere
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="dot dot-blue" />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Newly Available</strong>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Recently reached Baseline
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="dot dot-gold" />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Limited Availability</strong>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Not Baseline yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsPanel({ leaf }: { leaf: FeatureLeaf }) {
  const s = leaf.data;

  const baselineLine = useMemo(() => labelForBaseline(s.baseline), [s.baseline]);

  const getStatusColor = (baseline: 'high' | 'low' | false) => {
    if (baseline === 'high') return 'var(--green)';
    if (baseline === 'low') return 'var(--blue)';
    return '#B8860B'; // Dark gold color
  };

  const getStatusIcon = (baseline: 'high' | 'low' | false) => {
    if (baseline === 'high') return '✓';
    if (baseline === 'low') return '⚠';
    return '✗';
  };

  return (
    <div className="panel">
      <h2 className="panel-title">{s.name}</h2>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px',
        padding: '8px 12px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: `1px solid ${getStatusColor(s.baseline)}20`
      }}>
        <span style={{ 
          fontSize: '16px', 
          color: getStatusColor(s.baseline),
          fontWeight: '600'
        }}>
          {getStatusIcon(s.baseline)}
        </span>
        <span style={{ 
          color: getStatusColor(s.baseline),
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {baselineLine}
        </span>
      </div>

      {s.baseline_high_date && (
        <div className="panel-line">
          <strong>Widely since:</strong> {s.baseline_high_date}
        </div>
      )}
      {!s.baseline_high_date && s.baseline_low_date && (
        <div className="panel-line">
          <strong>Newly since:</strong> {s.baseline_low_date}
        </div>
      )}
      
      {s.description && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--ink-secondary)', 
            marginBottom: '8px' 
          }}>
            Description
          </h3>
          <p className="panel-desc">{s.description}</p>
        </div>
      )}

      <div className="panel-links">
        {s.spec && <a href={s.spec} target="_blank" rel="noreferrer">📋 Spec</a>}
        {s.caniuse && <a href={`https://caniuse.com/${s.caniuse}`} target="_blank" rel="noreferrer">📊 Can I Use</a>}
      </div>

      {s.support && (
        <div className="browser-support-section">
          <h3 className="browser-section-title">Browser Support</h3>
          
          <div className="browser-bars">
            {Object.entries(s.support).map(([browser, version]) => {
              const versionString = version.toString().toLowerCase();
              let supportLevel;
              let supportStatus;
              
              const isWidelySupported = s.baseline === 'high';
              const isNewlySupported = s.baseline === 'low';
              const isLimitedSupported = s.baseline === null || s.baseline === false || !s.baseline;
              
              const hasFullSupport = versionString.includes('all') || versionString === 'yes' || 
                                   versionString.startsWith('3') || versionString === 'supported' ||
                                   versionString === 'esr' || (!versionString.includes('-') && versionString.match(/^\d+$/));
              const hasLimitedSupport = versionString.includes('partial') || versionString.includes('limited') ||
                                       versionString.includes('no') || versionString === 'unsupported' ||
                                       versionString.includes('-') || versionString.includes('prefixed');
              
              if (isWidelySupported && hasFullSupport) {
                supportLevel = 100;
                supportStatus = 'full';
              } else if (isNewlySupported && hasFullSupport) {
                supportLevel = 80;
                supportStatus = 'partial';
              } else if (isNewlySupported) {
                supportLevel = 60;
                supportStatus = 'partial';
              } else if (isLimitedSupported) {
                supportLevel = hasFullSupport ? 50 : 30;
                supportStatus = 'limited';
              } else {
                supportLevel = hasFullSupport ? 80 : hasLimitedSupport ? 30 : 50;
                supportStatus = hasFullSupport ? 'partial' : hasLimitedSupport ? 'limited' : 'partial';
              }
              
              return (
                <div key={browser} className={`browser-bar browser-${browser.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="browser-label">
                    <span className="browser-name">{browser}</span>
                    <span className="browser-version">Version: {version}</span>
                  </div>
                  <div className="support-indicator">
                    <div className="support-progress-container">
                      <div 
                        className={`support-bar supported-${supportStatus}`}
                        style={{ width: `${supportLevel}%` }}
                      ></div>
                    </div>
                    <span className={`status-text status-${supportStatus}`}>
                      {supportStatus === 'full' ? 'Full' : supportStatus === 'partial' ? 'Partial' : 'Limited'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      

    </div>
  );
}