"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaFileAlt, FaSignOutAlt, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaCheck, FaExclamationTriangle, FaClock, FaCheckCircle, FaClipboardList, FaPlus, FaCog } from 'react-icons/fa';
import { db, isFirebaseEnabled } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

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
  resolutionNotes?: string;
}

interface Engineer {
  id: string;
  name: string;
  dept: string;
  mobile: string;
  email: string;
  password?: string;
  status: 'Available' | 'On Duty' | 'Busy';
  hasAccess: boolean;
}

export default function EngineerDashboard() {
  const router = useRouter();
  const [engineer, setEngineer] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeTab, setActiveTab] = useState('Tasks');
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  
  // Password Settings Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    // Fetch session user
    const storedUser = localStorage.getItem('nammude_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'engineer') {
      router.push('/dashboard');
      return;
    }

    setEngineer(parsedUser);

    if (isFirebaseEnabled) {
      const unsubEngineers = onSnapshot(doc(db, 'engineers', parsedUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const currentEng = docSnap.data();
          if (currentEng && !currentEng.hasAccess) {
            localStorage.removeItem('nammude_user');
            router.push('/auth?error=revoked');
          }
        }
      }, (err) => {
        console.error("Failed to fetch engineer details in real-time:", err);
      });

      const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const fetchedReports: Report[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push(doc.data() as Report);
        });
        setReports(fetchedReports);
      }, (err) => {
        console.error("Failed to load reports from Firestore:", err);
      });

      return () => {
        unsubReports();
        unsubEngineers();
      };
    } else {
      // Load engineers database to double-check active access
      const storedEngs = localStorage.getItem('nammude_engineers');
      if (storedEngs) {
        const engsList = JSON.parse(storedEngs);
        const currentEng = engsList.find((e: any) => e.id === parsedUser.id);
        if (currentEng && !currentEng.hasAccess) {
          // Revoked access
          localStorage.removeItem('nammude_user');
          router.push('/auth?error=revoked');
          return;
        }
      }

      // Load tickets database
      const storedReports = localStorage.getItem('nammude_reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    }
  }, [router]);

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
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab, mounted]);

  const handleLogout = () => {
    localStorage.removeItem('nammude_user');
    window.dispatchEvent(new Event('storage'));
    router.push('/auth');
  };

  // Filter tasks assigned to this engineer
  const assignedTasks = reports.filter(r => r.assignee === engineer?.name);
  const activeTasks = assignedTasks.filter(t => t.status !== 'Resolved');
  const resolvedTasks = assignedTasks.filter(t => t.status === 'Resolved');

  const handleUpdateStatus = async (taskId: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
    if (isFirebaseEnabled) {
      try {
        const repRef = doc(db, 'reports', taskId);
        const targetTask = reports.find(r => r.id === taskId);
        if (targetTask) {
          await setDoc(repRef, {
            ...targetTask,
            status,
            resolutionNotes: status === 'Resolved' || resolutionNotes ? resolutionNotes : targetTask.resolutionNotes
          });
        }
      } catch (err: any) {
        console.error("Failed to update status in Firestore:", err);
      }
    } else {
      const updatedReports = reports.map(r => {
        if (r.id === taskId) {
          return {
            ...r,
            status,
            resolutionNotes: status === 'Resolved' || resolutionNotes ? resolutionNotes : r.resolutionNotes
          };
        }
        return r;
      });

      localStorage.setItem('nammude_reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
    }
    
    setSuccessMsg(`Task state updated to ${status}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmitResolution = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!resolutionNotes) return;
    
    if (isFirebaseEnabled) {
      try {
        const repRef = doc(db, 'reports', taskId);
        const targetTask = reports.find(r => r.id === taskId);
        if (targetTask) {
          await setDoc(repRef, {
            ...targetTask,
            status: 'Resolved' as const,
            resolutionNotes
          });
        }
      } catch (err) {
        console.error("Failed to resolve task in Firestore:", err);
      }
    } else {
      const updatedReports = reports.map(r => {
        if (r.id === taskId) {
          return {
            ...r,
            status: 'Resolved' as const,
            resolutionNotes
          };
        }
        return r;
      });

      localStorage.setItem('nammude_reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
    }
    
    setResolutionNotes('');
    setSuccessMsg('Task resolved and notes logged!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSettingsError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsError('New passwords do not match.');
      return;
    }

    if (isFirebaseEnabled) {
      try {
        const engRef = doc(db, 'engineers', engineer.id);
        const { getDoc } = await import('firebase/firestore');
        const engDoc = await getDoc(engRef);
        if (!engDoc.exists()) {
          setSettingsError('Engineer profile not found in database.');
          return;
        }
        const currentEng = engDoc.data();
        const correctOldPassword = currentEng.password || 'engineer123';
        if (oldPassword !== correctOldPassword) {
          setSettingsError('Incorrect current password.');
          return;
        }
        await setDoc(engRef, { ...currentEng, password: newPassword });
      } catch (err: any) {
        console.error("Failed to update password in Firestore:", err);
        setSettingsError(`Failed to update password: ${err.message}`);
        return;
      }
    } else {
      const storedEngs = localStorage.getItem('nammude_engineers');
      if (!storedEngs) {
        setSettingsError('Engineer database not found.');
        return;
      }

      const engsList = JSON.parse(storedEngs);
      const engIndex = engsList.findIndex((e: any) => e.id === engineer.id);
      if (engIndex === -1) {
        setSettingsError('Engineer profile not found.');
        return;
      }

      const currentEng = engsList[engIndex];
      const correctOldPassword = currentEng.password || 'engineer123';
      if (oldPassword !== correctOldPassword) {
        setSettingsError('Incorrect current password.');
        return;
      }

      engsList[engIndex].password = newPassword;
      localStorage.setItem('nammude_engineers', JSON.stringify(engsList));
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSettingsSuccess('Password updated successfully!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  if (!mounted || !engineer) return null;

  return (
    <div className="animate-reveal" style={{ width: '100%', maxWidth: '100%', padding: 'var(--space-md)', minHeight: '85vh' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: 'var(--space-lg)',
        width: '100%'
      }}>
        
        {/* Sidebar */}
        <aside className="bento-card" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', overflow: 'hidden' }}>
          
          {/* Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', padding: 'var(--space-sm)' }}>
            <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              {engineer.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h3 className="label-lg" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{engineer.name}</h3>
              <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Field Engineer</p>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ padding: '10px 12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--color-outline)', fontWeight: 600 }}>OPERATIONS DETAILS</span>
            <span>📞 {engineer.mobile}</span>
            <span>✉️ {engineer.email}</span>
            <span>👷‍♂️ {engineer.dept}</span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: '16px' }}>
            <button
              onClick={() => setActiveTab('Tasks')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'Tasks' ? 'var(--color-primary-container)' : 'transparent',
                color: activeTab === 'Tasks' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'Tasks' ? 600 : 500,
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
            >
              <FaClipboardList style={{ fontSize: '20px' }} />
              <span>Assigned Tasks</span>
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
              <span className="chip" style={{ background: 'rgba(0, 108, 73, 0.08)', color: 'var(--color-secondary)', marginBottom: '8px' }}>
                Operational Workspace
              </span>
              <h1 className="display-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Field Dispatch Portal</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Active Load</p>
              <h3 className="label-lg" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                {activeTasks.length} Tickets Assigned
              </h3>
            </div>
          </header>

          {/* Tasks Tab View */}
          {activeTab === 'Tasks' && (
            <>
              {/* Stats Bento Grid */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Pending Issues</p>
                  <FaExclamationTriangle style={{ color: 'var(--color-tertiary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{activeTasks.filter(t => t.status === 'Pending').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-tertiary)', marginTop: 'var(--space-xs)' }}>Awaiting action</p>
              </div>

              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>In Progress</p>
                  <FaClock style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{activeTasks.filter(t => t.status === 'In Progress').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-primary)', marginTop: 'var(--space-xs)' }}>Active Operations</p>
              </div>

              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Resolved Tasks</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{resolvedTasks.length}</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>Completed updates</p>
              </div>

              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                <div className="noise-overlay" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Resolution Index</p>
                  <FaCheckCircle style={{ color: '#fff' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700, color: '#fff' }}>
                  {assignedTasks.length > 0 ? Math.round((resolvedTasks.length / assignedTasks.length) * 100) : 0}%
                </p>
                <p className="label-sm" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 'var(--space-xs)' }}>Overall performance score</p>
              </div>

              {/* Two-Column split workspace */}
              <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', width: '100%', marginTop: '8px' }}>
                
                {/* Task list Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '6px' }}>
                  {assignedTasks.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-lowest)', color: 'var(--color-outline)' }}>
                      <p className="body-md" style={{ fontWeight: 600 }}>No tasks currently assigned.</p>
                      <p className="label-sm" style={{ marginTop: '4px' }}>New reports assigned by municipal officials will show up here.</p>
                    </div>
                  ) : (
                    assignedTasks.map(task => {
                      const isSelected = selectedTaskId === task.id;
                      const isHovered = hoveredTaskId === task.id;
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => { setSelectedTaskId(task.id); setResolutionNotes(task.resolutionNotes || ''); }}
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                            backgroundColor: isSelected ? 'rgba(53, 37, 205, 0.04)' : 'var(--color-surface-container-lowest)',
                            cursor: 'pointer',
                            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: isHovered || isSelected ? 'var(--shadow-layer-2)' : 'var(--shadow-near)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="label-sm font-bold" style={{ color: 'var(--color-primary)' }}>{task.id}</span>
                            <span className="chip" style={{
                              fontSize: '10px', 
                              padding: '2px 8px',
                              background: task.status === 'Resolved' ? 'var(--color-secondary-container)' : task.status === 'In Progress' ? 'var(--color-primary-container)' : 'var(--color-tertiary-container)',
                              color: task.status === 'Resolved' ? 'var(--color-on-secondary-container)' : task.status === 'In Progress' ? 'var(--color-on-primary-container)' : 'var(--color-on-tertiary-container)'
                            }}>{task.status}</span>
                          </div>
                          <h4 className="label-lg" style={{ fontWeight: 700, margin: '6px 0' }}>{task.title}</h4>
                          <p className="label-sm" style={{ color: 'var(--color-outline)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaMapMarkerAlt /> {task.ward}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Task Detail Pane */}
                <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '24px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                  {selectedTaskId ? (
                    (() => {
                      const task = reports.find(t => t.id === selectedTaskId);
                      if (!task) return null;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          
                          {/* Details Header */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span className="label-sm font-bold" style={{ color: 'var(--color-primary)' }}>{task.id}</span>
                              <span className="chip" style={{ background: 'var(--color-surface-container-low)', fontSize: '11px', padding: '2px 8px' }}>{task.category}</span>
                            </div>
                            <h3 className="headline-sm" style={{ fontWeight: 800 }}>{task.title}</h3>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px' }}>
                              Reported by {task.reporter} in <strong>{task.ward}</strong> on {task.date}
                            </p>
                          </div>

                          {/* Success notification inside workspace */}
                          {successMsg && (
                            <div style={{ padding: '12px 14px', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaCheck /> {successMsg}
                            </div>
                          )}

                          {/* Description */}
                          <div>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '6px' }}>Incident Description</label>
                            <div style={{ padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: '13px', lineHeight: 1.6 }}>
                              "{task.description}"
                            </div>
                          </div>

                          {/* Quick Status State Switch */}
                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '10px' }}>Quick Actions</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                style={{
                                  flex: 1, minHeight: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-outline-variant)', cursor: 'pointer',
                                  background: task.status === 'In Progress' ? 'var(--color-primary-container)' : 'transparent',
                                  color: task.status === 'In Progress' ? '#fff' : 'var(--color-on-surface-variant)',
                                  fontWeight: 700, fontSize: '12px', transition: 'all 0.2s ease'
                                }}
                              >
                                Mark In Progress
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(task.id, 'Pending')}
                                style={{
                                  flex: 1, minHeight: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-outline-variant)', cursor: 'pointer',
                                  background: task.status === 'Pending' ? 'var(--color-tertiary-container)' : 'transparent',
                                  color: task.status === 'Pending' ? 'var(--color-on-tertiary-container)' : 'var(--color-on-surface-variant)',
                                  fontWeight: 700, fontSize: '12px', transition: 'all 0.2s ease'
                                }}
                              >
                                Mark Pending
                              </button>
                            </div>
                          </div>

                          {/* Log Updates & Resolve Task Form */}
                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                            <form onSubmit={(e) => handleSubmitResolution(e, task.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-outline)' }}>Logged Resolution Update Notes</label>
                                <textarea
                                  className="input-field"
                                  rows={3}
                                  placeholder="Describe the actions taken to repair this issue. Citizen will see this update."
                                  value={resolutionNotes}
                                  onChange={e => setResolutionNotes(e.target.value)}
                                  style={{ padding: '10px 14px', fontSize: '13px', minHeight: '80px', fontFamily: 'inherit' }}
                                />
                              </div>

                              <button
                                type="submit"
                                className="btn btn-success btn-glow"
                                style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, alignSelf: 'flex-end', padding: '0 24px' }}
                                disabled={!resolutionNotes}
                              >
                                Confirm Resolution & Close Ticket
                              </button>
                            </form>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', textAlign: 'center', padding: '40px 0' }}>
                      <p className="body-md">Select an active ticket from the left panel to update logs, assign completion statuses, and log resolution feedback.</p>
                    </div>
                  )}
                </div>

              </div>

            </>
          )}

          {/* Settings Tab View */}
          {activeTab === 'Settings' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', background: 'var(--color-surface-container-lowest)' }}>
              <div className="noise-overlay" />
              <div style={{ maxWidth: '480px' }}>
                <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Account Management
                </span>
                <h2 className="headline-md" style={{ marginBottom: 'var(--space-xs)', fontWeight: 800 }}>Security Settings</h2>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                  Change your password to secure your field engineer dispatch workspace.
                </p>

                {settingsSuccess && (
                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCheckCircle />
                    {settingsSuccess}
                  </div>
                )}

                {settingsError && (
                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                    {settingsError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Current Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>New Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-glow"
                    style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, marginTop: '10px', alignSelf: 'flex-start', padding: '0 24px' }}
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
