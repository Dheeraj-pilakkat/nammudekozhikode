"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardRouteGuard() {
  const router = useRouter();
  const [loadingText, setLoadingText] = useState('Securing session...');

  useEffect(() => {
    // Check authentication state from localStorage
    const storedUser = localStorage.getItem('nammude_user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'citizen') {
          setLoadingText('Loading Citizen Portal...');
          router.replace('/dashboard/citizen');
        } else if (user && user.role === 'official') {
          setLoadingText('Loading Official Portal...');
          router.replace('/dashboard/official');
        } else {
          // Faulty user object
          localStorage.removeItem('nammude_user');
          router.replace('/auth');
        }
      } catch (e) {
        localStorage.removeItem('nammude_user');
        router.replace('/auth');
      }
    } else {
      setLoadingText('Redirecting to authentication...');
      router.replace('/auth');
    }
  }, [router]);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '20px'
      }}
    >
      <div 
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid rgba(53, 37, 205, 0.1)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p 
        className="headline-sm font-semibold animate-pulse" 
        style={{ 
          color: 'var(--color-primary)',
          letterSpacing: '-0.01em'
        }}
      >
        {loadingText}
      </p>

      {/* Embedded CSS for spinner */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
