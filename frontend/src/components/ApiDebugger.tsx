import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ApiDebuggerProps {
  lastPayload: any;
  lastResponse: any;
}

export const ApiDebugger: React.FC<ApiDebuggerProps> = ({ lastPayload, lastResponse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const data = JSON.stringify({ request: lastPayload, response: lastResponse }, null, 2);
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.9rem 1.5rem',
          background: 'var(--base-200)',
          color: 'var(--base-text)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} style={{ color: 'var(--accent-1)' }} />
          <span>TECHNICAL SPEC PAYLOAD DEBUGGER (POST /api/interview)</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{ padding: '1.25rem', background: '#050505', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'var(--base-300)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={12} style={{ color: 'var(--accent-green)' }} /> : <Copy size={12} />}
              {copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON PAYLOAD'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Request Payload */}
            <div>
              <span className="mono" style={{ color: 'var(--accent-1)', display: 'block', marginBottom: '0.4rem' }}>
                LAST HTTP REQUEST PAYLOAD:
              </span>
              <pre
                style={{
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-green)',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.78rem',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                {lastPayload ? JSON.stringify(lastPayload, null, 2) : '// No request sent yet'}
              </pre>
            </div>

            {/* Response Payload */}
            <div>
              <span className="mono" style={{ color: 'var(--accent-3)', display: 'block', marginBottom: '0.4rem' }}>
                LAST HTTP RESPONSE PAYLOAD:
              </span>
              <pre
                style={{
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-3)',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.78rem',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                {lastResponse ? JSON.stringify(lastResponse, null, 2) : '// No response received yet'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
