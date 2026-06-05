"use client";

import React, { useState, useEffect } from 'react';
import { FaHome, FaFileAlt, FaHardHat, FaCog, FaBell, FaSearch, FaCheckCircle, FaExclamationTriangle, FaClock, FaUserCircle, FaFilter, FaPlus, FaChevronDown, FaBars, FaChevronLeft, FaChevronRight, FaTrash, FaCheck, FaChartBar } from 'react-icons/fa';

export default function DashboardPage() {
  // --- State declarations (must be before useEffect hooks) ---
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Vanilla JS Interactions (Awwwards Polish) ---
  useEffect(() => {
    // 1. Intersection Observer (Staggered Fade Up)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stagger-fade-up').forEach(el => observer.observe(el));

    // 2. Scroll Progress
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        progressBar.style.width = scrolled + '%';
      }
    };
    window.addEventListener('scroll', onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []); // Run once on mount

  // Re-run observer every time activeTab changes
  useEffect(() => {
    // Small delay to let React render the new tab content into the DOM
    const timer = setTimeout(() => {
      // Re-observe all stagger-fade-up elements (new ones start hidden)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.stagger-fade-up').forEach(el => {
        // Reset so animation replays on each tab switch
        el.removeAttribute('data-revealed');
        observer.observe(el);
      });

      return () => {
        observer.disconnect();
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab]); // Re-run whenever tab changes



  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'New high priority report:', boldText: 'Water Main Burst', suffix: 'in Ward 12.', time: '2 mins ago', read: false },
    { id: 2, type: 'success', title: 'Ramesh K. marked', boldText: '#REP-2040', suffix: 'as Resolved.', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Weekly resolution report is ready to download.', boldText: '', suffix: '', time: '1 day ago', read: true }
  ]);

  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const deleteAllNotifications = () => setNotifications([]);
  const markAsRead = (id: number) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));
  
  // Analytics Filters
  const [analyticsDept, setAnalyticsDept] = useState('All Departments');
  const [analyticsYear, setAnalyticsYear] = useState('2026');
  const [analyticsMonth, setAnalyticsMonth] = useState('All Months');

  // Reports Filters
  const [reportStatus, setReportStatus] = useState('All');
  const [reportCategory, setReportCategory] = useState('All');

  const recentReports = [
    { id: '#REP-2041', title: 'Pothole on Beach Road', category: 'Roads', status: 'In Progress', date: 'Oct 24, 2026', assignee: 'Ramesh K.' },
    { id: '#REP-2040', title: 'Broken Streetlight', category: 'Electricity', status: 'Resolved', date: 'Oct 23, 2026', assignee: 'Sunil V.' },
    { id: '#REP-2039', title: 'Water Pipe Leak', category: 'Water', status: 'Pending', date: 'Oct 23, 2026', assignee: 'Unassigned' },
    { id: '#REP-2038', title: 'Fallen Tree Branch', category: 'Sanitation', status: 'Resolved', date: 'Oct 21, 2026', assignee: 'Team Alpha' },
    { id: '#REP-2037', title: 'Damaged Pavement', category: 'Roads', status: 'In Progress', date: 'Oct 20, 2026', assignee: 'Ramesh K.' },
  ];

  // Dummy expanded data for reports tab
  const extendedReports = [
    ...recentReports,
    { id: '#REP-2036', title: 'Clogged Drain', category: 'Sanitation', status: 'Pending', date: 'Oct 19, 2026', assignee: 'Unassigned' },
    { id: '#REP-2035', title: 'Traffic Signal Failure', category: 'Electricity', status: 'Resolved', date: 'Oct 18, 2026', assignee: 'Sunil V.' },
    { id: '#REP-2034', title: 'Pothole on MG Road', category: 'Roads', status: 'Resolved', date: 'Oct 17, 2026', assignee: 'Ramesh K.' },
    { id: '#REP-2033', title: 'Pipe Burst', category: 'Water', status: 'In Progress', date: 'Oct 16, 2026', assignee: 'Priya M.' },
    { id: '#REP-2032', title: 'Garbage Dump Issue', category: 'Sanitation', status: 'Pending', date: 'Oct 15, 2026', assignee: 'Team Alpha' },
  ];

  // Filter logic for Reports tab
  const filteredReports = extendedReports.filter(report => {
    const matchStatus = reportStatus === 'All' || report.status === reportStatus;
    const matchCategory = reportCategory === 'All' || report.category === reportCategory;
    return matchStatus && matchCategory;
  });

  const engineers = [
    { name: 'Ramesh K.', dept: 'Roads Dept', activeJobs: 3, status: 'On Duty' },
    { name: 'Sunil V.', dept: 'Electrical Dept', activeJobs: 1, status: 'On Duty' },
    { name: 'Priya M.', dept: 'Water Dept', activeJobs: 0, status: 'Available' },
    { name: 'Team Alpha', dept: 'Sanitation', activeJobs: 5, status: 'Busy' },
  ];

  // Dummy data generators for Analytics
  const getChartData = () => {
    let data = [40, 65, 30, 80, 55, 90, 70, 85, 100, 60, 45, 75]; // Default
    if (analyticsDept === 'Roads') data = [20, 35, 10, 40, 25, 45, 30, 40, 50, 20, 15, 35];
    if (analyticsDept === 'Water') data = [10, 15, 5, 20, 10, 25, 15, 20, 25, 15, 10, 20];
    if (analyticsYear === '2025') data = [30, 50, 40, 70, 45, 80, 60, 95, 85, 50, 35, 60];

    if (analyticsMonth !== 'All Months') {
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(analyticsMonth);
      if (monthIndex !== -1) {
        const newData = new Array(12).fill(0);
        newData[monthIndex] = data[monthIndex];
        return newData;
      }
    }
    return data;
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData, 100);

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
                <h3 className="label-lg">Ward 12 Admin</h3>
                <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Official Portal</p>
              </div>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {['Overview', 'Reports', 'Engineers', 'Analytics', 'Settings'].map(tab => (
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
                {tab === 'Reports' && <FaFileAlt style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Engineers' && <FaHardHat style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Analytics' && <FaChartBar />}
                {tab === 'Settings' && <FaCog style={{ fontSize: '20px', minWidth: '20px' }} />}
                {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{tab}</span>}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {isSidebarOpen && (
              <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}>
                <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-xs)' }}>Need Help?</p>
                <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }} className="label-sm">Contact IT Support</a>
              </div>
            )}
            
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

        {/* Main Content Area - Awwwards Bento Grid */}
        <main className="awwwards-bento-grid" style={{ padding: '0' }}>
          
          {/* Top Header - Hero Block */}
          <header id="Overview" className="awwwards-bento-card col-span-4 stagger-fade-up glass-lite" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)', position: 'relative' }}>
            <h1 className="display-lg" style={{ transition: 'all 0.3s ease' }}>Nammude Kozhikode</h1>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
                  <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} className="input-field" style={{ paddingLeft: '40px', minHeight: '40px', width: '250px' }} />
                </div>
              </div>
              
              {/* Notifications Dropdown Wrapper */}
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

                {/* Dropdown Menu */}
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
                            position: 'relative',
                            transition: 'background-color 0.2s'
                          }} className="group">
                            {n.type === 'alert' && <FaExclamationTriangle style={{ color: 'var(--color-tertiary)', marginTop: '4px', minWidth: '16px' }} />}
                            {n.type === 'success' && <FaCheckCircle style={{ color: 'var(--color-secondary)', marginTop: '4px', minWidth: '16px' }} />}
                            {n.type === 'info' && <FaClock style={{ color: 'var(--color-primary)', marginTop: '4px', minWidth: '16px' }} />}
                            <div style={{ flex: 1, paddingRight: '70px' }}>
                              <p className="body-sm" style={{ fontWeight: n.read ? 400 : 600, color: 'var(--color-on-surface)' }}>
                                {n.title} {n.boldText && <strong>{n.boldText}</strong>} {n.suffix}
                              </p>
                              <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px' }}>{n.time}</p>
                            </div>
                            
                            {/* Actions (always visible) */}
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

          {/* --- OVERVIEW: Stats + Recent Reports --- */}
          {activeTab === 'Overview' && (
            <>
              <div className="awwwards-bento-card col-span-1 row-span-1 stagger-fade-up" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Total Open Issues</p>
                  <FaExclamationTriangle style={{ color: 'var(--color-tertiary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>42</p>
                <p className="label-sm" style={{ color: 'var(--color-error)', marginTop: 'var(--space-xs)' }}>↑ 12% from last week</p>
              </div>
              
              <div className="awwwards-bento-card col-span-1 row-span-1 stagger-fade-up delay-100" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Resolved This Month</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>142</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>↑ 5% from last month</p>
              </div>

              <div className="awwwards-bento-card col-span-1 row-span-1 stagger-fade-up delay-200" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Avg Resolution Time</p>
                  <FaClock style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>2.4d</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>↓ 0.3d improvement</p>
              </div>

              <div className="awwwards-bento-card col-span-1 row-span-1 stagger-fade-up delay-300" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-primary-container)' }}>Active Engineers</p>
                  <FaHardHat style={{ color: 'var(--color-secondary-container)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>34</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary-container)', marginTop: 'var(--space-xs)' }}>9 on active duty</p>
              </div>

              <div className="awwwards-bento-card col-span-4 row-span-2 stagger-fade-up" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid rgba(199, 196, 216, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-container-low)' }}>
                  <h2 className="headline-sm">Recent Citizen Reports</h2>
                  <button className="btn btn-outline btn-shimmer" style={{ minHeight: '36px', padding: '0 var(--space-md)' }} onClick={() => setActiveTab('Reports')}>View All</button>
                </div>
                <div style={{ padding: 'var(--space-md)' }}>
                  <ReportsTable reports={recentReports} />
                </div>
              </div>
            </>
          )}
          {/* --- REPORTS TAB --- */}
          {activeTab === 'Reports' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
              <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-container-low)' }}>
                
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                  <FaFilter style={{ color: 'var(--color-primary)' }} />
                  
                  {/* Working Status Filter */}
                  <select 
                    className="input-field" 
                    style={{ minHeight: '36px', padding: '0 var(--space-lg) 0 var(--space-md)', width: 'auto', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }} 
                    value={reportStatus} 
                    onChange={e => setReportStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  {/* Working Category Filter */}
                  <select 
                    className="input-field" 
                    style={{ minHeight: '36px', padding: '0 var(--space-lg) 0 var(--space-md)', width: 'auto', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }} 
                    value={reportCategory} 
                    onChange={e => setReportCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Roads">Roads</option>
                    <option value="Water">Water</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                  
                  <button className="btn btn-outline" style={{ minHeight: '36px' }}>Export CSV</button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <span className="chip chip-pending" style={{ cursor: 'pointer' }} onClick={() => setReportStatus('Pending')}>
                    Open ({extendedReports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length})
                  </span>
                  <span className="chip chip-resolved" style={{ cursor: 'pointer' }} onClick={() => setReportStatus('Resolved')}>
                    Resolved ({extendedReports.filter(r => r.status === 'Resolved').length})
                  </span>
                </div>

              </div>
              
              {/* Conditional Rendering for Empty States */}
              {filteredReports.length > 0 ? (
                <ReportsTable reports={filteredReports} />
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xxl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                  <p className="body-lg">No reports match your current filters.</p>
                  <button className="btn btn-outline" style={{ marginTop: 'var(--space-md)' }} onClick={() => { setReportStatus('All'); setReportCategory('All'); }}>Clear Filters</button>
                </div>
              )}
              
            </div>
          )}

          {/* --- ENGINEERS TAB --- */}
          {activeTab === 'Engineers' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)' }}>
            <h2 className="headline-lg" style={{ marginBottom: 'var(--space-lg)' }}>Engineers on Duty</h2>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
                <button className="btn btn-primary" style={{ display: 'flex', gap: 'var(--space-xs)' }}><FaPlus /> Add Engineer</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {engineers.map((eng, idx) => (
                  <div key={idx} className="bento-card interactive-card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaHardHat style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)' }} />
                        </div>
                        <div>
                          <h3 className="headline-sm">{eng.name}</h3>
                          <p className="label-sm" style={{ color: 'var(--color-outline)' }}>{eng.dept}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--space-md)' }}>
                      <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Active Jobs: <strong>{eng.activeJobs}</strong></p>
                      <span className={`chip ${eng.status === 'Available' ? 'chip-resolved' : eng.status === 'On Duty' ? 'chip-pending' : ''}`} style={{ fontSize: '11px' }}>
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
              
              {/* Inline Natural Language Filter */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h2 className="headline-md" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', lineHeight: '1.6' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>Visualizing resolution trends for</span>
                  
                  {/* Department Filter Inline */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select 
                      style={{ 
                        appearance: 'none', 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-outline-variant)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '6px 32px 6px 16px', 
                        fontSize: '18px', 
                        cursor: 'pointer',
                        color: 'var(--color-on-surface)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        boxShadow: 'var(--shadow-layer-1)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      value={analyticsDept}
                      onChange={(e) => setAnalyticsDept(e.target.value)}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                    >
                      <option value="All Departments">all departments</option>
                      <option value="Roads">roads & transport</option>
                      <option value="Water">water & sanitation</option>
                      <option value="Electricity">electricity</option>
                    </select>
                    <FaChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: 'var(--color-on-surface-variant)' }} />
                  </div>
                  
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>during</span>
                  
                  {/* Month Filter Inline */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select 
                      style={{ 
                        appearance: 'none', 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-outline-variant)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '6px 32px 6px 16px', 
                        fontSize: '18px', 
                        cursor: 'pointer',
                        color: 'var(--color-on-surface)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        boxShadow: 'var(--shadow-layer-1)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      value={analyticsMonth}
                      onChange={(e) => setAnalyticsMonth(e.target.value)}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                    >
                      <option value="All Months">all months</option>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                        <option key={m} value={m}>{m.toLowerCase()}</option>
                      ))}
                    </select>
                    <FaChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: 'var(--color-on-surface-variant)' }} />
                  </div>
                  
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>in</span>
                  
                  {/* Year Filter Inline */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select 
                      style={{ 
                        appearance: 'none', 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-outline-variant)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '6px 32px 6px 16px', 
                        fontSize: '18px', 
                        cursor: 'pointer',
                        color: 'var(--color-on-surface)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        boxShadow: 'var(--shadow-layer-1)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      value={analyticsYear}
                      onChange={(e) => setAnalyticsYear(e.target.value)}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                    <FaChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: 'var(--color-on-surface-variant)' }} />
                  </div>
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>.</span>
                </h2>
              </div>

              {/* Main Bar Chart */}
              <div className="bento-card" style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--color-surface-container-lowest)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '350px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 'var(--space-md) 0 0 0', gap: 'var(--space-sm)' }}>
                  
                  {/* Background Grid Lines */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none', borderBottom: '2px solid var(--color-outline-variant)' }}>
                    {[100, 75, 50, 25, 0].map((line, idx) => (
                      <div key={`grid-${idx}`} style={{ width: '100%', height: '1px', borderTop: '1px dashed var(--color-outline-variant)', position: 'relative' }}>
                        <span className="label-sm" style={{ position: 'absolute', left: '-30px', top: '-10px', color: 'var(--color-outline)' }}>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Animated Bars */}
                  {chartData.map((val, i) => (
                    <div key={`${analyticsDept}-${analyticsYear}-${analyticsMonth}-${i}`} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1, position: 'relative' }} className="chart-bar-container">
                      
                      {/* Tooltip on Hover */}
                      <div style={{ 
                        opacity: val > 0 ? 1 : 0,
                        backgroundColor: 'var(--color-surface-container-high)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        boxShadow: 'var(--shadow-layer-1)',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="label-sm" style={{ color: 'var(--color-on-surface)' }}>{val}</span>
                      </div>
                      
                      {/* The Bar with Gradient */}
                      <div 
                        className={`animate-grow delay-${(i % 4) * 100}`} 
                        style={{ 
                          width: '80%', 
                          background: 'linear-gradient(to top, var(--color-primary-container), var(--color-primary))', 
                          height: `${(val / maxChartValue) * 100}%`, 
                          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', 
                          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                          transition: 'filter 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                        onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* X-Axis Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', padding: '0 10px', color: 'var(--color-on-surface-variant)' }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                    <span key={idx} className="label-sm" style={{ width: '100%', textAlign: 'center', fontWeight: analyticsMonth === m ? 700 : 400, color: analyticsMonth === m ? 'var(--color-primary)' : 'inherit' }}>{m}</span>
                  ))}
                </div>
              </div>
              
              {/* Secondary Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="bento-card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                  <h3 className="headline-sm" style={{ marginBottom: 'var(--space-xl)' }}>Distribution by Category</h3>
                  <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ 
                      position: 'absolute', inset: 0, 
                      borderRadius: '50%', 
                      background: 'conic-gradient(var(--color-primary) 0% 40%, var(--color-secondary) 40% 70%, var(--color-tertiary) 70% 100%)', 
                      boxShadow: 'var(--shadow-layer-2)',
                      transition: 'transform 0.5s ease',
                    }} className="hover:scale-105"></div>
                    <div style={{
                      position: 'absolute', inset: '40px',
                      backgroundColor: 'var(--color-surface-container-lowest)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                      <span className="headline-md" style={{ color: 'var(--color-primary)' }}>100%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center', padding: 'var(--space-sm) var(--space-md)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></div> <span className="label-sm font-semibold">Roads (40%)</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-secondary)', borderRadius: '50%' }}></div> <span className="label-sm font-semibold">Water (30%)</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-tertiary)', borderRadius: '50%' }}></div> <span className="label-sm font-semibold">Electricity (30%)</span></div>
                  </div>
                </div>

                <div className="bento-card" style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                  <h3 className="headline-sm" style={{ marginBottom: 'var(--space-lg)' }}>Top Reporting Wards</h3>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {[
                      { ward: 'Ward 12', count: 42, color: 'var(--color-primary)' },
                      { ward: 'Ward 4', count: 38, color: 'var(--color-secondary)' },
                      { ward: 'Ward 18', count: 25, color: 'var(--color-tertiary)' },
                      { ward: 'Ward 9', count: 14, color: 'var(--color-outline)' },
                    ].map((w, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span className="label-md font-semibold" style={{ width: '70px', color: 'var(--color-on-surface)' }}>{w.ward}</span>
                        <div style={{ flex: 1, backgroundColor: 'var(--color-surface-container)', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div className="animate-grow" style={{ 
                            transformOrigin: 'left', 
                            width: `${(w.count / 42) * 100}%`, 
                            background: `linear-gradient(90deg, ${w.color}, ${w.color}dd)`, 
                            height: '100%', 
                            borderRadius: 'var(--radius-full)' 
                          }}></div>
                        </div>
                        <span className="label-md font-bold" style={{ width: '30px', textAlign: 'right' }}>{w.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'Settings' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)' }}>
              <h2 className="headline-md" style={{ marginBottom: 'var(--space-lg)' }}>Profile Settings</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: '500px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" defaultValue="Ward 12 Admin" />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" defaultValue="admin.ward12@kozhikode.gov" />
                </div>

                <div className="input-group">
                  <label className="input-label">Notification Preferences</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Email alerts for critical issues
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> SMS alerts for engineer assignments
                  </label>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)', alignSelf: 'flex-start' }}>Save Changes</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Reusable Table Component for Overview and Reports Tab
function ReportsTable({ reports }: { reports: any[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            <th style={{ padding: 'var(--space-sm) var(--space-lg)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">ID</th>
            <th style={{ padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">Title</th>
            <th style={{ padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">Category</th>
            <th style={{ padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">Status</th>
            <th style={{ padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">Date</th>
            <th style={{ padding: 'var(--space-sm) var(--space-lg)', fontWeight: 600, color: 'var(--color-on-surface-variant)' }} className="label-sm">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, i) => (
            <tr key={`${report.id}-${i}`} style={{ borderTop: '1px solid var(--color-outline-variant)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-container-lowest)', transition: 'background-color 0.2s', cursor: 'pointer' }} className="hover:bg-[var(--color-surface-container-low)]">
              <td style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 600 }} className="body-sm">{report.id}</td>
              <td style={{ padding: 'var(--space-md)' }} className="body-sm">{report.title}</td>
              <td style={{ padding: 'var(--space-md)' }}>
                <span className="chip" style={{ backgroundColor: 'var(--color-surface-container-high)', fontSize: '11px', padding: '4px 8px' }}>{report.category}</span>
              </td>
              <td style={{ padding: 'var(--space-md)' }}>
                <span className={`chip ${report.status === 'Resolved' ? 'chip-resolved' : report.status === 'In Progress' ? 'chip-pending' : ''}`} style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: report.status === 'Pending' ? 'var(--color-tertiary-container)' : undefined, color: report.status === 'Pending' ? 'var(--color-on-tertiary-container)' : undefined }}>
                  {report.status}
                </span>
              </td>
              <td style={{ padding: 'var(--space-md)', color: 'var(--color-on-surface-variant)' }} className="body-sm">{report.date}</td>
              <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="body-sm">{report.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
