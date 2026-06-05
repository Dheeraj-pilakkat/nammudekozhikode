"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHome, FaFileAlt, FaHardHat, FaCog, FaBell, FaSearch, FaCheckCircle, FaExclamationTriangle, FaClock, FaUserCircle, FaFilter, FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight, FaTrash, FaCheck, FaChartBar, FaSignOutAlt, FaRoad, FaTint, FaLightbulb, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

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

const defaultEngineers: Engineer[] = [
  { id: 'ENG-101', name: 'Ramesh K.', dept: 'Roads Dept', mobile: '+919876543210', email: 'ramesh.k@kozhikode.gov.in', password: 'engineer123', status: 'On Duty', hasAccess: true },
  { id: 'ENG-102', name: 'Sunil V.', dept: 'Electrical Dept', mobile: '+919876543211', email: 'sunil.v@kozhikode.gov.in', password: 'engineer123', status: 'On Duty', hasAccess: true },
  { id: 'ENG-103', name: 'Priya M.', dept: 'Water Dept', mobile: '+919876543212', email: 'priya.m@kozhikode.gov.in', password: 'engineer123', status: 'Available', hasAccess: true },
  { id: 'ENG-104', name: 'Team Alpha', dept: 'Sanitation Crew', mobile: '+919876543213', email: 'alpha.sani@kozhikode.gov.in', password: 'engineer123', status: 'Busy', hasAccess: false }
];

