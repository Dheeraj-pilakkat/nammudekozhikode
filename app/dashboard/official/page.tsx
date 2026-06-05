"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHome, FaFileAlt, FaHardHat, FaCog, FaBell, FaSearch, FaCheckCircle, FaExclamationTriangle, FaClock, FaUserCircle, FaFilter, FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight, FaTrash, FaCheck, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

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
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
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
    return matchStatus && matchCategory;
  });

  const engineers = [
    { name: 'Ramesh K.', dept: 'Roads Dept', activeJobs: reports.filter(r => r.assignee === 'Ramesh K.' && r.status !== 'Resolved').length, status: 'On Duty' },
    { name: 'Sunil V.', dept: 'Electrical Dept', activeJobs: reports.filter(r => r.assignee === 'Sunil V.' && r.status !== 'Resolved').length, status: 'On Duty' },
    { name: 'Priya M.', dept: 'Water Dept', activeJobs: reports.filter(r => r.assignee === 'Priya M.' && r.status !== 'Resolved').length, status: 'Available' },
    { name: 'Team Alpha', dept: 'Sanitation', activeJobs: reports.filter(r => r.assignee === 'Team Alpha' && r.status !== 'Resolved').length, status: 'Busy' },
  ];

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
        maxWidth: '1400px', 
        margin: '0 auto', 
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
        <main className="awwwards-bento-grid" style={{ padding: '0' }}>
          
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: '12px' }}>
                <h2 className="headline-md">Interactive Ticket Dispatcher</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="input-field" style={{ minHeight: '36px', width: 'auto' }} value={reportStatus} onChange={e => setReportStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <select className="input-field" style={{ minHeight: '36px', width: 'auto' }} value={reportCategory} onChange={e => setReportCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Roads">Roads</option>
                    <option value="Water">Water</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                
                {/* Left side: List of reports */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
                  {filteredReports.map(report => (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-default)',
                        border: selectedReportId === report.id ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                        backgroundColor: selectedReportId === report.id ? 'var(--color-primary-container)' : 'var(--color-surface-container-low)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="label-sm font-bold" style={{ color: 'var(--color-primary)' }}>{report.id}</span>
                        <span className={`chip ${report.status === 'Resolved' ? 'chip-resolved' : report.status === 'In Progress' ? 'chip-pending' : ''}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {report.status}
                        </span>
                      </div>
                      <h4 className="label-lg" style={{ marginTop: '8px', color: 'var(--color-on-surface)' }}>{report.title}</h4>
                      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginTop: '8px', color: 'var(--color-outline)' }} className="label-sm">
                        <span>Ward: <strong>{report.ward}</strong></span>
                        <span>Assignee: {report.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right side: Selected report details & actions */}
                <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '20px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                  {selectedReportId ? (
                    (() => {
                      const rep = reports.find(r => r.id === selectedReportId);
                      if (!rep) return <p className="label-md">Select a ticket to dispatch.</p>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <span className="label-sm font-bold" style={{ color: 'var(--color-primary)' }}>TICKET DETAILS</span>
                            <h3 className="headline-sm" style={{ marginTop: '4px' }}>{rep.title} (ID: {rep.id})</h3>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px' }}>
                              Reported by {rep.reporter} in <strong>{rep.ward}</strong> on {rep.date}
                            </p>
                          </div>
                          
                          <div>
                            <span className="label-sm font-semibold" style={{ color: 'var(--color-outline)' }}>Description:</span>
                            <p className="body-sm" style={{ marginTop: '4px', lineHeight: 1.6, color: 'var(--color-on-surface-variant)' }}>
                              {rep.description}
                            </p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                            <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Update Status</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {(['Pending', 'In Progress', 'Resolved'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateReport(rep.id, st, rep.assignee)}
                                  style={{
                                    flex: 1, minHeight: '36px', fontSize: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                                    background: rep.status === st ? 'var(--color-primary)' : 'transparent',
                                    color: rep.status === st ? '#fff' : 'var(--color-on-surface-variant)',
                                    fontWeight: 700, transition: 'all 0.2s ease'
                                  }}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Assign Field Engineer / Worker</label>
                            <select 
                              className="input-field" 
                              style={{ minHeight: '40px' }} 
                              value={rep.assignee} 
                              onChange={e => handleUpdateReport(rep.id, rep.status, e.target.value)}
                            >
                              <option value="Unassigned">Select Worker</option>
                              <option value="Ramesh K.">Ramesh K. (Roads Team)</option>
                              <option value="Sunil V.">Sunil V. (Electrical Team)</option>
                              <option value="Priya M.">Priya M. (Water Team)</option>
                              <option value="Team Alpha">Team Alpha (Sanitation Crew)</option>
                            </select>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', textAlign: 'center', padding: '40px 0' }}>
                      <p className="body-md">Select a ticket from the left panel to update status and assign corporate field teams.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* --- ENGINEERS DIRECTORY --- */}
          {activeTab === 'Engineers' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)' }}>
              <h2 className="headline-lg" style={{ marginBottom: 'var(--space-lg)' }}>Field Engineers Directory</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {engineers.map((eng, idx) => (
                  <div key={idx} className="bento-card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaHardHat style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)' }} />
                      </div>
                      <div>
                        <h3 className="headline-sm">{eng.name}</h3>
                        <p className="label-sm" style={{ color: 'var(--color-outline)' }}>{eng.dept}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--space-md)' }}>
                      <p className="label-sm">Active Assignments: <strong>{eng.activeJobs}</strong></p>
                      <span className={`chip ${eng.status === 'Available' ? 'chip-resolved' : 'chip-pending'}`} style={{ fontSize: '11px' }}>
                        {eng.status}
                      </span>
                    </div>
                  </div>
                ))}
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
