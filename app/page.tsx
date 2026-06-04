"use client";

import React, { useEffect } from 'react';
import Image from "next/image";
import { FaBullhorn, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { MdReportGmailerrorred } from "react-icons/md";
import { LuHandHelping } from "react-icons/lu";

export default function Home() {
  const recentIssues = [
    { id: 1, title: "Pothole filled at Beach Road", status: "resolved", ward: "Ward 12" },
    { id: 2, title: "Streetlight out near Mananchira", status: "pending", ward: "Ward 4" },
    { id: 3, title: "Waste collection missed", status: "pending", ward: "Ward 18" },
    { id: 4, title: "Water pipe leak repaired", status: "resolved", ward: "Ward 9" },
    { id: 5, title: "Broken pavement", status: "pending", ward: "Ward 2" },
  ];

  useEffect(() => {
    // ── Scroll progress ────────────────────────────────────
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0;
      const bar = document.getElementById('home-progress');
      if (bar) bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll);

    // ── IntersectionObserver for stagger reveal ────────────
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.setAttribute('data-revealed', 'true'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.home-card').forEach(el => observer.observe(el));

    // ── Magnetic hover ─────────────────────────────────────
    

    // ── Animated counter for stats ─────────────────────────
    const animateCounter = (el: Element, target: number, suffix = '') => {
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(interval);
      }, 16);
    };
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, suffix);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-target]').forEach(el => statsObserver.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div id="home-progress" className="scroll-progress-bar" />

      <div style={{ padding: 'var(--space-md) var(--space-lg)', overflowX: 'hidden', scrollBehavior: 'smooth' }}>

        {/* ── MASTER BENTO GRID ───────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>

          {/* ── HERO CARD ── col-span 3, row-span 2 */}
          <div className="home-card awwwards-bento-card " data-delay="0" style={{
            gridColumn: 'span 3',
            gridRow: 'span 2',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '480px',
            padding: 0,
          }}>
            {/* Hero image with parallax zoom */}
            <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.6s ease', willChange: 'transform' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Image src="/beach1.webp" alt="Kozhikode Beach" fill style={{ objectFit: 'cover', objectPosition: 'center' }} quality={70} />
            </div>
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
            {/* Noise overlay */}
            <div className="noise-overlay" />

            {/* Content */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: 'var(--space-xl)',
              color: '#fff',
            }}>
              <span className="chip animate-float" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                Nammude Kozhikode
              </span>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 'var(--space-md)', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                Build a Smarter<br />Kozhikode, Together
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, marginBottom: 'var(--space-lg)', maxWidth: '540px' }}>
                Report issues, track resolutions, and empower your neighborhood through collective action.
              </p>
              <button className="btn btn-glow btn-shimmer" style={{ alignSelf: 'flex-start', display: 'inline-flex', gap: 'var(--space-xs)', fontSize: '1rem' }}>
                <MdReportGmailerrorred style={{ fontSize: '22px' }} />
                Report an Issue Now
              </button>
            </div>
          </div>

          {/* ── LIVE STAT: Resolved ── col-span 1 */}
          <div className="home-card awwwards-bento-card" data-delay="100" style={{
            gridColumn: 'span 1',
            background: 'var(--color-secondary)',
            color: 'var(--color-on-secondary)',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 'var(--space-xs)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="noise-overlay" />
            <FaCheckCircle style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-sm)' }} />
            <p
              data-target="142"
              data-suffix="+"
              style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}
            >0</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Issues Resolved</p>
          </div>

          {/* ── LIVE STAT: Pending ── col-span 1 */}
          <div className="home-card awwwards-bento-card" data-delay="150" style={{
            gridColumn: 'span 1',
            background: 'var(--color-primary)',
            color: '#fff',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 'var(--space-xs)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="noise-overlay" />
            <FaExclamationTriangle style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-sm)' }} />
            <p
              data-target="42"
              data-suffix=""
              style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}
            >0</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Open Issues</p>
          </div>

          {/* ── LIVE MARQUEE FEED ── col-span 4 */}
          <div className="home-card awwwards-bento-card" data-delay="200" style={{
            gridColumn: 'span 4',
            padding: 0,
            overflow: 'hidden',
          }}>
            <div style={{ padding: 'var(--space-sm) var(--space-lg)', borderBottom: '1px solid rgba(199,196,216,0.4)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', backgroundColor: 'var(--color-surface-container-low)' }}>
              <span className="animate-float" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'inline-block' }} />
              <span className="label-sm" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live City Feed</span>
            </div>
            <div className="marquee-container" style={{ margin: 0, borderRadius: 0, background: 'transparent' }}>
              <div className="marquee-content">
                {[...recentIssues, ...recentIssues].map((issue, index) => (
                  <div key={`${issue.id}-${index}`} className="feed-card">
                    {issue.status === 'resolved' ? (
                      <FaCheckCircle color="var(--color-secondary)" size={20} />
                    ) : (
                      <FaExclamationTriangle color="var(--color-tertiary)" size={20} />
                    )}
                    <div>
                      <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{issue.ward}</p>
                      <p className="body-sm" style={{ fontWeight: 600 }}>{issue.title}</p>
                    </div>
                    <span className={`chip chip-${issue.status} animate-float`} style={{ marginLeft: 'auto', fontSize: '10px' }}>
                      {issue.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── QUICK REPORT CARD ── col-span 2 */}
          <div className="home-card awwwards-bento-card " data-delay="250" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            borderTop: '4px solid var(--color-primary)',
            display: 'flex', flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-primary-fixed)', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
                <FaBullhorn style={{ fontSize: '24px', color: 'var(--color-primary)' }} />
              </div>
              <h2 className="headline-md">Have a concern in your ward?</h2>
            </div>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, maxWidth: '520px' }}>
              Your voice matters. Report infrastructure issues directly to the Corporation in under 60 seconds.
            </p>
            <button className="btn btn-primary btn-shimmer" style={{ alignSelf: 'flex-start', display: 'inline-flex', gap: 'var(--space-xs)', minWidth: '200px' }}>
              <MdReportGmailerrorred style={{ fontSize: '22px' }} />
              Submit Report
            </button>
          </div>

          {/* ── QUOTE CARD ── col-span 2 */}
          <div className="home-card awwwards-bento-card glass-lite" data-delay="300" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', gap: 'var(--space-md)',
            background: `linear-gradient(145deg, var(--color-primary-container), var(--color-surface-container-low))`,
          }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              The Soul of Kozhikode
            </h2>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', fontStyle: 'italic', lineHeight: 1.8 }}>
              "A city isn't just roads and buildings. It is the aroma of steaming biriyani on a Sunday afternoon, the gentle salty breeze at Kozhikode Beach, and the centuries of history whispering through the alleys of SM Street. It is the place we call home."
            </p>
          </div>

          {/* ── OUR HERITAGE ── col-span 2 */}
          <div className="home-card awwwards-bento-card " data-delay="350" style={{
            gridColumn: 'span 2',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <div style={{ position: 'relative', height: '220px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Image
                src="/beypore-beach.webp"
                alt="Our Heritage"
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease', willChange: 'transform' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
            <h3 className="headline-md">Our Heritage</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.8 }}>
              For centuries, the Zamorins welcomed the world to our shores. That spirit of warmth and hospitality still runs in our blood. But true hospitality begins with a city that takes pride in its own streets.
            </p>
          </div>

          {/* ── OUR CULTURE ── col-span 1 */}
          <div className="home-card awwwards-bento-card " data-delay="400" style={{
            gridColumn: 'span 1',
            padding: 'var(--space-xl)',
            backgroundColor: 'var(--color-primary-fixed)',
            display: 'flex', flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <div style={{ position: 'relative', height: '160px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Image
                src="/chicken-biriyani.webp"
                alt="Our Culture"
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease', willChange: 'transform' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
            <h3 className="headline-md">Our Culture</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface)', lineHeight: 1.8 }}>
              From the sweet halwa stalls to the majestic Mananchira Square, our culture is woven into the very fabric of our neighborhoods. When those areas fall into disrepair, a piece of our story is paused.
            </p>
          </div>

          {/* ── OUR FUTURE ── col-span 1 */}
          <div className="home-card awwwards-bento-card " data-delay="450" style={{
            gridColumn: 'span 1',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column',
            gap: 'var(--space-md)',
          }}>
            <div style={{ position: 'relative', height: '160px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Image
                src="/shopping.webp"
                alt="Our Future"
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease', willChange: 'transform' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
            <h3 className="headline-md">Our Future</h3>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.8 }}>
              We inherit this city from our grandparents, but we borrow it from our children. A reported pothole today is a safer journey tomorrow. Your vigilance is the highest form of love for Kozhikode.
            </p>
          </div>

          {/* ── CTA CARD ── col-span 4 */}
          <div className="home-card awwwards-bento-card cta-gradient " data-delay="500" style={{
            gridColumn: 'span 4',
            padding: 'var(--space-xl)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            gap: 'var(--space-md)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="noise-overlay" />
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)' }}>
              <LuHandHelping style={{ fontSize: '32px', color: 'var(--color-on-primary-container)' }} />
            </div>
            <h2 className="headline-lg" style={{ marginBottom: '0' }}>Preserving our Pride</h2>
            <p className="body-lg" style={{ maxWidth: '640px', opacity: 0.9, lineHeight: 1.7 }}>
              Help us maintain the beauty of our historic city. Report issues like broken pavements or faulty streetlights to keep Our Kozhikode clean, safe, and welcoming.
            </p>
            <button className="btn btn-shimmer" style={{
              display: 'inline-flex', gap: 'var(--space-xs)',
              backgroundColor: 'var(--color-surface-container-lowest)',
              color: 'var(--color-primary-container)',
              border: 'none',
            }}>
              <MdReportGmailerrorred style={{ fontSize: '24px' }} />
              Make an Impact
            </button>
          </div>

        </div>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .home-card {
              opacity: 0;
              transform: translateY(32px);
              transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
            }
            .home-card[data-revealed="true"] {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 1024px) {
            .home-card[style*="span 3"],
            .home-card[style*="span 4"] { grid-column: 1 / -1 !important; }
            .home-card[style*="span 2"] { grid-column: span 2 !important; }
            .home-card[style*="span 1"] { grid-column: span 1 !important; }
          }
          @media (max-width: 768px) {
            .home-card { grid-column: 1 / -1 !important; grid-row: auto !important; }
          }
        `}</style>
      </div>
    </>
  );
}