export default function OfficialDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Administrative Filters & Controls
  const [reportStatus, setReportStatus] = useState('All');
  const [reportCategory, setReportCategory] = useState('All');
  const [reportSearch, setReportSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredWorkerName, setHoveredWorkerName] = useState<string | null>(null);
  
  // Engineers database & Add Engineer form state
  const [engineersList, setEngineersList] = useState<Engineer[]>([]);
  const [newEngName, setNewEngName] = useState('');
  const [newEngDept, setNewEngDept] = useState('Roads Dept');
  const [newEngMobile, setNewEngMobile] = useState('');
  const [newEngEmail, setNewEngEmail] = useState('');
  const [newEngPassword, setNewEngPassword] = useState('');
  const [showNewEngPassword, setShowNewEngPassword] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');
  const [editingEngineerId, setEditingEngineerId] = useState<string | null>(null);
  
  // Analytics Filter States
  const [analyticsDept, setAnalyticsDept] = useState('All Departments');
  const [analyticsYear, setAnalyticsYear] = useState('2026');
  const [analyticsMonth, setAnalyticsMonth] = useState('All Months');

  // Notifications List
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'New high priority report:', boldText: 'Water Main Burst', suffix: 'in Ward 12.', time: '2 mins ago', read: false },
    { id: 2, type: 'success', title: 'Ramesh K. marked', boldText: '#REP-2040', suffix: 'as Resolved.', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Weekly resolution report is ready to download.', boldText: '', suffix: '', time: '1 day ago', read: true }
  ]);

  const defaultReports: Report[] = [
    { id: 'REP-2041', title: 'Pothole on Beach Road', category: 'Roads', status: 'In Progress', date: '2026-06-04', assignee: 'Ramesh K.', reporter: 'Devi Prasad', ward: 'Ward 12', description: 'Large pothole near the beach parking lot causing traffic bottlenecks.' },
    { id: 'REP-2040', title: 'Broken Streetlight', category: 'Electricity', status: 'Resolved', date: '2026-06-03', assignee: 'Sunil V.', reporter: 'Devi Prasad', ward: 'Ward 12', description: 'Streetlight post #14 has been dark for three days near the park entry.' },
    { id: 'REP-2039', title: 'Water Pipe Leak', category: 'Water', status: 'Pending', date: '2026-06-02', assignee: 'Unassigned', reporter: 'Anjali S.', ward: 'Ward 4', description: 'Substantial water leaking from pavement joint near post office.' },
    { id: 'REP-2038', title: 'Fallen Tree Branch', category: 'Sanitation', status: 'Resolved', date: '2026-05-29', assignee: 'Team Alpha', reporter: 'Vikram J.', ward: 'Ward 12', description: 'Large branch blocking the pedestrian path on SM Street.' }
  ];

  useEffect(() => {
    setMounted(true);
    // Auth Check
    const storedUser = localStorage.getItem('nammude_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'official') {
      router.push('/dashboard');
      return;
    }
    setUser(parsedUser);

    // Initialize Database
    const storedReports = localStorage.getItem('nammude_reports');
    if (storedReports) {
      setReports(JSON.parse(storedReports));
    } else {
      localStorage.setItem('nammude_reports', JSON.stringify(defaultReports));
      setReports(defaultReports);
    }

    const storedEngineers = localStorage.getItem('nammude_engineers');
    if (storedEngineers) {
      setEngineersList(JSON.parse(storedEngineers));
    } else {
      localStorage.setItem('nammude_engineers', JSON.stringify(defaultEngineers));
      setEngineersList(defaultEngineers);
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

  // Update Status / Assign Engineer handler
  const handleUpdateReport = (id: string, status: 'Pending' | 'In Progress' | 'Resolved', assignee: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, status, assignee } : r);
    localStorage.setItem('nammude_reports', JSON.stringify(updated));
    setReports(updated);
    
    // Add Notification
    const newNotif = {
      id: Date.now(),
      type: status === 'Resolved' ? 'success' : 'info',
      title: `${assignee} updated ticket`,
      boldText: `#${id}`,
      suffix: `to ${status}.`,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const deleteAllNotifications = () => setNotifications([]);
  const markAsRead = (id: number) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchStatus = reportStatus === 'All' || report.status === reportStatus;
    const matchCategory = reportCategory === 'All' || report.category === reportCategory;
    const matchSearch = reportSearch ? (
      report.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.description.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.ward.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.reporter.toLowerCase().includes(reportSearch.toLowerCase())
    ) : true;
    return matchStatus && matchCategory && matchSearch;
  });

  const engineers = engineersList.map(eng => ({
    id: eng.id,
    name: eng.name,
    dept: eng.dept,
    mobile: eng.mobile,
    email: eng.email,
    hasAccess: eng.hasAccess,
    activeJobs: reports.filter(r => r.assignee === eng.name && r.status !== 'Resolved').length,
    status: eng.status
  }));

  const handleSelectEngineer = (eng: Engineer) => {
    setEditingEngineerId(eng.id);
    setNewEngName(eng.name);
    setNewEngDept(eng.dept);
    setNewEngMobile(eng.mobile);
    setNewEngEmail(eng.email);
    setNewEngPassword(eng.password || 'engineer123');
  };

  const handleAddEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSuccess('');
    setAddError('');

    if (!newEngName || !newEngMobile || !newEngEmail || !newEngPassword) {
      setAddError('Please fill in all fields.');
      return;
    }

    if (editingEngineerId) {
      // Update Mode
      const updated = engineersList.map(eng => {
        if (eng.id === editingEngineerId) {
          return {
            ...eng,
            name: newEngName,
            dept: newEngDept,
            mobile: newEngMobile,
            email: newEngEmail,
            password: newEngPassword
          };
        }
        return eng;
      });

      localStorage.setItem('nammude_engineers', JSON.stringify(updated));
      setEngineersList(updated);
      setAddSuccess('Field engineer profile updated successfully!');
      
      // Reset editing states
      setEditingEngineerId(null);
      setNewEngName('');
      setNewEngMobile('');
      setNewEngEmail('');
      setNewEngPassword('');
      setShowNewEngPassword(false);
    } else {
      // Create Mode
      const newEng: Engineer = {
        id: `ENG-${Math.floor(100 + Math.random() * 900)}`,
        name: newEngName,
        dept: newEngDept,
        mobile: newEngMobile,
        email: newEngEmail,
        password: newEngPassword,
        status: 'Available',
        hasAccess: true
      };

      const updated = [...engineersList, newEng];
      localStorage.setItem('nammude_engineers', JSON.stringify(updated));
      setEngineersList(updated);
      
      setNewEngName('');
      setNewEngMobile('');
      setNewEngEmail('');
      setNewEngPassword('');
      setShowNewEngPassword(false);
      setAddSuccess('Field engineer added successfully!');
    }
    
    // Auto-clear success message
    setTimeout(() => {
      setAddSuccess('');
    }, 3000);
  };

  const handleToggleAccess = (id: string) => {
    const updated = engineersList.map(e => e.id === id ? { ...e, hasAccess: !e.hasAccess } : e);
    localStorage.setItem('nammude_engineers', JSON.stringify(updated));
    setEngineersList(updated);
    
    // Dispatch storage event to alert other components of access change
    window.dispatchEvent(new Event('storage'));
  };

  // Dynamic Chart Calculations based on actual localStorage reports
  const getChartData = () => {
    // Basic baseline data
    let baseData = [40, 65, 30, 80, 55, 90, 70, 85, 100, 60, 45, 75];
    if (analyticsDept === 'Roads') baseData = [15, 25, 10, 30, 20, 35, 25, 30, 40, 20, 15, 25];
    if (analyticsDept === 'Water') baseData = [10, 15, 5, 20, 10, 25, 15, 20, 25, 15, 10, 20];
    if (analyticsYear === '2025') baseData = [30, 50, 40, 70, 45, 80, 60, 95, 85, 50, 35, 60];

    // Read live reports from current month (June) to append/adjust
    const currentMonthReports = reports.length;
    // Boost June value (index 5) depending on active tickets
    baseData[5] = currentMonthReports * 12;

    if (analyticsMonth !== 'All Months') {
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(analyticsMonth);
      if (monthIndex !== -1) {
        const newData = new Array(12).fill(0);
        newData[monthIndex] = baseData[monthIndex];
        return newData;
      }
    }
    return baseData;
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData, 100);

  if (!mounted || !user) return null;

  return (
    <div className="animate-reveal">
      <div id="scroll-progress" className="scroll-progress-bar"></div>
      
      <div style={{
        width: '100%',
        maxWidth: '100%', 
        padding: 'var(--space-md)',
        display: 'grid',
        gridTemplateColumns: isSidebarOpen ? '250px 1fr' : '88px 1fr',
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: 'var(--space-lg)',
        minHeight: '85vh'
      }}>
        
        {/* Sidebar */}
        <aside className="bento-card" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', padding: 'var(--space-sm)' }}>
            <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserCircle style={{ color: 'var(--color-primary)', fontSize: '24px' }} />
            </div>
            {isSidebarOpen && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <h3 className="label-lg" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h3>
                <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Official Portal</p>
              </div>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {['Overview', 'Reports Manager', 'Engineers', 'Analytics'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                title={!isSidebarOpen ? tab : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 'var(--space-md)',
                  padding: isSidebarOpen ? 'var(--space-sm) var(--space-md)' : 'var(--space-sm) 0',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === tab ? 'var(--color-primary-container)' : 'transparent',
                  color: activeTab === tab ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeTab === tab ? 600 : 500,
                  transition: 'all 0.2s ease',
                  minHeight: '48px'
                }}
              >
                {tab === 'Overview' && <FaHome style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Reports Manager' && <FaFileAlt style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Engineers' && <FaHardHat style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Analytics' && <FaChartBar style={{ fontSize: '20px', minWidth: '20px' }} />}
                {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{tab}</span>}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 'var(--space-md)',
                padding: isSidebarOpen ? 'var(--space-sm) var(--space-md)' : 'var(--space-sm) 0',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'rgba(186, 26, 26, 0.1)',
                color: 'var(--color-error)',
                cursor: 'pointer',
                fontWeight: 600,
                minHeight: '48px'
              }}
              title="Logout"
            >
              <FaSignOutAlt style={{ fontSize: '20px', minWidth: '20px' }} />
              {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
            </button>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isSidebarOpen ? 'flex-start' : 'center', 
                gap: 'var(--space-md)',
                padding: isSidebarOpen ? 'var(--space-sm) var(--space-md)' : 'var(--space-sm) 0',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-on-surface-variant)',
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
              title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isSidebarOpen ? <FaChevronLeft style={{ fontSize: '18px', minWidth: '20px' }} /> : <FaChevronRight style={{ fontSize: '18px', minWidth: '20px' }} />}
              {isSidebarOpen && <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area - Bento Grid */}
        <main className="awwwards-bento-grid" style={{ padding: '0', maxWidth: '100%', width: '100%' }}>
          
          {/* Top Header - Hero Block */}
          <header className="awwwards-bento-card col-span-4 glass-lite" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)', position: 'relative' }}>
            <div className="noise-overlay" />
            <h1 className="display-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Corporation Portal</h1>
            
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', padding: '8px' }}
                >
                  <FaBell style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)' }} />
                  {notifications.some(n => !n.read) && (
                    <span style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', backgroundColor: 'var(--color-error)', borderRadius: '50%' }}></span>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {showNotifications && (
                  <div className="bento-card" style={{ 
                    position: 'absolute', top: '100%', right: '0', 
                    width: '380px', padding: '0', 
                    zIndex: 100, overflow: 'hidden',
                    marginTop: 'var(--space-xs)',
                    boxShadow: 'var(--shadow-layer-3)'
                  }}>
                    <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="label-lg">Notifications</h3>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={markAllAsRead} className="label-sm hover:underline" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Mark all read</button>
                        <button onClick={deleteAllNotifications} className="label-sm hover:underline" style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Delete all</button>
                      </div>
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                          <p className="body-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{ 
                            padding: 'var(--space-md)', 
                            borderBottom: '1px solid var(--color-outline-variant)', 
                            display: 'flex', 
                            gap: 'var(--space-md)',
                            backgroundColor: n.read ? 'transparent' : 'var(--color-surface-container-low)',
                            position: 'relative'
                          }}>
                            <div style={{ flex: 1, paddingRight: '60px' }}>
                              <p className="body-sm" style={{ fontWeight: n.read ? 400 : 600 }}>
                                {n.title} {n.boldText && <strong>{n.boldText}</strong>} {n.suffix}
                              </p>
                              <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px' }}>{n.time}</p>
                            </div>
                            <div style={{ position: 'absolute', right: 'var(--space-md)', top: 'var(--space-md)', display: 'flex', gap: '8px' }}>
                              {!n.read && (
                                <button onClick={() => markAsRead(n.id)} title="Mark as read" style={{ background: 'var(--color-surface-container-high)', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaCheck style={{ fontSize: '10px' }} />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n.id)} title="Delete" style={{ background: 'var(--color-surface-container-high)', border: 'none', cursor: 'pointer', color: 'var(--color-error)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaTrash style={{ fontSize: '10px' }} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </header>

          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'Overview' && (
            <>
              {/* Stat Card 1 */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Pending Issues</p>
                  <FaExclamationTriangle style={{ color: 'var(--color-tertiary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{reports.filter(r => r.status === 'Pending').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-error)', marginTop: 'var(--space-xs)' }}>Awaiting corporation action</p>
              </div>

              {/* Stat Card 2 */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>In Progress</p>
                  <FaClock style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{reports.filter(r => r.status === 'In Progress').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-primary)', marginTop: 'var(--space-xs)' }}>Assigned to ward engineers</p>
              </div>

              {/* Stat Card 3 */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Total Resolved</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{reports.filter(r => r.status === 'Resolved').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>Completed this month</p>
              </div>

              {/* Stat Card 4 */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-secondary)', color: '#fff' }}>
                <div className="noise-overlay" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Active Workers</p>
                  <FaHardHat style={{ color: '#fff' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{engineers.length}</p>
                <p className="label-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 'var(--space-xs)' }}>Field teams dispatched</p>
              </div>

              {/* Recent Submissions Feed */}
              <div className="awwwards-bento-card col-span-4 row-span-2" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid rgba(199, 196, 216, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-container-low)' }}>
                  <h2 className="headline-sm">Incoming Citizen Tickets</h2>
                  <button className="btn btn-outline" style={{ minHeight: '36px' }} onClick={() => setActiveTab('Reports Manager')}>Open Dispatcher</button>
                </div>
                <div style={{ padding: 'var(--space-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                        <th style={{ padding: 'var(--space-sm) var(--space-lg)', fontWeight: 600 }} className="label-sm">Ticket ID</th>
                        <th style={{ padding: 'var(--space-sm)', fontWeight: 600 }} className="label-sm">Title</th>
                        <th style={{ padding: 'var(--space-sm)', fontWeight: 600 }} className="label-sm">Ward</th>
                        <th style={{ padding: 'var(--space-sm)', fontWeight: 600 }} className="label-sm">Reporter</th>
                        <th style={{ padding: 'var(--space-sm)', fontWeight: 600 }} className="label-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 5).map((report, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                          <td style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 700 }} className="body-sm">{report.id}</td>
                          <td style={{ padding: 'var(--space-md)' }} className="body-sm">{report.title}</td>
                          <td style={{ padding: 'var(--space-md)', color: 'var(--color-primary)', fontWeight: 600 }} className="body-sm">{report.ward}</td>
                          <td style={{ padding: 'var(--space-md)' }} className="body-sm">{report.reporter}</td>
                          <td style={{ padding: 'var(--space-md)' }}>
                            <span className={`chip ${report.status === 'Resolved' ? 'chip-resolved' : report.status === 'In Progress' ? 'chip-pending' : ''}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                              {report.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* --- REPORTS MANAGER TAB --- */}
          {activeTab === 'Reports Manager' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', minHeight: '550px' }}>
              
              {/* Dispatcher Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                    Municipal Dispatcher
                  </span>
                  <h2 className="headline-md" style={{ margin: 0 }}>Interactive Ticket Dispatcher</h2>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    Manage, triage, and assign citizen infrastructure reports to field crews in real time.
                  </p>
                </div>
              </div>

              {/* Interactive Search & Filter Toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--space-lg)', padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)' }}>
                <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-outline)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search by ID, Title, Reporter, Ward..."
                    value={reportSearch}
                    onChange={e => setReportSearch(e.target.value)}
                    style={{ paddingLeft: '40px', minHeight: '44px', width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-lowest)' }}
                  />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600 }}>Category:</span>
                  {['All', 'Roads', 'Water', 'Electricity', 'Sanitation'].map(cat => {
                    const count = cat === 'All' ? reports.length : reports.filter(r => r.category === cat).length;
                    const isSelected = reportCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setReportCategory(cat)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                          background: isSelected ? 'var(--color-primary-container)' : 'var(--color-surface-container-lowest)',
                          color: isSelected ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {cat} <span style={{ fontSize: '10px', opacity: 0.8, background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Status Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderLeft: '1px solid var(--color-outline-variant)', paddingLeft: '16px' }}>
                  <span className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600 }}>Status:</span>
                  {['All', 'Pending', 'In Progress', 'Resolved'].map(st => {
                    const count = st === 'All' ? reports.length : reports.filter(r => r.status === st).length;
                    const isSelected = reportStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setReportStatus(st)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                          background: isSelected ? 'var(--color-primary-container)' : 'var(--color-surface-container-lowest)',
                          color: isSelected ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {st} <span style={{ fontSize: '10px', opacity: 0.8, background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '24px' }}>
                
                {/* Left side: List of reports */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
                  {filteredReports.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-lowest)', color: 'var(--color-outline)', padding: '20px' }}>
                      <p className="body-md" style={{ fontWeight: 600 }}>No reports matched filters.</p>
                      <p className="label-sm" style={{ marginTop: '4px' }}>Try broadening your search keyword or selecting a different status/category filter.</p>
                    </div>
                  ) : (
                    filteredReports.map(report => {
                      const isSelected = selectedReportId === report.id;
                      
                      // Category border colors and icons
                      let categoryColor = 'var(--color-primary)';
                      let categoryIcon = <FaRoad />;
                      if (report.category === 'Water') { categoryColor = '#00bcd4'; categoryIcon = <FaTint />; }
                      else if (report.category === 'Electricity') { categoryColor = '#ff9800'; categoryIcon = <FaLightbulb />; }
                      else if (report.category === 'Sanitation') { categoryColor = 'var(--color-secondary)'; categoryIcon = <FaTrash />; }

                      return (
                        <div 
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          onMouseEnter={() => setHoveredCardId(report.id)}
                          onMouseLeave={() => setHoveredCardId(null)}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-lg)',
                            borderLeft: `6px solid ${categoryColor}`,
                            borderTop: isSelected ? '1px solid rgba(53, 37, 205, 0.3)' : '1px solid var(--color-outline-variant)',
                            borderRight: isSelected ? '1px solid rgba(53, 37, 205, 0.3)' : '1px solid var(--color-outline-variant)',
                            borderBottom: isSelected ? '1px solid rgba(53, 37, 205, 0.3)' : '1px solid var(--color-outline-variant)',
                            backgroundColor: isSelected ? 'rgba(53, 37, 205, 0.05)' : 'var(--color-surface-container-lowest)',
                            cursor: 'pointer',
                            boxShadow: isSelected || hoveredCardId === report.id ? 'var(--shadow-layer-2)' : 'var(--shadow-near)',
                            transform: hoveredCardId === report.id ? 'translateY(-2px)' : 'translateY(0)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="label-sm font-extrabold" style={{ color: categoryColor, letterSpacing: '0.05em' }}>{report.id}</span>
                              <span className="chip" style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {categoryIcon} {report.category}
                              </span>
                            </div>
                            
                            {/* Status marker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {report.status === 'Pending' && (
                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-error)', animation: 'pulse-neon 1.2s infinite' }} />
                              )}
                              {report.status === 'In Progress' && (
                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse-neon-blue 1.2s infinite' }} />
                              )}
                              <span className="label-sm font-semibold" style={{ fontSize: '11px', color: report.status === 'Resolved' ? 'var(--color-secondary)' : report.status === 'In Progress' ? 'var(--color-primary)' : 'var(--color-error)' }}>
                                {report.status}
                              </span>
                            </div>
                          </div>

                          <h4 className="label-lg" style={{ color: 'var(--color-on-surface)', fontWeight: 700, margin: '8px 0 10px 0', lineBreak: 'anywhere' }}>{report.title}</h4>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-outline-variant)', paddingTop: '10px', marginTop: '6px', fontSize: '12px', color: 'var(--color-outline)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt /> {report.ward}</span>
                            {report.assignee !== 'Unassigned' ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(53,37,205,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-primary)', fontWeight: 600 }}>
                                👷‍♂️ {report.assignee}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>⚠️ Unassigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right side: Selected report details & actions */}
                <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '24px', backgroundColor: 'var(--color-surface-container-lowest)', overflow: 'hidden' }}>
                  {selectedReportId ? (
                    (() => {
                      const rep = reports.find(r => r.id === selectedReportId);
                      if (!rep) return <p className="label-md">Select a ticket to dispatch.</p>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          
                          {/* Details Header */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="label-sm font-extrabold" style={{ color: 'var(--color-primary)', letterSpacing: '0.05em' }}>{rep.id}</span>
                              <span className="chip" style={{
                                fontSize: '11px', 
                                padding: '4px 10px',
                                background: rep.status === 'Resolved' ? 'var(--color-secondary-container)' : rep.status === 'In Progress' ? 'var(--color-primary-container)' : 'var(--color-tertiary-container)',
                                color: rep.status === 'Resolved' ? 'var(--color-on-secondary-container)' : rep.status === 'In Progress' ? 'var(--color-on-primary-container)' : 'var(--color-on-tertiary-container)'
                              }}>{rep.category}</span>
                            </div>
                            <h3 className="headline-sm" style={{ color: 'var(--color-on-surface)', fontSize: '18px', fontWeight: 800, lineBreak: 'anywhere' }}>{rep.title}</h3>
                          </div>

                          {/* Citizen metadata block */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                {rep.reporter.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '10px', textTransform: 'uppercase', margin: 0 }}>Reporter</p>
                                <p className="label-md font-semibold" style={{ margin: 0 }}>{rep.reporter}</p>
                              </div>
                            </div>
                            <div>
                              <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '10px', textTransform: 'uppercase', margin: 0 }}>Location / Ward</p>
                              <p className="label-md font-semibold" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaMapMarkerAlt style={{ color: 'var(--color-primary)' }} /> {rep.ward}
                              </p>
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-outline)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                              <FaCalendarAlt /> Submitted on {rep.date}
                            </div>
                          </div>

                          {/* Detailed Incident Description */}
                          <div>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '6px' }}>Citizen Incident Description</label>
                            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-low)', borderLeft: '3px solid var(--color-outline-variant)', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-on-surface-variant)' }}>
                              "{rep.description}"
                            </div>
                          </div>

                          {/* Status workflow selector */}
                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '8px' }}>Update Workflow State</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {[
                                { id: 'Pending', label: 'Pending', activeColor: 'var(--color-error)', bgColor: 'rgba(186, 26, 26, 0.1)' },
                                { id: 'In Progress', label: 'In Progress', activeColor: 'var(--color-primary)', bgColor: 'rgba(53, 37, 205, 0.1)' },
                                { id: 'Resolved', label: 'Resolved', activeColor: 'var(--color-secondary)', bgColor: 'rgba(0, 108, 73, 0.1)' }
                              ].map(st => {
                                const isCurrent = rep.status === st.id;
                                return (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => handleUpdateReport(rep.id, st.id as any, rep.assignee)}
                                    style={{
                                      flex: 1,
                                      minHeight: '40px',
                                      borderRadius: 'var(--radius-full)',
                                      border: isCurrent ? `2px solid ${st.activeColor}` : '1px solid var(--color-outline-variant)',
                                      background: isCurrent ? st.bgColor : 'transparent',
                                      color: isCurrent ? st.activeColor : 'var(--color-on-surface-variant)',
                                      fontWeight: 700,
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.activeColor }} />}
                                    {st.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Crew assignment grid */}
                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '10px' }}>Allocate Field Crew & Engineer</label>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              
                              {/* Unassigned Card */}
                              <div
                                onClick={() => handleUpdateReport(rep.id, rep.status, 'Unassigned')}
                                onMouseEnter={() => setHoveredWorkerName('Unassigned')}
                                onMouseLeave={() => setHoveredWorkerName(null)}
                                style={{
                                  padding: '12px',
                                  borderRadius: 'var(--radius-md)',
                                  border: rep.assignee === 'Unassigned' ? '2px solid var(--color-error)' : '1px solid var(--color-outline-variant)',
                                  background: rep.assignee === 'Unassigned' ? 'rgba(186, 26, 26, 0.05)' : hoveredWorkerName === 'Unassigned' ? 'var(--color-surface-container-low)' : 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transform: hoveredWorkerName === 'Unassigned' ? 'translateY(-1px)' : 'translateY(0)',
                                  boxShadow: hoveredWorkerName === 'Unassigned' ? 'var(--shadow-near)' : 'none',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                  ❌
                                </div>
                                <div>
                                  <p className="label-sm font-semibold" style={{ margin: 0, fontSize: '12px' }}>Unassigned</p>
                                  <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>No field team</p>
                                </div>
                              </div>

                              {/* Active Crew Cards */}
                              {engineers.map((eng, idx) => {
                                const isCurrentAssignee = rep.assignee === eng.name;
                                const isBusy = eng.activeJobs >= 2;
                                
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => handleUpdateReport(rep.id, rep.status, eng.name)}
                                    onMouseEnter={() => setHoveredWorkerName(eng.name)}
                                    onMouseLeave={() => setHoveredWorkerName(null)}
                                    style={{
                                      padding: '12px',
                                      borderRadius: 'var(--radius-md)',
                                      border: isCurrentAssignee ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                                      background: isCurrentAssignee ? 'rgba(53, 37, 205, 0.05)' : hoveredWorkerName === eng.name ? 'var(--color-surface-container-low)' : 'transparent',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      transform: hoveredWorkerName === eng.name ? 'translateY(-1px)' : 'translateY(0)',
                                      boxShadow: hoveredWorkerName === eng.name ? 'var(--shadow-near)' : 'none',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isCurrentAssignee ? 'var(--color-primary)' : 'var(--color-surface-container-high)', color: isCurrentAssignee ? '#fff' : 'var(--color-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                      {eng.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p className="label-sm font-semibold" style={{ margin: 0, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eng.name}</p>
                                      <p className="label-sm" style={{ color: isBusy ? 'var(--color-tertiary)' : 'var(--color-secondary)', fontSize: '9px', margin: 0 }}>
                                        {eng.dept} ({eng.activeJobs} active)
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Audit history timeline logs */}
                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px', marginTop: '4px' }}>
                            <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '10px' }}>Dispatch Audit Log</label>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
                              <div style={{ position: 'absolute', left: '6px', top: '4px', bottom: '4px', width: '2px', backgroundColor: 'var(--color-surface-container-high)' }} />

                              <div style={{ position: 'relative', fontSize: '11px' }}>
                                <div style={{ position: 'absolute', left: '-18px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }} />
                                <p className="label-sm font-bold" style={{ margin: 0, fontSize: '11px' }}>Ticket Submitted</p>
                                <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>Logged by citizen {rep.reporter} in {rep.ward}</p>
                              </div>

                              <div style={{ position: 'relative', fontSize: '11px' }}>
                                <div style={{ position: 'absolute', left: '-18px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rep.assignee !== 'Unassigned' ? 'var(--color-primary)' : 'var(--color-outline)' }} />
                                <p className="label-sm font-bold" style={{ margin: 0, fontSize: '11px' }}>Crew Dispatched</p>
                                <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>
                                  {rep.assignee !== 'Unassigned' ? `Assigned engineer: ${rep.assignee}` : 'Pending crew allocation'}
                                </p>
                              </div>

                              <div style={{ position: 'relative', fontSize: '11px' }}>
                                <div style={{ position: 'absolute', left: '-18px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rep.status === 'Resolved' ? 'var(--color-secondary)' : 'var(--color-outline)' }} />
                                <p className="label-sm font-bold" style={{ margin: 0, fontSize: '11px' }}>Resolution Completed</p>
                                <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>
                                  {rep.status === 'Resolved' ? `Marked resolved by assignee` : 'In progress toward resolution'}
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    
                    /* Empty State: Workload Dashboard */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                      <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                          <FaFileAlt style={{ fontSize: '28px' }} />
                        </div>
                        <h3 className="headline-sm">Municipal Control Center</h3>
                        <p className="body-sm" style={{ color: 'var(--color-outline)', marginTop: '4px', maxWidth: '320px', margin: '4px auto 0 auto' }}>
                          Select a ticket from the feed to view dispatch history, update resolution states, and allocate municipal field crews.
                        </p>
                      </div>

                      {/* Workload Stats Bento */}
                      <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '20px' }}>
                        <h4 className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Ward Health Summary</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div style={{ padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>Dispatcher Backlog</p>
                            <p className="headline-sm" style={{ fontWeight: 800, marginTop: '4px', margin: 0 }}>
                              {reports.filter(r => r.status === 'Pending').length} Pending
                            </p>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(186,26,26,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${(reports.filter(r => r.status === 'Pending').length / (reports.length || 1)) * 100}%`, height: '100%', background: 'var(--color-error)' }} />
                            </div>
                          </div>

                          <div style={{ padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>Active Operations</p>
                            <p className="headline-sm" style={{ fontWeight: 800, marginTop: '4px', color: 'var(--color-primary)', margin: 0 }}>
                              {reports.filter(r => r.status === 'In Progress').length} In Progress
                            </p>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(53,37,205,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${(reports.filter(r => r.status === 'In Progress').length / (reports.length || 1)) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
                            </div>
                          </div>

                          <div style={{ padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)', gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>Municipal Resolution Index</p>
                              <span style={{ fontWeight: 700, color: 'var(--color-secondary)', fontSize: '13px' }}>
                                {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'Resolved').length / reports.length) * 100) : 0}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(0,108,73,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${reports.length > 0 ? (reports.filter(r => r.status === 'Resolved').length / reports.length) * 100 : 0}%`, height: '100%', background: 'var(--color-secondary)' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Crew Capacity Grid */}
                      <div style={{ background: 'rgba(53,37,205,0.03)', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                        <p className="label-sm font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px', marginTop: 0 }}>FIELD OPERATIONS CAPACITY</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {engineers.map((eng, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                              <span style={{ fontWeight: 600 }}>👷‍♂️ {eng.name} ({eng.dept})</span>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: eng.activeJobs >= 2 ? 'var(--color-tertiary)' : 'var(--color-secondary)' }}>
                                {eng.activeJobs} jobs active
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* Styles for pulsating neon dots */}
              <style>{`
                @keyframes pulse-neon {
                  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(186, 26, 26, 0.4); }
                  50% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 8px 2px rgba(186, 26, 26, 0.8); }
                }
                @keyframes pulse-neon-blue {
                  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(53, 37, 205, 0.4); }
                  50% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 8px 2px rgba(53, 37, 205, 0.8); }
                }
              `}</style>

            </div>
          )}

          {/* --- ENGINEERS DIRECTORY --- */}
          {activeTab === 'Engineers' && (
            <div className="col-span-4 stagger-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              
              {/* Left Column: Add/Edit Engineer Form */}
              <div className="awwwards-bento-card" style={{ padding: 'var(--space-xl)', background: 'var(--color-surface-container-lowest)' }}>
                <h3 className="headline-sm" style={{ color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                  {editingEngineerId ? 'Update Field Crew' : 'Register Field Crew'}
                </h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '20px' }}>
                  {editingEngineerId 
                    ? 'Modify the crew member details, passwords, and portal access authorization.' 
                    : 'Register new municipal engineers to assign infrastructure reports.'}
                </p>

                {addSuccess && (
                  <div style={{ padding: '10px 14px', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                    {addSuccess}
                  </div>
                )}
                {addError && (
                  <div style={{ padding: '10px 14px', background: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                    {addError}
                  </div>
                )}

                <form onSubmit={handleAddEngineer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Rajesh Kumar"
                      value={newEngName}
                      onChange={e => setNewEngName(e.target.value)}
                      style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Department</label>
                    <select
                      className="input-field"
                      value={newEngDept}
                      onChange={e => setNewEngDept(e.target.value)}
                      style={{ minHeight: '38px', fontSize: '13px', padding: '0 12px', background: 'var(--color-surface-container-lowest)' }}
                    >
                      <option value="Roads Dept">Roads & Transport</option>
                      <option value="Water Dept">Water & Sanitation</option>
                      <option value="Electrical Dept">Electricity & Power</option>
                      <option value="Sanitation Crew">Sanitation Crew</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Mobile Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+91 98765 43210"
                      value={newEngMobile}
                      onChange={e => setNewEngMobile(e.target.value)}
                      style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="rajesh.k@kozhikode.gov.in"
                      value={newEngEmail}
                      onChange={e => setNewEngEmail(e.target.value)}
                      style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Portal Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showNewEngPassword ? 'text' : 'password'}
                        className="input-field"
                        placeholder="••••••••"
                        value={newEngPassword}
                        onChange={e => setNewEngPassword(e.target.value)}
                        style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)', width: '100%', paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewEngPassword(!showNewEngPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-outline)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px'
                        }}
                      >
                        {showNewEngPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {editingEngineerId && (
                    <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className="label-sm font-semibold" style={{ fontSize: '11px', color: 'var(--color-outline)' }}>PORTAL STATUS CONTROL</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAccess(editingEngineerId)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? 'rgba(0, 108, 73, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                            color: engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? 'var(--color-secondary)' : 'var(--color-error)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? '🟢 Portal Access: Active' : '🔴 Portal Access: Revoked'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-glow"
                      style={{ flex: 1, borderRadius: 'var(--radius-full)', minHeight: '40px', fontSize: '13px' }}
                    >
                      {editingEngineerId ? 'Save Changes' : 'Add Engineer Profile'}
                    </button>
                    {editingEngineerId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEngineerId(null);
                          setNewEngName('');
                          setNewEngDept('Roads Dept');
                          setNewEngMobile('');
                          setNewEngEmail('');
                          setNewEngPassword('');
                          setShowNewEngPassword(false);
                        }}
                        className="btn btn-outline"
                        style={{ flex: 1, borderRadius: 'var(--radius-full)', minHeight: '40px', fontSize: '13px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Engineers List */}
              <div className="awwwards-bento-card" style={{ padding: 'var(--space-xl)', background: 'var(--color-surface-container-lowest)' }}>
                <h3 className="headline-sm" style={{ marginBottom: '8px' }}>Field Engineers Directory</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '20px' }}>
                  Manage crew credentials, monitor workload capacities, and authorize portal access. Click on any profile to update credentials or manage access.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {engineers.map((eng, idx) => {
                    const emailLink = `mailto:${eng.email}`;
                    const telLink = `tel:${eng.mobile}`;
                    const isSelected = editingEngineerId === eng.id;
                    const matchedEngObj = engineersList.find(e => e.id === eng.id);
                    const originalHasAccess = matchedEngObj ? matchedEngObj.hasAccess : eng.hasAccess;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          const matched = engineersList.find(e => e.id === eng.id);
                          if (matched) handleSelectEngineer(matched);
                        }}
                        className="bento-card" 
                        style={{ 
                          padding: '16px', 
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                          backgroundColor: isSelected ? 'rgba(53, 37, 205, 0.04)' : 'transparent',
                          cursor: 'pointer',
                          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                          boxShadow: isSelected ? 'var(--shadow-layer-2)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary)' }}>
                            {eng.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="label-lg" style={{ fontWeight: 700, margin: 0 }}>{eng.name}</h4>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0, fontSize: '11px' }}>{eng.dept}</p>
                          </div>
                        </div>

                        {/* Contact details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '12px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '8px' }}>
                          <span>📞 <span style={{ color: 'inherit', textDecoration: 'none' }}>{eng.mobile}</span></span>
                          <span>✉️ <span style={{ color: 'inherit', textDecoration: 'none' }}>{eng.email}</span></span>
                        </div>

                        {/* Workload and Access Control Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', marginTop: '4px' }}>
                          <span className="label-sm" style={{ fontSize: '11px' }}>Active: <strong>{eng.activeJobs} jobs</strong></span>
                          
                          {/* Access Control button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent selecting for edit when toggling access only
                              handleToggleAccess(eng.id);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: originalHasAccess ? 'var(--color-secondary-container)' : 'var(--color-error-container)',
                              color: originalHasAccess ? 'var(--color-on-secondary-container)' : 'var(--color-on-error-container)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {originalHasAccess ? 'Access Active' : 'Access Revoked'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>
          )}

          {/* --- ANALYTICS TAB --- */}
          {activeTab === 'Analytics' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h2 className="headline-md" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', lineHeight: '1.6' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>Visualizing resolution trends for</span>
                  <select value={analyticsDept} onChange={(e) => setAnalyticsDept(e.target.value)} style={{ padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}>
                    <option value="All Departments">all departments</option>
                    <option value="Roads">roads & transport</option>
                    <option value="Water">water & sanitation</option>
                    <option value="Electricity">electricity</option>
                  </select>
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>in year</span>
                  <select value={analyticsYear} onChange={(e) => setAnalyticsYear(e.target.value)} style={{ padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </h2>
              </div>

              {/* Main Bar Chart */}
              <div className="bento-card" style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--color-surface-container-lowest)', position: 'relative' }}>
                <div style={{ position: 'relative', height: '320px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', borderBottom: '2px solid var(--color-outline-variant)' }}>
                    {[100, 75, 50, 25, 0].map((line, idx) => (
                      <div key={`grid-${idx}`} style={{ width: '100%', height: '1px', borderTop: '1px dashed var(--color-outline-variant)', position: 'relative' }}>
                        <span className="label-sm" style={{ position: 'absolute', left: '-30px', top: '-10px', color: 'var(--color-outline)' }}>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bars */}
                  {chartData.map((val, i) => (
                    <div key={i} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                      <span className="label-sm" style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '4px' }}>{val}</span>
                      <div style={{ width: '70%', background: 'linear-gradient(to top, var(--color-primary-container), var(--color-primary))', height: `${(val / maxChartValue) * 100}%`, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}></div>
                    </div>
                  ))}
                </div>

                {/* X labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', color: 'var(--color-outline)' }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                    <span key={idx} className="label-sm" style={{ width: '100%', textAlign: 'center' }}>{m}</span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
