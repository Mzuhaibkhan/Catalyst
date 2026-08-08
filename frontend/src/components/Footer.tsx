import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal, ExternalLink, Activity } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onNavigateConsole: () => void;
  serverStatus: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onNavigateConsole, serverStatus }) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }) + ' EST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      background: 'var(--base-300)',
      color: 'var(--base-100)',
      padding: '3.5rem 2rem 2rem 2rem',
      marginTop: '5rem',
      borderTop: '4px solid var(--accent-1)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Top Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* Brand Col */}
          <div>
            <div className="juno-tag" style={{ background: 'var(--accent-1)', color: 'var(--base-300)', marginBottom: '1rem' }}>
              <span>▶</span> JUNOWATTS.AI // ENGINE
            </div>
            <h2 style={{ fontSize: '3rem', color: 'var(--base-100)', marginBottom: '0.75rem', letterSpacing: '-0.02rem' }}>
              AI INTERVIEWER
            </h2>
            <p style={{ color: 'var(--base-muted)', fontSize: '0.95rem', maxWidth: '380px', lineHeight: '1.6' }}>
              Enterprise technical evaluation platform with dynamic LLM provider routing, candidate dossier context engines, and real-time radar metrics.
            </p>
          </div>

          {/* Quick Links Col */}
          <div>
            <p className="juno-mono" style={{ color: 'var(--accent-3)', marginBottom: '1.25rem' }}>
              <span>▶</span> PLATFORM CONSOLE
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li>
                <button 
                  onClick={onNavigateConsole}
                  style={{ background: 'none', border: 'none', color: 'var(--base-100)', fontFamily: 'DM Mono', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
                >
                  <span>→</span> Interactive Candidate Console
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPrivacy}
                  style={{ background: 'none', border: 'none', color: 'var(--base-100)', fontFamily: 'DM Mono', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
                >
                  <span>→</span> Privacy Policy & Security Directive
                </button>
              </li>
            </ul>
          </div>

          {/* System Capabilities Col */}
          <div>
            <p className="juno-mono" style={{ color: 'var(--accent-1)', marginBottom: '1.25rem' }}>
              <span>▶</span> LLM ROUTER STACK
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'DM Mono', color: 'var(--base-muted)' }}>
              <div><span>▶</span> Google Gemini 1.5 Flash / Pro</div>
              <div><span>▶</span> Anthropic Claude 3.5 Sonnet</div>
              <div><span>▶</span> Groq Llama-3 70B High-Speed</div>
              <div><span>▶</span> DeepSeek V3 Reasoner</div>
            </div>
          </div>

          {/* Live Status Col */}
          <div>
            <p className="juno-mono" style={{ color: 'var(--accent-2)', marginBottom: '1.25rem' }}>
              <span>▶</span> LIVE ENVIRONMENT
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Activity size={16} color={serverStatus === 'ok' ? 'var(--accent-green)' : 'var(--accent-2)'} />
                <span className="juno-mono" style={{ color: serverStatus === 'ok' ? 'var(--accent-green)' : 'var(--accent-2)' }}>
                  {serverStatus === 'ok' ? 'BACKEND ONLINE : PORT 3000' : 'BACKEND DISCONNECTED'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'DM Mono', color: 'var(--base-muted)' }}>
                System Time: {timeString}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="juno-mono" style={{ color: 'var(--base-muted)', fontSize: '0.8rem', margin: 0 }}>
            © {new Date().getFullYear()} JUNOWATTS.AI ARCHITECTURE. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onOpenPrivacy} className="juno-mono" style={{ background: 'none', border: 'none', color: 'var(--accent-1)', cursor: 'pointer', fontSize: '0.8rem' }}>
              PRIVACY POLICY
            </button>
            <span style={{ color: 'var(--base-muted)' }}>|</span>
            <span className="juno-mono" style={{ color: 'var(--base-muted)', fontSize: '0.8rem' }}>
              NO FILLER EPISODES. CLEAN LAUNCH.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
