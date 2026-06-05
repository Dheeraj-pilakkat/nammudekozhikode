"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaSignOutAlt, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle, FaClock, FaClipboardList, FaPlus, FaCog, FaUser, FaUserCheck, FaUserTimes, FaBuilding, FaSpinner, FaTrash, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { db, isFirebaseEnabled } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { DEFAULT_WARDS, generateRandomCoords, Ward } from '../lib/wards';
import { AppNotification } from '../lib/notifications';

interface Report {
  id: string;
  title: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
  assignee: string;
  reporter: string;
  ward: string;
  description: string;
}

interface Official {
  uid: string;
  name: string;
  email: string;
  password?: string;
  role: 'official';
  ward: string;
  hasAccess: boolean;
}

export default function MayorDashboard() {
  const router = useRouter();
  const [mayor, setMayor] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [wardsList, setWardsList] = useState<Ward[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Notifications State
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'citizens' | 'officials'>('all');

  // Create Official Form State
  const [newOfficialName, setNewOfficialName] = useState('');
  const [newOfficialEmail, setNewOfficialEmail] = useState('');
  const [newOfficialPassword, setNewOfficialPassword] = useState('');
  const [newOfficialWard, setNewOfficialWard] = useState('Corporation Head Office');

  // Create Ward Form State
  const [newWardId, setNewWardId] = useState('');
  const [newWardName, setNewWardName] = useState('');

  useEffect(() => {
    setMounted(true);
    // Fetch session user
    const storedUser = localStorage.getItem('nammude_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'mayor') {
      router.push('/dashboard');
      return;
    }
    setMayor(parsedUser);

    if (isFirebaseEnabled) {
      // 1. Listen to all reports city-wide
      const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const fetchedReports: Report[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push(doc.data() as Report);
        });
        fetchedReports.sort((a, b) => b.id.localeCompare(a.id));
        setReports(fetchedReports);
      }, (err) => {
        console.error("Failed to load reports from Firestore:", err);
      });

      // 2. Listen to all users (filter for role === 'official')
      const unsubOfficials = onSnapshot(collection(db, 'users'), (snapshot) => {
        const fetchedOfficials: Official[] = [];
        snapshot.forEach((doc) => {
          const u = doc.data();
          if (u.role === 'official') {
            fetchedOfficials.push({
              uid: doc.id,
              name: u.name,
              email: u.email,
              password: u.password,
              role: 'official',
              ward: u.ward || 'Corporation Head Office',
              hasAccess: u.hasAccess !== false // default true
            });
          }
        });
        fetchedOfficials.sort((a, b) => a.name.localeCompare(b.name));
        setOfficials(fetchedOfficials);
      }, (err) => {
        console.error("Failed to load officials from Firestore:", err);
      });

      // 3. Listen to all wards
      const unsubWards = onSnapshot(collection(db, 'wards'), async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed default wards
          for (const w of DEFAULT_WARDS) {
            await setDoc(doc(db, 'wards', w.id), w);
          }
        } else {
          const list: Ward[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Ward);
          });
          list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
          setWardsList(list);
        }
      }, (err) => {
        console.error("Failed to load wards from Firestore:", err);
      });

      // 4. Listen to notifications
      const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AppNotification);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setNotificationsList(list);
      }, (err) => {
        console.error("Failed to load notifications from Firestore:", err);
      });

      return () => {
        unsubReports();
        unsubOfficials();
        unsubWards();
        unsubNotifs();
      };
    } else {
      // Fallback: local storage
      const storedReports = localStorage.getItem('nammude_reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }

      const storedOfficials = localStorage.getItem('nammude_officials_list');
      if (storedOfficials) {
        setOfficials(JSON.parse(storedOfficials));
      } else {
        // Seed default officials if empty
        const defaultOfficialsList: Official[] = [
          { uid: 'off_1', name: 'Anil Kumar', email: 'anil@kozhikode.gov.in', password: 'official123', role: 'official', ward: 'Ward 12', hasAccess: true },
          { uid: 'off_2', name: 'Sujatha P.', email: 'sujatha@kozhikode.gov.in', password: 'official123', role: 'official', ward: 'Ward 4', hasAccess: true },
          { uid: 'off_3', name: 'Ragesh K.', email: 'ragesh@kozhikode.gov.in', password: 'official123', role: 'official', ward: 'Corporation Head Office', hasAccess: true }
        ];
        localStorage.setItem('nammude_officials_list', JSON.stringify(defaultOfficialsList));
        setOfficials(defaultOfficialsList);
      }

      const storedWards = localStorage.getItem('nammude_wards');
      if (storedWards) {
        setWardsList(JSON.parse(storedWards));
      } else {
        localStorage.setItem('nammude_wards', JSON.stringify(DEFAULT_WARDS));
        setWardsList(DEFAULT_WARDS);
      }

      const storedNotifs = localStorage.getItem('nammude_notifications');
      if (storedNotifs) {
        setNotificationsList(JSON.parse(storedNotifs));
      } else {
        setNotificationsList([]);
      }
    }
  }, [router]);

  // Handle intersection observer for staggered reveals
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', 'true');
          }
        });
      },
      { threshold: 0.01 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.stagger-fade-up').forEach(el => observer.observe(el));
    }, 100);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab, mounted, officials]);

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!notifTitle.trim() || !notifContent.trim()) {
      setErrorMsg('Please fill in both title and content.');
      return;
    }
    const newNotif: AppNotification = {
      id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: notifTitle,
      content: notifContent,
      target: notifTarget,
      sender: 'Mayor of Kozhikode',
      senderRole: 'mayor',
      date: new Date().toISOString(),
      status: 'approved'
    };
    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
        setSuccessMsg('Notification broadcast successfully!');
      } catch (err: any) {
        console.error("Firestore send notif error:", err);
        setErrorMsg(`Failed to send: ${err.message}`);
        return;
      }
    } else {
      const updated = [newNotif, ...notificationsList];
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
      setSuccessMsg('Notification broadcast successfully!');
    }
    setNotifTitle('');
    setNotifContent('');
  };

  const handleApproveRequest = async (id: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    const targetNotif = notificationsList.find(n => n.id === id);
    if (!targetNotif) return;
    const approvedNotif: AppNotification = {
      ...targetNotif,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Mayor of Kozhikode'
    };
    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'notifications', id), approvedNotif);
        setSuccessMsg('Notification request approved and published!');
      } catch (err: any) {
        console.error("Firestore approve request error:", err);
        setErrorMsg(`Failed to approve: ${err.message}`);
      }
    } else {
      const updated = notificationsList.map(n => n.id === id ? approvedNotif : n);
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
      setSuccessMsg('Notification request approved and published!');
    }
  };

  const handleDenyRequest = async (id: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    const targetNotif = notificationsList.find(n => n.id === id);
    if (!targetNotif) return;
    const deniedNotif: AppNotification = {
      ...targetNotif,
      status: 'denied'
    };
    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'notifications', id), deniedNotif);
        setSuccessMsg('Notification request denied.');
      } catch (err: any) {
        console.error("Firestore deny request error:", err);
        setErrorMsg(`Failed to deny: ${err.message}`);
      }
    } else {
      const updated = notificationsList.map(n => n.id === id ? deniedNotif : n);
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
      setSuccessMsg('Notification request denied.');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setSuccessMsg('');
    setErrorMsg('');
    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
        setSuccessMsg('Notification removed permanently.');
      } catch (err: any) {
        console.error("Firestore delete notif error:", err);
        setErrorMsg(`Failed to delete: ${err.message}`);
      }
    } else {
      const updated = notificationsList.filter(n => n.id !== id);
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
      setSuccessMsg('Notification removed permanently.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nammude_user');
    window.dispatchEvent(new Event('storage'));
    router.push('/auth');
  };

  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newOfficialName || !newOfficialEmail || !newOfficialPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const emailLower = newOfficialEmail.toLowerCase();
    
    // Check if email already exists
    if (officials.some(off => off.email === emailLower)) {
      setErrorMsg('An official with this email already exists.');
      return;
    }

    const newUid = 'official_' + Date.now();
    const newOfficial: Official = {
      uid: newUid,
      name: newOfficialName,
      email: emailLower,
      password: newOfficialPassword,
      role: 'official',
      ward: newOfficialWard,
      hasAccess: true
    };

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'users', newUid), newOfficial);
      } catch (err: any) {
        console.error("Failed to save official to Firestore:", err);
        setErrorMsg(`Failed to save official: ${err.message}`);
        return;
      }
    } else {
      const updatedList = [...officials, newOfficial];
      localStorage.setItem('nammude_officials_list', JSON.stringify(updatedList));
      setOfficials(updatedList);
    }

    setSuccessMsg(`Official account for ${newOfficialName} created successfully!`);
    setNewOfficialName('');
    setNewOfficialEmail('');
    setNewOfficialPassword('');
    setNewOfficialWard('Ward 12');

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleAccess = async (official: Official) => {
    setErrorMsg('');
    setSuccessMsg('');
    const updatedAccess = !official.hasAccess;

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'users', official.uid), { ...official, hasAccess: updatedAccess });
      } catch (err: any) {
        console.error("Failed to toggle access in Firestore:", err);
        setErrorMsg("Failed to update status.");
      }
    } else {
      const updatedList = officials.map(off => off.uid === official.uid ? { ...off, hasAccess: updatedAccess } : off);
      localStorage.setItem('nammude_officials_list', JSON.stringify(updatedList));
      setOfficials(updatedList);
      setSuccessMsg(`Official ${official.name}'s access status updated.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleChangeWard = async (official: Official, newWard: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'users', official.uid), { ...official, ward: newWard });
      } catch (err: any) {
        console.error("Failed to update ward in Firestore:", err);
        setErrorMsg("Failed to update ward.");
      }
    } else {
      const updatedList = officials.map(off => off.uid === official.uid ? { ...off, ward: newWard } : off);
      localStorage.setItem('nammude_officials_list', JSON.stringify(updatedList));
      setOfficials(updatedList);
      setSuccessMsg(`Official ${official.name} reassigned to ${newWard}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newWardId || !newWardName) {
      setErrorMsg('Please fill in both Ward ID and Area Name.');
      return;
    }

    const idTrim = newWardId.trim();
    const nameTrim = newWardName.trim();

    if (wardsList.some(w => w.id.toLowerCase() === idTrim.toLowerCase())) {
      setErrorMsg('A ward with this ID already exists.');
      return;
    }

    const coords = generateRandomCoords();
    const newWard: Ward = { id: idTrim, name: nameTrim, ...coords };

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'wards', idTrim), newWard);
      } catch (err: any) {
        console.error("Failed to save ward to Firestore:", err);
        setErrorMsg(`Failed to save ward: ${err.message}`);
        return;
      }
    } else {
      const updatedList = [...wardsList, newWard];
      localStorage.setItem('nammude_wards', JSON.stringify(updatedList));
      setWardsList(updatedList);
    }

    setSuccessMsg(`Ward ${idTrim} (${nameTrim}) added successfully!`);
    setNewWardId('');
    setNewWardName('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveWard = async (wardId: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(db, 'wards', wardId));
      } catch (err: any) {
        console.error("Failed to delete ward from Firestore:", err);
        setErrorMsg(`Failed to delete ward: ${err.message}`);
        return;
      }
    } else {
      const updatedList = wardsList.filter(w => w.id !== wardId);
      localStorage.setItem('nammude_wards', JSON.stringify(updatedList));
      setWardsList(updatedList);
    }

    setSuccessMsg(`Ward ${wardId} removed successfully.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const wardOptions = ['Corporation Head Office', ...wardsList.map(w => w.id)];

  if (!mounted || !mayor) return null;

  // Overview Stats
  const totalOfficials = officials.length;
  const activeOfficialsCount = officials.filter(o => o.hasAccess).length;
  const pendingIssues = reports.filter(r => r.status === 'Pending').length;
  const inProgressIssues = reports.filter(r => r.status === 'In Progress').length;
  const resolvedIssues = reports.filter(r => r.status === 'Resolved').length;
  const activeWards = Array.from(new Set(reports.filter(r => r.status !== 'Resolved').map(r => r.ward)));

  return (
    <div className="animate-reveal" style={{ width: '100%', maxWidth: '100%', padding: 'var(--space-md)', minHeight: '85vh' }}>
      
      {!isFirebaseEnabled && (
        <div style={{
          padding: '12px 20px',
          background: 'rgba(230, 81, 0, 0.08)',
          color: 'var(--color-tertiary)',
          border: '1px solid rgba(230, 81, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          marginBottom: 'var(--space-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          ⚠️ Offline Mode: Simulating official registry changes inside local storage session.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 'var(--space-lg)',
        width: '100%'
      }}>
        
        {/* Sidebar */}
        <aside className="bento-card" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', padding: 'var(--space-sm)' }}>
            <div style={{ minWidth: '46px', width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              MK
            </div>
            <div>
              <h3 className="label-lg" style={{ fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mayor of Kozhikode</h3>
              <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Super Administrator</p>
            </div>
          </div>

          {/* Location details block */}
          <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--color-outline)', fontWeight: 600 }}>HEADQUARTERS</span>
            <span>📍 Corporation Head Office</span>
            <span>📧 mayor@kozhikode.gov.in</span>
            <span>🏛️ Kozhikode Municipality</span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: '16px' }}>
            <button
              onClick={() => setActiveTab('Overview')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Overview' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Overview' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Overview' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaBuilding style={{ fontSize: '20px' }} />
              <span>Overview Stats</span>
            </button>
            
            <button
              onClick={() => setActiveTab('Officials')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Officials' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Officials' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Officials' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaUserShield style={{ fontSize: '20px' }} />
              <span>Manage Officials</span>
            </button>

            <button
              onClick={() => setActiveTab('Wards')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Wards' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Wards' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Wards' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaMapMarkerAlt style={{ fontSize: '20px' }} />
              <span>Manage Wards</span>
            </button>

            <button
              onClick={() => setActiveTab('Notifications')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Notifications' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Notifications' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Notifications' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaBell style={{ fontSize: '20px' }} />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('Settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Settings' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Settings' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Settings' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaCog style={{ fontSize: '20px' }} />
              <span>Portal Settings</span>
            </button>
          </nav>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'rgba(186, 26, 26, 0.1)',
              color: 'var(--color-error)',
              cursor: 'pointer',
              fontWeight: 600,
              minHeight: '48px',
              marginTop: 'auto'
            }}
          >
            <FaSignOutAlt style={{ fontSize: '20px' }} />
            <span>Logout Workspace</span>
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="awwwards-bento-grid" style={{ padding: '0', maxWidth: '100%', width: '100%' }}>
          
          {/* Header */}
          <header className="awwwards-bento-card col-span-4 glass-lite" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)', position: 'relative' }}>
            <div className="noise-overlay" />
            <div>
              <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Executive Council Portal
              </span>
              <h1 className="display-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Mayor's Executive Dashboard</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Officials Under Command</p>
              <h3 className="label-lg" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                {activeOfficialsCount} / {totalOfficials} Wards Staff Active
              </h3>
            </div>
          </header>

          {/* Tab View: Overview */}
          {activeTab === 'Overview' && (
            <>
              {/* Statistics Row */}
              <div className="awwwards-bento-card col-span-1 stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Staff Registries</p>
                  <FaUserShield style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{totalOfficials}</p>
                <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: 'var(--space-xs)' }}>Created accounts</p>
              </div>

              <div className="awwwards-bento-card col-span-1 stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Registered Wards</p>
                  <FaMapMarkerAlt style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{wardsList.length}</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>Active areas: {activeWards.length} with issues</p>
              </div>

              <div className="awwwards-bento-card col-span-1 stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Pending Issues</p>
                  <FaExclamationTriangle style={{ color: 'var(--color-error)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{pendingIssues + inProgressIssues}</p>
                <p className="label-sm" style={{ color: 'var(--color-error)', marginTop: 'var(--space-xs)' }}>{pendingIssues} awaiting dispatcher</p>
              </div>

              <div className="awwwards-bento-card col-span-1 stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Resolved Tickets</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{resolvedIssues}</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>Resolution rate: {reports.length > 0 ? Math.round((resolvedIssues / reports.length) * 100) : 0}%</p>
              </div>

              {/* Feed: City-wide reports overview */}
              <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-md)' }}>City-Wide Reports Activity Feed</h3>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reports.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-lg)' }}>
                      No civic reports logged yet.
                    </div>
                  ) : (
                    reports.slice(0, 10).map((rep) => (
                      <div key={rep.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={`chip`} style={{ 
                            fontSize: '9px',
                            background: rep.status === 'Resolved' ? 'var(--color-secondary-container)' : rep.status === 'In Progress' ? 'var(--color-primary-container)' : 'var(--color-tertiary-container)',
                            color: rep.status === 'Resolved' ? 'var(--color-on-secondary-container)' : rep.status === 'In Progress' ? '#fff' : 'var(--color-on-tertiary-container)'
                          }}>
                            {rep.status}
                          </span>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: '13px' }}>{rep.title}</span>
                            <div style={{ fontSize: '11px', color: 'var(--color-outline)', marginTop: '3px' }}>
                              <span>Ward: <strong>{rep.ward}</strong></span> | <span>Assignee: {rep.assignee || 'Not Assigned'}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-outline)' }}>{rep.date}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tab View: Officials management */}
          {activeTab === 'Officials' && (
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
              
              {/* Add Official Form Card */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)', height: 'fit-content' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Create Official</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Provision a credential for a ward officer. They can manage dispatch operations exclusively in their assigned ward.
                </p>

                {errorMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleCreateOfficial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Radhakrishnan K." 
                      value={newOfficialName}
                      onChange={e => setNewOfficialName(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Email Address</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      placeholder="official@kozhikode.gov.in" 
                      value={newOfficialEmail}
                      onChange={e => setNewOfficialEmail(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Password</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      placeholder="••••••••" 
                      value={newOfficialPassword}
                      onChange={e => setNewOfficialPassword(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Assigned Ward Authority</label>
                    <select
                      className="input-field"
                      value={newOfficialWard}
                      onChange={e => setNewOfficialWard(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px', padding: '0 10px' }}
                    >
                      {wardOptions.map(ward => (
                        <option key={ward} value={ward}>
                          {ward === 'Corporation Head Office' ? 'Corporation Head Office (Full Access)' : ward}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-glow"
                    style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, marginTop: '8px', padding: '0 24px', alignSelf: 'flex-start' }}
                  >
                    Create Account
                  </button>
                </form>
              </div>

              {/* Official List Card */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Active Official Registries</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                  Control active credentials, monitor ward assignments, and grant or revoke database portals.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                  {officials.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}>
                      No officials registered yet. Create one on the left panel.
                    </div>
                  ) : (
                    officials.map(official => (
                      <div 
                        key={official.uid}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-outline-variant)',
                          background: 'var(--color-surface-container-lowest)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          opacity: official.hasAccess ? 1 : 0.65,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 className="label-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {official.name}
                              <span className={`chip`} style={{ 
                                fontSize: '8px', 
                                padding: '1px 6px',
                                background: official.hasAccess ? 'rgba(0, 108, 73, 0.08)' : 'rgba(186, 26, 26, 0.08)',
                                color: official.hasAccess ? 'var(--color-secondary)' : 'var(--color-error)'
                              }}>
                                {official.hasAccess ? 'Active Access' : 'Access Revoked'}
                              </span>
                            </h4>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '2px' }}>{official.email}</p>
                          </div>

                          <button
                            onClick={() => handleToggleAccess(official)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-full)',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: official.hasAccess ? 'rgba(186, 26, 26, 0.1)' : 'var(--color-primary-container)',
                              color: official.hasAccess ? 'var(--color-error)' : '#fff',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {official.hasAccess ? (
                              <>
                                <FaUserTimes /> Revoke Portal
                              </>
                            ) : (
                              <>
                                <FaUserCheck /> Restore Portal
                              </>
                            )}
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-outline-variant)' }}>
                          <span className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600, fontSize: '10px' }}>WARD RESOURCE</span>
                          <select
                            value={official.ward}
                            onChange={(e) => handleChangeWard(official, e.target.value)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: '1px solid var(--color-outline-variant)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-surface-container-low)',
                              cursor: 'pointer'
                            }}
                          >
                            {wardOptions.map(ward => (
                              <option key={ward} value={ward}>{ward}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab View: Manage Wards */}
          {activeTab === 'Wards' && (
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
              
              {/* Add Ward Form Card */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)', height: 'fit-content' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Add Municipal Ward</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Register a new ward section in the city map and dispatch database.
                </p>

                {errorMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleCreateWard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Ward ID / Number</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Ward 5" 
                      value={newWardId}
                      onChange={e => setNewWardId(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Area / Landmark Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Kallayi" 
                      value={newWardName}
                      onChange={e => setNewWardName(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-glow"
                    style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, marginTop: '8px', padding: '0 24px', alignSelf: 'flex-start' }}
                  >
                    Add Ward
                  </button>
                </form>
              </div>

              {/* Wards List Card */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Registered Wards Registry</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                  Monitor municipal divisions and remove outdated ward areas.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                  {wardsList.map(ward => (
                    <div 
                      key={ward.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-outline-variant)',
                        background: 'var(--color-surface-container-lowest)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <h4 className="label-lg" style={{ fontWeight: 800 }}>{ward.id}</h4>
                        <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '2px' }}>Area: {ward.name}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveWard(ward.id)}
                        disabled={['Ward 12', 'Ward 4', 'Ward 18', 'Ward 9'].includes(ward.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: ['Ward 12', 'Ward 4', 'Ward 18', 'Ward 9'].includes(ward.id) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(186, 26, 26, 0.1)',
                          color: 'var(--color-error)',
                          opacity: ['Ward 12', 'Ward 4', 'Ward 18', 'Ward 9'].includes(ward.id) ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        title={['Ward 12', 'Ward 4', 'Ward 18', 'Ward 9'].includes(ward.id) ? "Default system wards cannot be deleted." : "Remove ward"}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab View: Settings */}
          {activeTab === 'Settings' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', background: 'var(--color-surface-container-lowest)' }}>
              <div className="noise-overlay" />
              <div style={{ maxWidth: '480px' }}>
                <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Super Admin Account
                </span>
                <h2 className="headline-md" style={{ marginBottom: 'var(--space-xs)', fontWeight: 800 }}>Account Settings</h2>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                  Kozhikode Municipality Super Administrator Profile controls.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Profile Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value="Mayor of Kozhikode"
                      disabled
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-low)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Administrative Email</label>
                    <input
                      type="text"
                      className="input-field"
                      value="mayor@kozhikode.gov.in"
                      disabled
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-low)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab View: Notifications */}
          {activeTab === 'Notifications' && (
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
              
              {/* Broadcast Notification Form */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)', height: 'fit-content' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Broadcast Notification</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Send an official civic broadcast directly to citizens, officials, or all users.
                </p>

                <form onSubmit={handleCreateNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Notification Title</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Water Supply Interruption" 
                      value={notifTitle}
                      onChange={e => setNotifTitle(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Content / Description</label>
                    <textarea 
                      className="input-field" 
                      placeholder="Type details about the warning, event, or announcement..." 
                      value={notifContent}
                      onChange={e => setNotifContent(e.target.value)}
                      rows={4}
                      style={{ padding: '10px 12px', fontSize: '13px', background: 'var(--color-surface-container-lowest)', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Target Audience</label>
                    <select
                      className="input-field"
                      value={notifTarget}
                      onChange={e => setNotifTarget(e.target.value as any)}
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-lowest)', padding: '0 12px' }}
                    >
                      <option value="all">All Users (Citizens & Officials)</option>
                      <option value="citizens">Citizens Only</option>
                      <option value="officials">Officials Only</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-glow"
                    style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, marginTop: '8px', padding: '0 24px', alignSelf: 'flex-start' }}
                  >
                    Broadcast
                  </button>
                </form>
              </div>

              {/* Lists Panel: Pending Requests and History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Pending Requests Section */}
                <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Pending Official Requests</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                    Review notification proposals drafted by Ward Officials waiting for permission to dispatch to Citizens.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                    {notificationsList.filter(n => n.status === 'pending').length === 0 ? (
                      <p className="body-sm" style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '24px 0' }}>No pending notification requests.</p>
                    ) : (
                      notificationsList.filter(n => n.status === 'pending').map(n => (
                        <div 
                          key={n.id}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-outline-variant)',
                            background: 'var(--color-surface-container-lowest)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span className="chip" style={{ background: 'rgba(219, 68, 85, 0.08)', color: 'var(--color-error)', fontSize: '10px', marginBottom: '6px' }}>Target: {n.target}</span>
                              <h4 className="label-lg" style={{ fontWeight: 800 }}>{n.title}</h4>
                            </div>
                            <span className="label-sm" style={{ color: 'var(--color-outline)' }}>
                              {new Date(n.requestedAt || n.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{n.content}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '10px' }}>
                            <span className="label-sm" style={{ color: 'var(--color-outline)' }}>
                              By: <strong>{n.sender}</strong> ({n.requestedBy})
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleApproveRequest(n.id)}
                                style={{
                                  padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none',
                                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                  background: 'rgba(53, 37, 205, 0.1)', color: 'var(--color-primary)',
                                  display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                              >
                                <FaCheck /> Approve & Publish
                              </button>
                              <button
                                onClick={() => handleDenyRequest(n.id)}
                                style={{
                                  padding: '6px 12px', borderRadius: 'var(--radius-full)', border: 'none',
                                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                  background: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)',
                                  display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                              >
                                <FaTimes /> Deny
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* History Section */}
                <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Broadcast History</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                    Track previously sent or approved public notices.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                    {notificationsList.filter(n => n.status !== 'pending').length === 0 ? (
                      <p className="body-sm" style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '24px 0' }}>No history records found.</p>
                    ) : (
                      notificationsList.filter(n => n.status !== 'pending').map(n => (
                        <div 
                          key={n.id}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-outline-variant)',
                            background: 'var(--color-surface-container-lowest)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <span className="chip" style={{ fontSize: '9px', background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Target: {n.target}</span>
                              <span className={`chip ${n.status === 'approved' ? 'chip-resolved' : 'chip-pending'}`} style={{ fontSize: '9px' }}>
                                {n.status === 'approved' ? 'Active' : 'Denied'}
                              </span>
                            </div>
                            <h4 className="label-lg" style={{ fontWeight: 800 }}>{n.title}</h4>
                            <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>{n.content}</p>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '8px' }}>
                              Sent: {new Date(n.date).toLocaleString()} | By: {n.sender}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            style={{
                              padding: '8px', borderRadius: '50%', border: 'none',
                              cursor: 'pointer', background: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Delete permanently"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
