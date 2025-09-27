import { useMemo, useState, useEffect } from 'react';
import PackMap from './components/PackMap';
import { labelForBaseline } from './lib/baseline';
import type { FeatureLeaf } from './lib/baseline';
import './index.css';
import ChatBot from './components/ChatBot';

export default function App() {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'low' | 'false'>('all');
  const [selected, setSelected] = useState<FeatureLeaf | null>(null);

  const [showChat, setShowChat] = useState(false);
  const [showBackToMain, setShowBackToMain] = useState(false);

  // Back to Main button functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToMain(scrollTop > 100); // Show button after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // Try to find the actual scrollable element
    const scrollableElement = document.scrollingElement || document.documentElement || document.body;
    
    // Force scroll on the main scrollable element
    scrollableElement.scrollTop = 0;
    
    // Also try window scroll
    window.scrollTo(0, 0);
    
    // Force scroll on all possible containers
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop = 0;
      }
    });
  };

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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            title="Filter by Baseline status"
          >
            <option value="all">All statuses</option>
            <option value="high">Baseline: Widely Available</option>
            <option value="low">Baseline: Newly Available</option>
            <option value="false">Baseline: Limited Availability</option>
          </select>
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

      <footer className="footer">
        <div>
          Data source: <strong>web-features</strong> (official Baseline data).<br/>
          Baseline statuses: <em>Widely</em> = “high”, <em>Newly</em> = “low”, <em>Limited</em> = false. 
        </div>
      </footer>

      {/* Floating chat toggle */}
      <div className="chat-toggle-container">
        <div className={`chat-toggle-text ${showChat ? 'chat-toggle-text-hidden' : ''}`}>
          Hi, how can I help you?
        </div>
        <button className="chat-toggle" onClick={() => setShowChat(true)} aria-label="Open Baseline Bot">
          <div className="ai-icon">
            <svg viewBox="0 0 24 24" className="ai-brain">
              <defs>
                <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              {/* AI Brain */}
              <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 2.8 1.2 3.8-.7 1.2-1.2 2.5-1.2 3.9 0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.4-.5-2.7-1.2-3.9.7-1 1.2-2.3 1.2-3.8 0-3.5-2.5-6-6-6z" fill="url(#brainGradient)" />
              {/* Neural Network Lines */}
              <path d="M8 8h8M8 12h8M8 16h8" stroke="url(#circuitGradient)" strokeWidth="1" opacity="0.6" />
              {/* Circuit Nodes */}
              <circle cx="8" cy="8" r="1" fill="#00d4ff" />
              <circle cx="16" cy="8" r="1" fill="#7c3aed" />
              <circle cx="8" cy="12" r="1" fill="#ec4899" />
              <circle cx="16" cy="12" r="1" fill="#00d4ff" />
              <circle cx="8" cy="16" r="1" fill="#7c3aed" />
              <circle cx="16" cy="16" r="1" fill="#ec4899" />
              {/* Central Processing Unit */}
              <rect x="10" y="10" width="4" height="4" rx="1" fill="url(#brainGradient)" opacity="0.8" />
            </svg>
            <div className="ai-pulse"></div>
            <div className="ai-glow"></div>
          </div>
        </button>
      </div>

      {showChat && (
        <div className="chatbot-wrap">
          <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}

      {/* Back to Main Button */}
      <button 
        className="back-to-main visible"
        onClick={scrollToTop}
        aria-label="Back to main page"
        style={{ opacity: 1, visibility: 'visible', transform: 'translateY(0)' }}
      >
        Back to Main
      </button>
    </div>
  );
}


function EmptyPanel() {
  return (
    <div className="panel-empty">
      <h2>Welcome to the Baseline Map</h2>
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
            <span className="dot dot-amber" />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Newly Available</strong>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Recently reached Baseline
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="dot dot-red" />
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

  const getStatusColor = (baseline: any) => {
    if (baseline === 'high') return 'var(--green)';
    if (baseline === 'low') return 'var(--amber)';
    return 'var(--red)';
  };

  const getStatusIcon = (baseline: any) => {
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
              // Determine support level based on feature baseline + individual browser version info
              const versionString = version.toString().toLowerCase();
              let supportLevel;
              let supportStatus;
              
              // First check the feature's overall baseline status as primary indicator
              const isWidelySupported = s.baseline === 'high';
              const isNewlySupported = s.baseline === 'low';
              const isLimitedSupported = s.baseline === null || s.baseline === false || !s.baseline;
              
              // Then check individual browser version data
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
                // If baseline is limited, always show as limited regardless of individual browser support
                supportLevel = hasFullSupport ? 50 : 30;
                supportStatus = 'limited';
              } else {
                // Fallback based on version string
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
