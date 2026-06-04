"use client";

import React, { useEffect } from 'react';
import { FaMapMarkedAlt, FaChartLine, FaUsers, FaCamera } from 'react-icons/fa';
import { MdOutlineSecurityUpdateGood } from 'react-icons/md';

export default function FeaturesPage() {
  useEffect(() => {
    // Scroll progress
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0;
      const bar = document.getElementById('feat-progress');
      if (bar) bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll);

    // Observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.setAttribute('data-revealed', 'true'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.feat-card').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="feat-progress" className="scroll-progress-bar" />
      <div style={{ padding: 'var(--space-md) var(--space-lg)', overflowX: 'hidden', scrollBehavior: 'smooth' }}>

        {/* Page Header */}
        <div className="feat-card" style={{
          maxWidth: '1400px',
          margin: '0 auto var(--space-lg)',
          textAlign: 'center',
          padding: 'var(--space-xl)',
        }}>
          <span className="chip chip-resolved animate-float" style={{ marginBottom: 'var(--space-md)', display: 'inline-block' }}>Platform Features</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 'var(--space-md)' }}>
            Platform Features
          </h1>
          <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            Discover the tools we built to foster a transparent, connected, and smarter Kozhikode. Our White Bento interface provides simple, structured access to civic data.
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

          {/* REAL-TIME REPORTING – hero, col-span 2, row-span 2 */}
          <div className="feat-card awwwards-bento-card " data-delay="0" style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            padding: 'var(--space-xl)',
            background: 'linear-gradient(145deg, var(--color-secondary-container), var(--color-surface-container-low))',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '380px',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-secondary-container)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', marginBottom: 'var(--space-md)' }}>
              <FaCamera style={{ fontSize: '32px', color: 'var(--color-secondary)' }} />
            </div>
            <h2 className="headline-lg" style={{ marginBottom: 'var(--space-md)' }}>Real-Time Reporting</h2>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, marginBottom: 'var(--space-lg)', flex: 1 }}>
              Capture and submit issues on the go. Our mobile-optimized flow allows you to upload photos, provide brief descriptions, and submit directly to the correct ward officials in under 60 seconds.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <span className="chip chip-resolved animate-float">Geo-Tagged</span>
              <span className="chip chip-resolved animate-float" style={{ animationDelay: '0.5s' }}>Photo Attachments</span>
            </div>
          </div>

          {/* WARD MAPPING – col-span 2 */}
          <div className="feat-card awwwards-bento-card " data-delay="100" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-primary-fixed)', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
              <FaMapMarkedAlt style={{ fontSize: '28px', color: 'var(--color-primary)' }} />
            </div>
            <h2 className="headline-md">Interactive Ward Mapping</h2>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>
              Visualize your community. View interactive maps to see reported issues, ongoing works, and resolved cases specific to your local ward or across the entire city of Kozhikode.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <span className="chip chip-pending animate-float" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>Heatmaps</span>
              <span className="chip chip-pending animate-float" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', animationDelay: '0.6s' }}>Ward Filters</span>
            </div>
          </div>

          {/* STATUS UPDATES – col-span 2 */}
          <div className="feat-card awwwards-bento-card " data-delay="150" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            background: 'linear-gradient(145deg, var(--color-surface-container-low), var(--color-surface))',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-surface-variant)', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
              <MdOutlineSecurityUpdateGood style={{ fontSize: '28px', color: 'var(--color-on-surface-variant)' }} />
            </div>
            <h2 className="headline-md">Status Updates</h2>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>
              Receive automated notifications and step-by-step progress tracking from "Reported" to "In Progress" to "Resolved".
            </p>
            {/* Animated progress bar decoration */}
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['Reported', '100%', 'var(--color-tertiary)'], ['In Progress', '65%', 'var(--color-primary)'], ['Resolved', '40%', 'var(--color-secondary)']].map(([label, pct, color]) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="label-sm">{label}</span><span className="label-sm">{pct}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div className="animate-grow" style={{ height: '100%', width: pct, background: color, borderRadius: 'var(--radius-full)', transformOrigin: 'left' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OFFICIAL DASHBOARD – col-span 3 */}
          <div className="feat-card awwwards-bento-card " data-delay="200" style={{
            gridColumn: 'span 3',
            padding: 'var(--space-xl)',
            background: 'linear-gradient(135deg, var(--color-tertiary-container), var(--color-surface-container-low))',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-tertiary-container)', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
              <FaChartLine style={{ fontSize: '28px', color: 'var(--color-tertiary)' }} />
            </div>
            <h2 className="headline-md">Official Transparency Dashboard</h2>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>
              Track the city's progress with data. Our dashboards provide high-level metrics on resolution rates, average response times, and ward performance. Every citizen has access to the same data as the officials, ensuring complete accountability.
            </p>
          </div>

          {/* LIVE STAT CARD – col-span 1 */}
          <div className="feat-card awwwards-bento-card" data-delay="250" style={{
            gridColumn: 'span 1',
            padding: 'var(--space-xl)',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-xs)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="noise-overlay" />
            <p style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>85.4%</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resolution Rate</p>
            <span style={{ display: 'inline-block', marginTop: 'var(--space-sm)', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: '#fff' }}>Live Metric</span>
          </div>

          {/* CTA – col-span 4 */}
          <div className="feat-card awwwards-bento-card glass-lite" data-delay="300" style={{
            gridColumn: 'span 4',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-md)',
            border: '1.5px solid rgba(79, 70, 229, 0.25)',
          }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-primary-fixed)', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
              <FaUsers style={{ fontSize: '28px', color: 'var(--color-primary)' }} />
            </div>
            <h2 className="headline-lg">Ready to make an impact?</h2>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '540px' }}>
              Join thousands of active citizens making Kozhikode better every day.
            </p>
            <button className="btn btn-primary btn-shimmer" style={{ minWidth: '200px', fontSize: '1rem' }}>
              Sign Up Now
            </button>
          </div>

        </div>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .feat-card {
              opacity: 0;
              transform: translateY(28px);
              transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
            }
            .feat-card[data-revealed="true"] { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1024px) {
            .feat-card[style*="span 2"], .feat-card[style*="span 3"] { grid-column: span 2 !important; }
            .feat-card[style*="span 4"] { grid-column: span 2 !important; }
          }
          @media (max-width: 768px) {
            .feat-card { grid-column: 1 / -1 !important; grid-row: auto !important; }
          }
        `}</style>
      </div>
    </>
  );
}
