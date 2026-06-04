"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FaChartPie, FaNetworkWired, FaHandshake, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function OfficialsLandingPage() {
  useEffect(() => {
    // --- Scroll Progress ---
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0;
      const bar = document.getElementById('off-progress');
      if (bar) bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll);

    // --- Intersection Observer (stagger) ---
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.setAttribute('data-revealed', 'true');
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.off-card').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="off-progress" className="scroll-progress-bar" />
      <div style={{ padding: 'var(--space-md) var(--space-lg)', overflowX: 'hidden', scrollBehavior: 'smooth' }}>

        {/* ── BENTO GRID ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>

          {/* HERO CARD – col-span 3 */}
          <div className="off-card awwwards-bento-card " data-delay="0" style={{
            gridColumn: 'span 3',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
            color: 'var(--color-on-primary)',
            padding: 'var(--space-xl)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            {/* Noise overlay */}
            <div className="noise-overlay" />
            <span className="chip chip-resolved animate-float" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              For Municipal Officials
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 'var(--space-md)', color: '#fff' }}>
              Empower Your Ward with Real-Time Civic Intelligence
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: '680px' }}>
              Transform how Kozhikode Corporation manages infrastructure. Gain actionable insights, auto-route reports to field engineers, and track resolution metrics from a single, centralized dashboard.
            </p>
          </div>

          {/* CTA CARD – col-span 1 */}
          <div className="off-card awwwards-bento-card glass-lite" data-delay="100" style={{
            gridColumn: 'span 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            textAlign: 'center',
            padding: 'var(--space-xl)',
            minHeight: '300px',
          }}>
            <FaArrowRight style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }} className="animate-float" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>Ready to lead smarter?</h2>
            <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%' }}>
              <button className="btn btn-primary btn-shimmer" style={{ width: '100%', minHeight: '48px' }}>
                Login to Official Portal
              </button>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%' }}>
              <button className="btn btn-outline btn-shimmer" style={{ width: '100%', minHeight: '48px' }}>
                View Demo Dashboard
              </button>
            </Link>
          </div>

          {/* DATA-DRIVEN CARD – col-span 1 row-span 1 */}
          <div className="off-card awwwards-bento-card " data-delay="150" style={{
            gridColumn: 'span 1',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-primary-fixed)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', marginBottom: 'var(--space-xs)' }}>
              <FaChartPie style={{ fontSize: '28px', color: 'var(--color-primary)' }} />
            </div>
            <h3 className="headline-md">Data-Driven Decisions</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.7' }}>
              Stop guessing where resources are needed. View live heatmaps of reported issues across your ward to prioritize budgets effectively and deploy teams exactly where it matters most.
            </p>
          </div>

          {/* STREAMLINED CARD – col-span 2 */}
          <div className="off-card awwwards-bento-card " data-delay="200" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            background: 'linear-gradient(135deg, var(--color-secondary-container) 0%, var(--color-surface-container-low) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-secondary-container)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', marginBottom: 'var(--space-xs)' }}>
              <FaNetworkWired style={{ fontSize: '28px', color: 'var(--color-on-secondary-container)' }} />
            </div>
            <h3 className="headline-md">Streamlined Workflow</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.7' }}>
              No more manual sorting of complaints. Our AI automatically routes issues to the correct department (electricity, water, roads) so your engineers can start working immediately.
            </p>
          </div>

          {/* TRANSPARENT IMPACT CARD – col-span 1 */}
          <div className="off-card awwwards-bento-card " data-delay="250" style={{
            gridColumn: 'span 1',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-tertiary-container)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', marginBottom: 'var(--space-xs)' }}>
              <FaHandshake style={{ fontSize: '28px', color: 'var(--color-on-tertiary-container)' }} />
            </div>
            <h3 className="headline-md">Transparent Impact</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.7' }}>
              Build trust with your citizens. Generate automated monthly reports on resolution times and showcase your ward's progress directly on the public facing portal.
            </p>
          </div>

          {/* DASHBOARD PREVIEW – col-span 4 */}
          <div className="off-card awwwards-bento-card" data-delay="300" style={{
            gridColumn: 'span 4',
            padding: 0,
            overflow: 'hidden',
          }}>
            <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid rgba(199,196,216,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-container-low)' }}>
              <div>
                <h2 className="headline-md" style={{ marginBottom: '4px' }}>Everything at your fingertips</h2>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Preview of the Administrative Dashboard</p>
              </div>
              <div className="chip animate-float" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>Logged in as Councillor</div>
            </div>

            <div style={{ padding: 'var(--space-lg)' }}>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                {[
                  { label: 'Total Reported (This Month)', value: '248', color: 'var(--color-on-surface)' },
                  { label: 'Resolution Rate', value: '85.4%', color: 'var(--color-secondary)' },
                  { label: 'Avg Time to Resolve', value: '2.4 Days', color: 'var(--color-tertiary)' },
                ].map((stat, i) => (
                  <div key={i} className="awwwards-bento-card " style={{ padding: 'var(--space-md)', background: 'var(--color-surface-container-lowest)' }}>
                    <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-xs)' }}>{stat.label}</p>
                    <p style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(199,196,216,0.4)', overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--color-surface-container-low)', borderBottom: '1px solid rgba(199,196,216,0.4)' }}>
                  <h4 className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Recent Activity</h4>
                </div>
                {[
                  { icon: <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />, text: 'Pothole fixed at Beach Road', time: '10 mins ago' },
                  { icon: <FaExclamationCircle style={{ color: 'var(--color-tertiary)' }} />, text: 'New report: Broken Streetlight', time: '42 mins ago' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i === 0 ? '1px solid rgba(199,196,216,0.3)' : 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-container-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      {item.icon}
                      <span className="body-sm" style={{ color: 'var(--color-on-surface)' }}>{item.text}</span>
                    </div>
                    <span className="label-sm" style={{ color: 'var(--color-outline)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .off-card {
              opacity: 0;
              transform: translateY(28px);
              transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
            }
            .off-card[data-revealed="true"] {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 1024px) {
            .off-card { grid-column: span 2 !important; }
          }
          @media (max-width: 768px) {
            .off-card { grid-column: 1 / -1 !important; }
          }
        `}</style>
      </div>
    </>
  );
}
