import React from 'react';
import { X, ShieldCheck, Lock, Cpu, Server } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="privacy-modal-backdrop" onClick={onClose}>
      <div className="privacy-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '2px solid var(--base-300)', paddingBottom: '1rem' }}>
          <div>
            <div className="juno-tag" style={{ marginBottom: '0.5rem', background: 'var(--accent-1)' }}>
              <span>▶</span> PRIVACY & SECURITY DIRECTIVE // v1.0
            </div>
            <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--base-300)' }}>
              PRIVACY POLICY
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--base-300)',
              color: 'var(--base-100)',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px var(--accent-2)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
          
          <div style={{ background: 'var(--base-200)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--base-300)' }}>
              <ShieldCheck size={18} color="var(--accent-green)" />
              <span>COMMITMENT TO CANDIDATE DATA PRIVACY</span>
            </div>
            <p className="md" style={{ margin: 0, color: 'var(--base-secondary-dark)' }}>
              The AI Technical Interviewer Agent platform processes candidate resumes, technical session responses, and LLM evaluations exclusively for technical assessment purposes during active interview sessions.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--base-300)', marginBottom: '0.5rem' }}>
              1. DATA COLLECTION & IN-MEMORY PROCESSING
            </h3>
            <p style={{ color: 'var(--base-secondary-dark)', marginBottom: '0.5rem' }}>
              Candidate profiles loaded into the application (e.g. system dossiers) and interactive turn transcript messages are processed in-memory for session evaluation. We do not sell, monetize, or harvest personal contact details.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--base-300)', marginBottom: '0.5rem' }}>
              2. LLM ROUTER & PROVIDER DISCLOSURES
            </h3>
            <p style={{ color: 'var(--base-secondary-dark)' }}>
              When an interview turn is evaluated, context snippets are securely routed to the configured provider API (Google Gemini, Anthropic Claude, Groq, or DeepSeek). Payload requests strictly contain interview prompt context and candidate answer strings required for evaluation scoring.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--base-300)', marginBottom: '0.5rem' }}>
              3. SESSION SECURITY & STORAGE
            </h3>
            <p style={{ color: 'var(--base-secondary-dark)' }}>
              Session metrics (latency, question coverage counters, radar breakdown scores) are stored transiently in active server memory and clear automatically when sessions are reset or terminated.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div className="juno-tag">
              <Lock size={12} /> SSL 256-BIT ENCRYPTED
            </div>
            <div className="juno-tag">
              <Server size={12} /> ZERO PERSISTENT COOKIES
            </div>
            <div className="juno-tag">
              <Cpu size={12} /> MULTI-LLM SANITIZED
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid var(--base-300)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            className="juno-btn-primary"
            style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}
          >
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
