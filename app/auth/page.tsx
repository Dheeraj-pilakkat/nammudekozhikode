"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaUser, FaUserShield, FaArrowRight, FaSignInAlt, FaCheckCircle } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'citizen' | 'official'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect if already logged in
    const user = localStorage.getItem('nammude_user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleQuickLogin = (role: 'citizen' | 'official') => {
    const mockUser = {
      role,
      name: role === 'citizen' ? 'Devi Prasad' : 'Ramesh Kumar (Ward 12 Admin)',
      email: role === 'citizen' ? 'citizen@kozhikode.in' : 'official@kozhikode.gov.in',
      ward: role === 'citizen' ? 'Ward 12' : 'Ward 12 Corporation Office'
    };
    localStorage.setItem('nammude_user', JSON.stringify(mockUser));
    
    // Dispatch storage event to notify other components (like Header)
    window.dispatchEvent(new Event('storage'));
    
    setSuccess(`Logged in successfully as ${mockUser.name}!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    // Simple simulated authentication
    const roleName = activeTab === 'citizen' ? 'Citizen' : 'Official';
    const mockUser = {
      role: activeTab,
      name: name || (activeTab === 'citizen' ? 'Kozhikode Citizen' : 'Corporation Official'),
      email,
      ward: activeTab === 'citizen' ? 'Ward 12' : 'Corporation Head Office'
    };

    localStorage.setItem('nammude_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));

    setSuccess(isRegister ? 'Registered successfully!' : 'Signed in successfully!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div 
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-md)',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
          width: '100%'
        }}
      >
        
        {/* Left Card: Welcome branding bento block (Col span 5) */}
        <div 
          className="awwwards-bento-card col-span-5"
          style={{
            gridColumn: 'span 5',
            background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-primary) 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(24px, 4vw, 40px)',
            minHeight: '450px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="noise-overlay" />
          
          <div>
            <div className="logo-container" style={{ marginBottom: 'var(--space-md)' }}>
              <Image 
                src="/logo.png" 
                alt="logo" 
                width={60} 
                height={60} 
                style={{ 
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }} 
              />
              <h1 className="headline-md" style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem' }}>
                Nammude Kozhikode
              </h1>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginTop: 'var(--space-md)' }}>
              Shape Our City's Future
            </h2>
            <p className="body-md" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginTop: 'var(--space-sm)' }}>
              Login to report local issues, track municipality resolutions, or manage ward resources. Choose your profile to begin.
            </p>
          </div>

          <div style={{ zIndex: 10, background: 'rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <p className="label-sm" style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>Active Civic Infrastructure</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-secondary-container)' }}>55 Wards</span>
              </div>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-secondary-container)' }}>100% Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Login form (Col span 7) */}
        <div 
          className="awwwards-bento-card col-span-7"
          style={{
            gridColumn: 'span 7',
            background: 'var(--color-surface-container-lowest)',
            padding: 'clamp(24px, 4vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}
        >
          {/* Custom Tabs */}
          <div 
            style={{ 
              display: 'flex', 
              background: 'var(--color-surface-container-low)', 
              borderRadius: 'var(--radius-full)', 
              padding: '6px',
              maxWidth: '350px',
              border: '1px solid var(--color-outline-variant)'
            }}
          >
            <button
              onClick={() => { setActiveTab('citizen'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'citizen' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'citizen' ? '#fff' : 'var(--color-on-surface-variant)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <FaUser size={14} />
              Citizen
            </button>
            <button
              onClick={() => { setActiveTab('official'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'official' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'official' ? '#fff' : 'var(--color-on-surface-variant)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <FaUserShield size={14} />
              Official
            </button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <h3 className="headline-sm" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              {isRegister ? 'Register ' : 'Sign in '} as {activeTab === 'citizen' ? 'Citizen' : 'Corporation Official'}
            </h3>
            <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
              {isRegister 
                ? 'Create a secure credential to file reports.' 
                : 'Sign in to access your customized dashboard.'
              }
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            {isRegister && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Anand R." 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder={activeTab === 'citizen' ? 'citizen@kozhikode.in' : 'official@kozhikode.gov.in'}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                className="label-sm hover:underline"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-glow btn-shimmer"
                style={{ 
                  borderRadius: 'var(--radius-full)', 
                  padding: '0 28px',
                  boxShadow: '0 4px 15px rgba(53, 37, 205, 0.2)' 
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isRegister ? 'Register' : 'Sign In'}
                  <FaSignInAlt size={14} />
                </span>
              </button>
            </div>
          </form>

          {/* Quick Login Section */}
          <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--space-md)' }}>
            <p className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Quick testing actions
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleQuickLogin('citizen')}
                className="btn btn-outline btn-shimmer"
                style={{ flex: 1, minWidth: '180px', minHeight: '44px', display: 'flex', gap: '8px', fontSize: '0.9rem' }}
              >
                <span>Login as Demo Citizen</span>
                <FaArrowRight size={12} />
              </button>
              <button 
                onClick={() => handleQuickLogin('official')}
                className="btn btn-outline btn-shimmer"
                style={{ flex: 1, minWidth: '180px', minHeight: '44px', display: 'flex', gap: '8px', fontSize: '0.9rem' }}
              >
                <span>Login as Demo Official</span>
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
