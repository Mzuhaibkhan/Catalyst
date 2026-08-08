import React, { useState, useEffect, useRef } from 'react';
import { Play, Shield, Cpu, Zap, Activity, ArrowRight, CheckCircle2, Layers, Sparkles, Terminal, Code2 } from 'lucide-react';
import gsap from 'gsap';
import candidatesData from '../../../candidates.json';

interface LandingPageProps {
  onStartConsole: (candidateId?: string) => void;
  onOpenPrivacy: () => void;
  serverStatus: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartConsole, onOpenPrivacy, serverStatus }) => {
  const candidates = candidatesData.candidates || [];
  const [activeCardHover, setActiveCardHover] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const targets = containerRef.current.querySelectorAll('.gsap-reveal');
      gsap.fromTo(
        targets,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} style={{ color: 'var(--base-300)', paddingBottom: '3rem' }}>

      {/* 1. HERO SECTION */}
      <section style={{ paddingTop: '2rem', paddingBottom: '4rem', borderBottom: '2px solid var(--base-300)' }}>
        <div className="juno-container">

          {/* Top Symbol & Alchemy Badge */}
          <div className="gsap-reveal" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="juno-tag" style={{ background: 'var(--accent-1)' }}>
              <span>▶</span> AI INTERVIEW ENGINE
            </div>
            <div className="juno-tag" style={{ background: 'var(--accent-3)' }}>
              <span>▶</span> NEO EDITION
            </div>
            <div className="juno-tag" style={{ background: 'var(--base-200)' }}>
              <Activity size={13} color={serverStatus === 'ok' ? 'var(--accent-green)' : 'var(--accent-2)'} />
              <span>{serverStatus === 'ok' ? 'SYSTEM ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>

          {/* Huge Display Headline */}
          <h1 className="juno-display-title gsap-reveal" style={{ fontSize: 'clamp(4rem, 11vw, 11rem)', marginBottom: '1.5rem', color: 'var(--base-300)' }}>
            INTERVIEW ALCHEMY
          </h1>

          {/* Subtitle Copy & Hero Actions */}
          <div className="gsap-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'end', marginBottom: '3.5rem' }}>
            <div>
              <p className="juno-mono" style={{ color: 'var(--base-muted)', marginBottom: '0.5rem' }}>
                <span>▶</span> ZERO FILLER EPISODES // AUTOMATED TECHNICAL EVALUATION
              </p>
              <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'var(--base-secondary-dark)', maxWidth: '650px' }}>
                Conduct adaptive, multi-turn technical interviews powered by an autonomous LLM router. Evaluate system architecture, live code challenges, and candidate dossier depth in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onStartConsole()}
                className="juno-btn-primary"
              >
                <Play size={20} fill="currentColor" /> LAUNCH CONSOLE
              </button>
              <button
                onClick={onOpenPrivacy}
                className="juno-btn-secondary"
              >
                <Shield size={18} /> PRIVACY DIRECTIVE
              </button>
            </div>
          </div>

          {/* Hero Card Stack (Inspired by Juno Watts Plan / Design / Develop cards) */}
          <div className="hero-card-stack">

            {/* Card 01 */}
            <div
              className="hero-stack-card"
              onMouseEnter={() => setActiveCardHover(1)}
              onMouseLeave={() => setActiveCardHover(null)}
              style={{
                borderColor: activeCardHover === 1 ? 'var(--base-300)' : 'var(--base-300)',
                transform: activeCardHover === 1 ? 'translateY(-8px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="juno-mono" style={{ background: 'var(--accent-1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  STAGE 01
                </span>
                <span className="juno-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>01</span>
              </div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DOSSIER PARSING</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '0.95rem' }}>
                Ingests GitHub repositories, work history, and candidate spec files into structured context embeddings.
              </p>
            </div>

            {/* Card 02 */}
            <div
              className="hero-stack-card"
              onMouseEnter={() => setActiveCardHover(2)}
              onMouseLeave={() => setActiveCardHover(null)}
              style={{
                transform: activeCardHover === 2 ? 'translateY(-8px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="juno-mono" style={{ background: 'var(--accent-2)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  STAGE 02
                </span>
                <span className="juno-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>02</span>
              </div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>LLM ROUTING</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '0.95rem' }}>
                Dynamically routes dialogue turns across Gemini, Claude 3.5, Groq, and DeepSeek for optimal speed and depth.
              </p>
            </div>

            {/* Card 03 */}
            <div
              className="hero-stack-card"
              onMouseEnter={() => setActiveCardHover(3)}
              onMouseLeave={() => setActiveCardHover(null)}
              style={{
                transform: activeCardHover === 3 ? 'translateY(-8px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="juno-mono" style={{ background: 'var(--accent-3)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  STAGE 03
                </span>
                <span className="juno-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>03</span>
              </div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>RADAR ALCHEMY</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '0.95rem' }}>
                Generates multi-dimensional radar breakdown graphs and hiring feedback metrics upon interview completion.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 2. FEATURE LEVEL-UP GRID SECTION */}
      <section style={{ padding: '5rem 0', borderBottom: '2px solid var(--base-300)', background: 'var(--base-200)' }}>
        <div className="juno-container">

          <div style={{ marginBottom: '3.5rem' }}>
            <p className="juno-mono" style={{ color: 'var(--base-muted)', marginBottom: '0.5rem' }}>
              <span>▶</span> SYSTEM CAPABILITIES // SKILLSET
            </p>
            <h2 className="juno-display-title" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--base-300)' }}>
              STUFF WE’VE LEVELED UP SO YOU DON’T HAVE TO
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Feature 1 */}
            <div className="juno-card">
              <div className="juno-tag" style={{ background: 'var(--accent-1)', marginBottom: '1rem' }}>
                <Cpu size={14} /> MOVE 01 // ROUTER
              </div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>MULTI-LLM AUTO ROUTER</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                Zero lock-in. Toggle seamlessly between Google Gemini, Anthropic Claude, Groq Llama 70B, and DeepSeek with automatic failover and latency benchmarks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="juno-card">
              <div className="juno-tag" style={{ background: 'var(--accent-2)', marginBottom: '1rem' }}>
                <Layers size={14} /> MOVE 02 // DOSSIER
              </div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>CANDIDATE DOSSIERS</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                Inspect candidate backgrounds, target roles, experience levels, and specific day-by-day technical specs directly within the interview canvas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="juno-card">
              <div className="juno-tag" style={{ background: 'var(--accent-3)', marginBottom: '1rem' }}>
                <Sparkles size={14} /> MOVE 03 // RADAR
              </div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>QUANTITATIVE RADAR</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                Real-time multi-dimensional scoring across Code Quality, System Architecture, Problem Solving, and Technical Communication with visual SVG Radar charts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="juno-card">
              <div className="juno-tag" style={{ background: 'var(--base-300)', color: 'var(--base-100)', marginBottom: '1rem' }}>
                <Terminal size={14} /> MOVE 04 // INSPECTOR
              </div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>REST API DEBUGGER</h3>
              <p style={{ color: 'var(--base-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                Full developer transparency. Inspect raw HTTP payload JSONs, system prompts, token usage, latency metrics, and API headers in an integrated debug drawer.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. CANDIDATE SELECTION SHOWCASE */}
      <section style={{ padding: '5rem 0' }}>
        <div className="juno-container">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div>
              <p className="juno-mono" style={{ color: 'var(--base-muted)', marginBottom: '0.5rem' }}>
                <span>▶</span> READY FOR EVALUATION // ROSTER
              </p>
              <h2 className="juno-display-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: 'var(--base-300)' }}>
                SELECT A CANDIDATE DOSSIER
              </h2>
            </div>

            <button
              onClick={() => onStartConsole()}
              className="juno-btn-primary"
              style={{ fontSize: '1rem' }}
            >
              LAUNCH INTERVIEW CONSOLE <ArrowRight size={18} />
            </button>
          </div>

          {/* Candidate Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {candidates.map((c: any, index: number) => {
              const accentColors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-green)'];
              const passedMissions = c.missions?.filter((m: any) => m.passed) || [];
              const skippedMissions = c.missions?.filter((m: any) => m.skipped) || [];
              const firstTryRate = c.signals?.missionsFirstTry && c.signals?.missionsCompleted
                ? Math.round((c.signals.missionsFirstTry / c.signals.missionsCompleted) * 100)
                : 0;

              return (
                <div key={c.member.name} className="juno-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="juno-tag" style={{ background: accentColors[index % accentColors.length] }}>
                        {c.member.jobRole}
                      </span>
                      <span className="juno-mono" style={{ color: 'var(--base-muted)' }}>{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{c.member.name}</h3>
                    <p className="juno-mono" style={{ color: 'var(--base-secondary-dark)', marginBottom: '1rem' }}>
                      {c.member.yearsExperience} Years Experience // {c.member.education}
                    </p>

                    <p style={{ color: 'var(--base-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                      Completed {passedMissions.length} missions across the AI Cohort with a {firstTryRate}% first-try pass rate.
                      {skippedMissions.length > 0 && ` Skipped ${skippedMissions.length} topic${skippedMissions.length > 1 ? 's' : ''}.`}
                      {' '}Committed for {c.signals?.commitDays || 0} out of 31 days.
                    </p>

                    {/* Mission Topic Pills — show top completed missions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {passedMissions.slice(0, 5).map((m: any) => (
                        <span key={m.day} style={{ background: 'var(--base-200)', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                          Day {m.day}
                        </span>
                      ))}
                      {passedMissions.length > 5 && (
                        <span style={{ background: 'var(--base-200)', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'DM Mono', color: 'var(--base-muted)' }}>
                          +{passedMissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartConsole(c.member.name)}
                    className="juno-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    START INTERVIEW WITH {c.member.name.split(' ')[0].toUpperCase()}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
