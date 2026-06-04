"use client";

import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // 1. Staggered Entrance Reveal Animation
    const cards = footer.querySelectorAll('.footer-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    cards.forEach(card => observer.observe(card));

    // 2. Magnetic Card Hover Effect (Desktop Only)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) {
      observer.disconnect();
      // Re-observe since we just disconnected
      cards.forEach(card => observer.observe(card));
      return; 
    }

    const cleanups: (() => void)[] = [];
    const magneticCards = footer.querySelectorAll('.magnetic-footer-card');

    magneticCards.forEach(card => {
      const el = card as HTMLElement;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6; // 6 degrees tilt
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => {
        el.style.transform = '';
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      observer.disconnect();
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-xl) var(--space-md) var(--space-md)',
        borderTop: '1px solid var(--color-outline-variant)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Bento Grid */}
      <div className="footer-bento-grid">
        
        {/* Card 1: Brand Bento Card */}
        <div 
          className="footer-card stagger-fade-up awwwards-bento-card magnetic-footer-card footer-col-2 footer-row-2"
          style={{ 
            transitionDelay: '0ms',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
            background: 'linear-gradient(135deg, var(--color-surface-container-lowest) 0%, rgba(243, 244, 245, 0.7) 100%)',
            padding: 'clamp(24px, 4vw, 36px)'
          }}
        >
          <div className="noise-overlay" />
          
          <div>
            <div className="logo-container" style={{ marginBottom: 'var(--space-sm)' }}>
              <Image 
                src="/logo.png" 
                alt="logo" 
                width={55} 
                height={55} 
                style={{ 
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(53, 37, 205, 0.15)',
                  border: '1px solid rgba(53, 37, 205, 0.08)'
                }} 
              />
              <h1 className="headline-md" style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                Nammude Kozhikode
              </h1>
            </div>
            <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, maxWidth: '480px' }}>
              Empowering citizens to report issues, track resolutions, and build a smarter city together. Join the collective effort in shaping our city's future.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <span className="label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)' }}>Connect With Us</span>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <a 
                href="#" 
                aria-label="Facebook" 
                className="btn-shimmer"
                style={{ 
                  color: '#fff', 
                  backgroundColor: 'var(--color-primary)', 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="#" 
                aria-label="Twitter" 
                className="btn-shimmer"
                style={{ 
                  color: '#fff', 
                  backgroundColor: 'var(--color-primary)', 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="btn-shimmer"
                style={{ 
                  color: '#fff', 
                  backgroundColor: 'var(--color-primary)', 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Quick Links */}
        <div 
          className="footer-card stagger-fade-up awwwards-bento-card magnetic-footer-card footer-col-1 footer-row-2"
          style={{ 
            transitionDelay: '100ms',
            background: 'var(--color-surface-container-lowest)',
            padding: 'clamp(24px, 4vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}
        >
          <h2 className="headline-sm" style={{ borderBottom: '2px solid rgba(53, 37, 205, 0.1)', paddingBottom: 'var(--space-xs)', color: 'var(--color-primary)', fontWeight: 800 }}>
            Quick Links
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Link href="/features" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Features
            </Link>
            <Link href="/officials" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Officials Directory
            </Link>
            <Link href="/how-it-works" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              How it Works
            </Link>
            <Link href="/dashboard" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Report an Issue
            </Link>
          </div>
        </div>

        {/* Card 3: Legal & Support */}
        <div 
          className="footer-card stagger-fade-up awwwards-bento-card magnetic-footer-card footer-col-1 footer-row-2"
          style={{ 
            transitionDelay: '200ms',
            background: 'var(--color-surface-container-lowest)',
            padding: 'clamp(24px, 4vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}
        >
          <h2 className="headline-sm" style={{ borderBottom: '2px solid rgba(53, 37, 205, 0.1)', paddingBottom: 'var(--space-xs)', color: 'var(--color-primary)', fontWeight: 800 }}>
            Support & Legal
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Link href="#" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link href="#" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Terms of Service
            </Link>
            <Link href="#" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Help Center
            </Link>
            <Link href="#" className="body-md sliding-underline" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Card 4: Action / CTA Bento Card */}
        <div 
          className="footer-card stagger-fade-up awwwards-bento-card magnetic-footer-card footer-col-2 footer-row-1"
          style={{ 
            transitionDelay: '300ms',
            background: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
            padding: 'clamp(24px, 4vw, 32px)',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-md)'
          }}
        >
          <div className="noise-overlay" />
          <div>
            <span className="chip" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', marginBottom: 'var(--space-xs)' }}>
              Empower Your Ward
            </span>
            <h3 className="headline-sm" style={{ color: '#fff', fontWeight: 800, marginTop: '4px' }}>
              Spot an issue in your neighborhood?
            </h3>
            <p className="body-sm" style={{ color: 'var(--color-on-primary-container)', opacity: 0.9, marginTop: '6px' }}>
              Report potholes, streetlights, waste, and more in less than a minute. Let's make Kozhikode beautiful.
            </p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button 
              className="btn btn-shimmer btn-glow"
              style={{ 
                backgroundColor: '#fff', 
                color: 'var(--color-primary)', 
                borderRadius: 'var(--radius-full)', 
                padding: '0 24px',
                minHeight: '44px',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <FaExclamationTriangle size={14} style={{ marginRight: '8px' }} />
              Report Issue Now
            </button>
          </Link>
        </div>

        {/* Card 5: Creative Stat / Loop Bento Card */}
        <div 
          className="footer-card stagger-fade-up awwwards-bento-card magnetic-footer-card footer-col-2 footer-row-1"
          style={{ 
            transitionDelay: '400ms',
            background: 'linear-gradient(135deg, var(--color-secondary) 0%, #004d33 100%)',
            color: '#fff',
            padding: 'clamp(24px, 4vw, 32px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}
        >
          <div className="noise-overlay" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="label-sm" style={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Civic Engagement
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle size={28} style={{ color: 'var(--color-secondary-container)' }} />
              <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900 }}>98% Resolved</span>
            </div>
            <p className="body-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '280px' }}>
              Active administration responding to citizens across all corporation wards daily.
            </p>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              textAlign: 'center',
              minWidth: '100px'
            }}
          >
            <FaMapMarkerAlt size={24} style={{ color: 'var(--color-secondary-container)', marginBottom: '4px' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>55 Wards</span>
            <span className="label-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Connected</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Love Banner */}
      <div 
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-md)', 
          borderTop: '1px solid var(--color-outline-variant)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
          © {new Date().getFullYear()} Nammude Kozhikode. All rights reserved.
        </p>
        <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
          Made with <span className="animate-pulse-heart">♥</span> for Kozhikode
        </p>
      </div>
    </footer>
  );
}

export default Footer;
