"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CitizenDashboard from './CitizenDashboard';
import OfficialDashboard from './OfficialDashboard';
import EngineerDashboard from './EngineerDashboard';

export default function DashboardRouteGuard() {
  const router = useRouter();
  const [loadingText, setLoadingText] = useState('Securing session...');
  const [role, setRole] = useState<'citizen' | 'official' | 'engineer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication state from localStorage
    const storedUser = localStorage.getItem('nammude_user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'citizen') {
          setRole('citizen');
          setLoading(false);
        } else if (user && user.role === 'official') {
          setRole('official');
          setLoading(false);
        } else if (user && user.role === 'engineer') {
          // Verify access control state from database
          const storedEngs = localStorage.getItem('nammude_engineers');
          if (storedEngs) {
            const engList = JSON.parse(storedEngs);
            const currentEng = engList.find((e: any) => e.id === user.id);
            if (currentEng && !currentEng.hasAccess) {
              setLoadingText('Access Denied: Portal access has been revoked.');
              localStorage.removeItem('nammude_user');
              setTimeout(() => {
                router.replace('/auth?error=revoked');
              }, 2000);
              return;
            }
          }
          setRole('engineer');
          setLoading(false);
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

  if (loading) {
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

  if (role === 'citizen') {
    return <CitizenDashboard />;
  }

  if (role === 'official') {
    return <OfficialDashboard />;
  }

  if (role === 'engineer') {
    return <EngineerDashboard />;
  }

  return null;
}
