import React, { useState } from 'react';
import { Cpu, Zap, Activity, Menu, X, Shield, Play } from 'lucide-react';

interface HeaderProps {
  activeView: 'landing' | 'console';
  onViewChange: (view: 'landing' | 'console') => void;
  activeProvider: string;
  onProviderChange: (provider: string) => void;
  latencyMs: number | null;
  serverStatus: string;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  activeProvider,
  onProviderChange,
  latencyMs,
  serverStatus,
  onOpenPrivacy
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        background: '#ffffff',
        border: '3px solid var(--base-300)',
        borderRadius: '16px',
        padding: '1rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '6px 6px 0px var(--base-300)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => onViewChange('landing')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          >
            <div className="juno-tag" style={{ background: 'var(--accent-1)', marginBottom: '0.2rem' }}>
              <span>▶</span> JUNOWATTS.AI
            </div>
            <h1 className="juno-display-title" style={{ fontSize: '2.2rem', color: 'var(--base-300)', margin: 0 }}>
              AI INTERVIEWER
            </h1>
          </button>
        </div>

        {/* Center: View Mode Nav Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--base-200)', padding: '0.4rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onViewChange('landing')}
            className="juno-mono"
            style={{
              background: activeView === 'landing' ? 'var(--base-300)' : 'transparent',
              color: activeView === 'landing' ? 'var(--base-100)' : 'var(--base-300)',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            [ 01 INDEX ]
          </button>
          <button
            onClick={() => onViewChange('console')}
            className="juno-mono"
            style={{
              background: activeView === 'console' ? 'var(--base-300)' : 'transparent',
              color: activeView === 'console' ? 'var(--base-100)' : 'var(--base-300)',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            [ 02 CONSOLE ]
          </button>
        </div>

        {/* Right: Controls & Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Latency Gauge */}
          <div className="juno-tag" style={{ background: latencyMs !== null && latencyMs < 300 ? 'rgba(137, 197, 101, 0.2)' : 'var(--base-200)' }}>
            <Zap size={13} color="var(--base-300)" />
            <span>{latencyMs !== null ? `${latencyMs}ms` : 'SPEED METRIC'}</span>
          </div>

          {/* LLM Provider Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--base-200)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <Cpu size={14} style={{ color: 'var(--base-300)' }} />
            <span className="juno-mono" style={{ fontSize: '0.75rem' }}>ROUTER:</span>
            <select
              value={activeProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--base-300)',
                border: 'none',
                outline: 'none',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="auto" style={{ background: '#ffffff', color: '#0a0a0a' }}>Auto-Router (Fastest Tier)</option>
              <option value="Groq" style={{ background: '#ffffff', color: '#0a0a0a' }}>Groq (Llama-3.3 ~150ms)</option>
              <option value="Gemini" style={{ background: '#ffffff', color: '#0a0a0a' }}>Google Gemini 2.5 Flash</option>
              <option value="OpenAI" style={{ background: '#ffffff', color: '#0a0a0a' }}>OpenAI (GPT-4o-mini)</option>
              <option value="Mock" style={{ background: '#ffffff', color: '#0a0a0a' }}>Zero-Latency Mock (&lt;5ms)</option>
            </select>
          </div>

          {/* Server Status Indicator */}
          <div className="juno-tag" style={{ background: serverStatus === 'ok' ? 'rgba(137, 197, 101, 0.2)' : 'rgba(242, 172, 172, 0.3)' }}>
            <Activity size={13} color={serverStatus === 'ok' ? 'var(--accent-green)' : 'var(--accent-2)'} />
            <span>{serverStatus === 'ok' ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          {/* Drawer Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'var(--base-300)',
              color: 'var(--base-100)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px var(--accent-1)'
            }}
            aria-label="Toggle navigation drawer"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </header>

      {/* Juno Watts Navigation Drawer Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 2rem',
          color: 'var(--base-100)',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            <div className="juno-tag" style={{ background: 'var(--accent-1)', color: 'var(--base-300)' }}>
              <span>▶</span> NAVIGATION MENU // JUNOWATTS
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              style={{ background: 'var(--base-100)', color: 'var(--base-300)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'DM Mono', fontWeight: 'bold' }}
            >
              CLOSE [X]
            </button>
          </div>

          <nav style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <li>
                <button 
                  onClick={() => { onViewChange('landing'); setMenuOpen(false); }}
                  className="juno-display-title"
                  style={{ background: 'none', border: 'none', color: activeView === 'landing' ? 'var(--accent-1)' : 'var(--base-100)', fontSize: 'clamp(3rem, 7vw, 7rem)', cursor: 'pointer', textAlign: 'left' }}
                >
                  01 // LANDING INDEX
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onViewChange('console'); setMenuOpen(false); }}
                  className="juno-display-title"
                  style={{ background: 'none', border: 'none', color: activeView === 'console' ? 'var(--accent-1)' : 'var(--base-100)', fontSize: 'clamp(3rem, 7vw, 7rem)', cursor: 'pointer', textAlign: 'left' }}
                >
                  02 // CANDIDATE CONSOLE
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onOpenPrivacy(); setMenuOpen(false); }}
                  className="juno-display-title"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-3)', fontSize: 'clamp(3rem, 7vw, 7rem)', cursor: 'pointer', textAlign: 'left' }}
                >
                  03 // PRIVACY DIRECTIVE
                </button>
              </li>
            </ul>
          </nav>

          <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span className="juno-mono" style={{ color: 'var(--base-muted)' }}>JUNO WATTS AI ENGINE · PORT 3000</span>
            <span className="juno-mono" style={{ color: 'var(--accent-2)' }}>NO FILLER EPISODES. CLEAN LAUNCH.</span>
          </div>
        </div>
      )}
    </>
  );
};
