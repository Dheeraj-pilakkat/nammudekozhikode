"use client";

import React, { useEffect } from 'react';
import { FaSearchLocation, FaCamera, FaHardHat, FaCheckCircle } from 'react-icons/fa';

const STEPS = [
  {
    id: 1,
    title: "1. Spot the Issue",
    description: "Notice a civic issue in your ward? Whether it's a broken streetlight, an unfixed pothole, or uncollected waste, your vigilance is the first step to a better Kozhikode.",
    icon: FaSearchLocation,
    iconColor: 'var(--color-primary)',
    bgColor: 'var(--color-primary-fixed)',
    accent: 'var(--color-primary)',
    span: 'span 2',
  },
  {
    id: 2,
    title: "2. Submit a Report",
    description: "Use our simple mobile-friendly form to snap a picture, tag the location, and submit the details. The report is instantly logged into the city's central database.",
    icon: FaCamera,
    iconColor: 'var(--color-secondary)',
    bgColor: 'var(--color-secondary-container)',
    accent: 'var(--color-secondary)',
    span: 'span 2',
  },
  {
    id: 3,
    title: "3. Officials Take Action",
    description: "Your ward councillor and municipal engineers receive the report immediately. The issue is assigned to a field team, and the status changes to 'In Progress'.",
    icon: FaHardHat,
    iconColor: 'var(--color-tertiary)',
    bgColor: 'var(--color-tertiary-container)',
    accent: 'var(--color-tertiary)',
    span: 'span 2',
  },
  {
    id: 4,
    title: "4. Issue Resolved",
    description: "Once the work is completed, the official uploads a proof of resolution. You receive a notification, and the city dashboard reflects the successful fix.",
    icon: FaCheckCircle,
    iconColor: 'var(--color-primary)',
    bgColor: 'var(--color-primary-container)',
    accent: 'var(--color-primary)',
    span: 'span 2',
  },
];

export default function HowItWorksPage() {
  useEffect(() => {
    // Scroll progress
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0;
      const bar = document.getElementById('hiw-progress');
      if (bar) bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll);

    // Observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.setAttribute('data-revealed', 'true'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.hiw-card').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="hiw-progress" className="scroll-progress-bar" />
      <div style={{ padding: 'var(--space-md) var(--space-lg)', overflowX: 'hidden', scrollBehavior: 'smooth' }}>

        {/* ── HERO HEADER ─── */}
        <div className="hiw-card awwwards-bento-card" style={{
          maxWidth: '1400px',
          margin: '0 auto var(--space-lg)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="noise-overlay" />
          <span className="chip animate-float" style={{ display: 'inline-block', marginBottom: 'var(--space-md)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            Step by Step
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 'var(--space-md)' }}>
            How it Works
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: 'rgba(255,255,255,0.85)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            Nammude Kozhikode bridges the gap between citizens and the corporation. Your single report leads to real, tangible changes in your neighborhood.
          </p>
        </div>

        {/* ── BENTO GRID ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isHero = i === 0; // First step gets hero treatment
            return (
              <div
                key={step.id}
                className="hiw-card awwwards-bento-card "
                data-delay={`${i * 100}`}
                style={{
                  gridColumn: isHero ? 'span 4' : 'span 2',
                  padding: 'var(--space-xl)',
                  display: 'flex',
                  flexDirection: isHero ? 'row' : 'column',
                  gap: 'var(--space-lg)',
                  alignItems: isHero ? 'center' : 'flex-start',
                  background: i % 2 === 0
                    ? `linear-gradient(145deg, ${step.bgColor}, var(--color-surface-container-low))`
                    : 'var(--color-surface)',
                  minHeight: isHero ? '220px' : '260px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Step number badge */}
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-md)',
                  right: 'var(--space-md)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step.accent,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  {step.id}
                </div>

                {/* Icon */}
                <div style={{
                  width: isHero ? '160px' : '100px',
                  height: isHero ? '160px' : '100px',
                  minWidth: isHero ? '160px' : '100px',
                  borderRadius: isHero ? '50%' : 'var(--radius-xl)',
                  backgroundColor: step.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-layer-2)',
                  border: '6px solid var(--color-surface-container-lowest)',
                }}>
                  <Icon style={{ fontSize: isHero ? '64px' : '40px', color: step.iconColor }} />
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: isHero ? 'clamp(1.75rem, 3vw, 2.5rem)' : '1.35rem',
                    fontWeight: 800,
                    color: step.accent,
                    marginBottom: 'var(--space-sm)',
                    lineHeight: 1.2,
                  }}>
                    {step.title}
                  </h2>
                  <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.8 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* CONNECTOR CARD – decorative stats strip */}
          <div className="hiw-card awwwards-bento-card glass-lite" data-delay="450" style={{
            gridColumn: 'span 4',
            padding: 'var(--space-xl)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-lg)',
            textAlign: 'center',
          }}>
            {[
              { value: '<60s', label: 'To Submit a Report' },
              { value: '24h', label: 'Average First Response' },
              { value: '85%', label: 'Issues Resolved On Time' },
            ].map((stat, i) => (
              <div key={i}>
                <p style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{stat.value}</p>
                <p className="label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* FOOTER CTA */}
          <div className="hiw-card awwwards-bento-card" data-delay="500" style={{
            gridColumn: 'span 4',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)',
            background: 'var(--color-primary)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="noise-overlay" />
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff' }}>Ready to make Kozhikode better?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '480px', lineHeight: 1.7 }}>
              Join thousands of active citizens. Your first report could change your street forever.
            </p>
            <button className="btn btn-shimmer" style={{
              fontSize: '1.1rem',
              padding: 'var(--space-md) var(--space-xl)',
              background: '#fff',
              color: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              Report Your First Issue Now
            </button>
          </div>

        </div>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .hiw-card {
              opacity: 0;
              transform: translateY(28px);
              transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
            }
            .hiw-card[data-revealed="true"] { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1024px) {
            .hiw-card[style*="span 4"] { grid-column: 1 / -1 !important; }
            .hiw-card[style*="span 2"] { grid-column: span 2 !important; }
          }
          @media (max-width: 768px) {
            .hiw-card { grid-column: 1 / -1 !important; grid-row: auto !important; }
          }
        `}</style>
      </div>
    </>
  );
}
