import React from 'react';
import { Cpu, Zap, Activity } from 'lucide-react';

interface HeaderProps {
  activeProvider: string;
  onProviderChange: (provider: string) => void;
  latencyMs: number | null;
  serverStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeProvider,
  onProviderChange,
  latencyMs,
  serverStatus
}) => {
  return (
    <header className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.01em', color: 'var(--base-text)' }}>
            THE INTERVIEW AGENT
          </h1>
          <span className="pill-badge" style={{ color: 'var(--accent-1)' }}>
            ENTERPRISE AI COHORT
          </span>
        </div>
        <p className="mono" style={{ color: 'var(--base-muted)', marginTop: '0.2rem' }}>
          ADAPTIVE MULTI-TURN TECHNICAL INTERVIEW PLATFORM · BUILD THE INTERVIEWER, NOT THE INTERVIEW
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Latency Gauge */}
        <div className="pill-badge" style={{ color: latencyMs && latencyMs < 300 ? 'var(--accent-green)' : 'var(--accent-3)' }}>
          <Zap size={14} />
          <span>{latencyMs !== null ? `${latencyMs}ms` : 'SPEED METRIC'}</span>
        </div>

        {/* LLM Provider Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--base-200)', padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Cpu size={14} style={{ color: 'var(--accent-1)' }} />
          <span className="mono" style={{ fontSize: '0.75rem' }}>PROVIDER:</span>
          <select
            value={activeProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--base-text)',
              border: 'none',
              outline: 'none',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value="auto" style={{ background: '#1e1e1e' }}>Auto-Router (Fastest Tier)</option>
            <option value="Groq" style={{ background: '#1e1e1e' }}>Groq (Llama-3.3 ~150ms)</option>
            <option value="Gemini" style={{ background: '#1e1e1e' }}>Google Gemini 2.5 Flash</option>
            <option value="OpenAI" style={{ background: '#1e1e1e' }}>OpenAI (GPT-4o-mini)</option>
            <option value="Mock" style={{ background: '#1e1e1e' }}>Zero-Latency Mock (&lt;5ms)</option>
          </select>
        </div>

        {/* Server Status Indicator */}
        <div className="pill-badge" style={{ color: serverStatus === 'ok' ? 'var(--accent-green)' : 'var(--accent-2)' }}>
          <Activity size={14} />
          <span>{serverStatus === 'ok' ? 'SYSTEM LIVE' : 'CONNECTING...'}</span>
        </div>
      </div>
    </header>
  );
};
