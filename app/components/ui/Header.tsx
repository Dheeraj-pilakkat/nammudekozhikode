"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Magnetic hover calculations for Logo
    const el = logoRef.current;
    if (!el) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return; // Disable on touch devices to avoid tap issues

    const handleMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <header 
      className="header-container header-glass"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div 
          ref={logoRef}
          className="logo-container magnetic-card"
          style={{ transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
        >
          <Image 
            src="/logo.png" 
            alt="logo" 
            width={50} 
            height={50} 
            style={{ 
              borderRadius: '50%', 
              boxShadow: '0 4px 12px rgba(53, 37, 205, 0.2)',
              border: '1px solid rgba(53, 37, 205, 0.1)'
            }} 
          />
          <h1 
            className="headline-md" 
            style={{ 
              color: 'var(--color-primary)', 
              fontWeight: 900,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.2rem, 2vw, 1.6rem)'
            }}
          >
            Nammude Kozhikode
          </h1>
        </div>
      </Link>
      
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMenuOpen(true)}
        aria-label="Open Navigation"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          background: 'rgba(53, 37, 205, 0.08)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          transition: 'all 0.2s ease'
        }}
      >
        <FaBars size={20} />
      </button>

      {/* Desktop Menu */}
      <nav className="nav-menu">
        <Link href="/features" style={{ textDecoration: 'none' }}>
          <button className="nav-link sliding-underline" style={{ padding: '8px 12px' }}>Features</button>
        </Link>
        <Link href="/officials" style={{ textDecoration: 'none' }}>
          <button className="nav-link sliding-underline" style={{ padding: '8px 12px' }}>Officials</button>
        </Link>
        <Link href="/how-it-works" style={{ textDecoration: 'none' }}>
          <button className="nav-link sliding-underline" style={{ padding: '8px 12px' }}>How it works</button>
        </Link>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button 
            className="btn btn-primary btn-glow btn-shimmer" 
            style={{ 
              borderRadius: 'var(--radius-full)', 
              padding: '0 24px',
              minHeight: '44px',
              boxShadow: '0 4px 15px rgba(53, 37, 205, 0.3)'
            }}
          >
            <FaExclamationTriangle size={14} style={{ marginRight: '8px' }} />
            Report issue
          </button>
        </Link>
      </nav>

      {/* Full-Screen Mobile Drawer Overlay */}
      <div className={`mobile-nav-overlay ${menuOpen ? 'open' : ''}`}>
        <button 
          className="mobile-nav-close" 
          onClick={() => setMenuOpen(false)}
          aria-label="Close Navigation"
          style={{
            background: 'rgba(53, 37, 205, 0.08)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <FaTimes size={24} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%', padding: '0 24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
            <div className="logo-container" style={{ flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <Image src="/logo.png" alt="logo" width={70} height={70} style={{ borderRadius: '50%', boxShadow: '0 4px 15px rgba(53, 37, 205, 0.2)' }} />
              <h1 className="headline-md" style={{ color: 'var(--color-primary)', fontWeight: 900, textAlign: 'center' }}>Nammude Kozhikode</h1>
            </div>
          </Link>

          <Link href="/features" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            <button className="nav-link sliding-underline" style={{ fontSize: '1.5rem', fontWeight: 700, padding: '12px' }}>Features</button>
          </Link>
          
          <Link href="/officials" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            <button className="nav-link sliding-underline" style={{ fontSize: '1.5rem', fontWeight: 700, padding: '12px' }}>Officials</button>
          </Link>
          
          <Link href="/how-it-works" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            <button className="nav-link sliding-underline" style={{ fontSize: '1.5rem', fontWeight: 700, padding: '12px' }}>How it works</button>
          </Link>

          <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%', maxWidth: '280px', marginTop: '20px' }} onClick={() => setMenuOpen(false)}>
            <button 
              className="btn btn-primary btn-glow btn-shimmer" 
              style={{ 
                borderRadius: 'var(--radius-full)', 
                width: '100%',
                padding: '16px 24px',
                fontSize: '1.1rem',
                minHeight: '52px',
                boxShadow: '0 4px 20px rgba(53, 37, 205, 0.4)',
                display: 'flex',
                gap: '8px'
              }}
            >
              <FaExclamationTriangle size={16} />
              Report issue
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
