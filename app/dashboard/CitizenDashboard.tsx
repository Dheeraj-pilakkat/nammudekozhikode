"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHome, FaFileAlt, FaExclamationTriangle, FaCheckCircle, FaUser, FaSignOutAlt, FaFileUpload, FaClock, FaCalendarAlt, FaCheck, FaChevronLeft, FaChevronRight, FaPlus, FaChartBar, FaDownload, FaFilter, FaPrint, FaDatabase, FaRoad, FaTint, FaLightbulb, FaTrash, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { db, isFirebaseEnabled } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { DEFAULT_WARDS, Ward } from '../lib/wards';

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

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Dynamic Wards state
  const [wardsList, setWardsList] = useState<Ward[]>([]);

  // Issue Reporter Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads');
  const [ward, setWard] = useState('Ward 12');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reports Tab Filters State
  const [reportSearch, setReportSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWard, setFilterWard] = useState('All');

  const defaultReports: Report[] = [];

  useEffect(() => {
    setMounted(true);
    // Auth Check
    const storedUser = localStorage.getItem('nammude_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'citizen') {
      router.push('/dashboard');
      return;
    }
    setUser(parsedUser);

    if (isFirebaseEnabled) {
      const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const fetchedReports: Report[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push(doc.data() as Report);
        });
        fetchedReports.sort((a, b) => b.id.localeCompare(a.id));
        setReports(fetchedReports);
      }, (err) => {
        console.error("Firestore reports subscription error:", err);
        const storedReports = localStorage.getItem('nammude_reports');
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        }
      });

      const unsubWards = onSnapshot(collection(db, 'wards'), async (snapshot) => {
        if (snapshot.empty) {
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

      return () => {
        unsubReports();
        unsubWards();
      };
    } else {
      // Initialize Shared Reports Database in localStorage
      const storedReports = localStorage.getItem('nammude_reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      } else {
        localStorage.setItem('nammude_reports', JSON.stringify(defaultReports));
        setReports(defaultReports);
      }

      const storedWards = localStorage.getItem('nammude_wards');
      if (storedWards) {
        setWardsList(JSON.parse(storedWards));
      } else {
        localStorage.setItem('nammude_wards', JSON.stringify(DEFAULT_WARDS));
        setWardsList(DEFAULT_WARDS);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title || !description) {
      setErrorMsg('Please fill in the title and description.');
      return;
    }

    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Report = {
      id: reportId,
      title,
      category,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      assignee: 'Unassigned',
      reporter: user?.name || 'Devi Prasad',
      ward,
      description
    };

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'reports', reportId), newReport);
        setSuccessMsg('Issue submitted successfully to municipality backend!');
      } catch (err: any) {
        console.error("Firestore submit error:", err);
        setErrorMsg(`Failed to submit: ${err.message}`);
        return;
      }
    } else {
      const updatedReports = [newReport, ...reports];
      localStorage.setItem('nammude_reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
      setSuccessMsg('Issue submitted successfully!');
    }

    // Reset Form
    setTitle('');
    setCategory('Roads');
    setWard(user?.ward || 'Ward 12');
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setSuccessMsg(`Issue logged successfully! Ticket ID: ${newReport.id}`);

    // Trigger tab change to My Reports after a short delay
    setTimeout(() => {
      setActiveTab('My Reports');
      setSuccessMsg('');
    }, 1500);
  };

  // Filter reports specifically filed by this citizen
  const citizenName = user?.name || 'Devi Prasad';
  const myReports = reports.filter(r => r.reporter === citizenName);

  // Filter reports for the Reports & Insights tab
  const filteredReports = reports.filter(r => {
    // Search match
    const searchMatch = reportSearch ? (
      r.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(reportSearch.toLowerCase())
    ) : true;
    
    // Category match
    const categoryMatch = filterCategory === 'All' ? true : r.category === filterCategory;
    
    // Status match
    const statusMatch = filterStatus === 'All' ? true : r.status === filterStatus;
    
    // Ward match
    const wardMatch = filterWard === 'All' ? true : r.ward === filterWard;
    
    return searchMatch && categoryMatch && statusMatch && wardMatch;
  });

  const totalFiltered = filteredReports.length;
  const resolvedFiltered = filteredReports.filter(r => r.status === 'Resolved').length;
  const inProgressFiltered = filteredReports.filter(r => r.status === 'In Progress').length;
  const pendingFiltered = filteredReports.filter(r => r.status === 'Pending').length;
  const resolutionRate = totalFiltered > 0 ? Math.round((resolvedFiltered / totalFiltered) * 100) : 0;

  // Category counts for visualization
  const categoryCounts = filteredReports.reduce((acc: any, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Status', 'Date', 'Reporter', 'Ward', 'Assignee', 'Description'];
    const rows = filteredReports.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.date,
      `"${r.reporter.replace(/"/g, '""')}"`,
      r.ward,
      r.assignee,
      `"${r.description.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nammude_kozhikode_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <FaUser style={{ color: 'var(--color-primary)', fontSize: '20px' }} />
            </div>
            {isSidebarOpen && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <h3 className="label-lg" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h3>
                <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Citizen Portal</p>
              </div>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {['Overview', 'My Reports', 'Report Issue', 'Reports'].map(tab => (
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
                {tab === 'My Reports' && <FaFileAlt style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Report Issue' && <FaPlus style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Reports' && <FaChartBar style={{ fontSize: '20px', minWidth: '20px' }} />}
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

        {/* Main Content Area */}
        <main className="awwwards-bento-grid" style={{ padding: '0', maxWidth: '100%', width: '100%' }}>
          
          {/* Top Header - Hero Block */}
          <header className="awwwards-bento-card col-span-4 glass-lite" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)', position: 'relative' }}>
            <div className="noise-overlay" />
            <div>
              <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Citizen Hub
              </span>
              <h1 className="display-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Welcome, {user.name}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Current Ward</p>
              <h3 className="label-lg" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{user.ward}</h3>
            </div>
          </header>

          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'Overview' && (
            <>
              {/* Stat Card 1: Total Filed */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>My Reported Issues</p>
                  <FaFileAlt style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{myReports.length}</p>
                <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: 'var(--space-xs)' }}>Active in corporation database</p>
              </div>

              {/* Stat Card 2: Resolved */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Resolved Issues</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{myReports.filter(r => r.status === 'Resolved').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary)', marginTop: 'var(--space-xs)' }}>Fixed by ward workers</p>
              </div>

              {/* Stat Card 3: Pending/In Progress */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-surface-variant)' }}>Pending Fixes</p>
                  <FaExclamationTriangle style={{ color: 'var(--color-tertiary)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700 }}>{myReports.filter(r => r.status !== 'Resolved').length}</p>
                <p className="label-sm" style={{ color: 'var(--color-tertiary)', marginTop: 'var(--space-xs)' }}>Currently being processed</p>
              </div>

              {/* Ward Stats Bento Box */}
              <div className="awwwards-bento-card col-span-1 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                <div className="noise-overlay" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className="label-lg" style={{ color: 'var(--color-on-primary-container)' }}>Ward Performance</p>
                  <FaCheckCircle style={{ color: 'var(--color-secondary-container)' }} />
                </div>
                <p className="display-md" style={{ fontWeight: 700, color: '#fff' }}>94%</p>
                <p className="label-sm" style={{ color: 'var(--color-secondary-container)', marginTop: '4px' }}>Resolution rate for {user.ward}</p>
              </div>

              {/* Quick Actions / New Report Trigger Banner */}
              <div 
                className="awwwards-bento-card col-span-2 row-span-1" 
                style={{ 
                  padding: 'var(--space-lg)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  background: 'var(--color-surface-container-low)',
                  border: '1px dashed var(--color-primary)'
                }}
              >
                <div>
                  <h3 className="headline-sm" style={{ color: 'var(--color-primary)' }}>Spot an infrastructure issue?</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    Quickly report missing streetlights, waste, or water leaks.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('Report Issue')}
                  className="btn btn-primary btn-glow btn-shimmer"
                  style={{ borderRadius: 'var(--radius-full)', alignSelf: 'flex-start', minHeight: '40px', marginTop: '12px' }}
                >
                  <FaPlus size={12} style={{ marginRight: '8px' }} />
                  Create New Ticket
                </button>
              </div>

              {/* Help & IT Support Card */}
              <div className="awwwards-bento-card col-span-2 row-span-1" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="headline-sm">Need immediate assistance?</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    Contact your ward councillor office or local civic helpline.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <a href="tel:+91495272365" className="label-sm font-semibold" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>📞 Ward Helpline</a>
                  <a href="mailto:support@kozhikode.corp" className="label-sm font-semibold" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>✉️ Corporate Support</a>
                </div>
              </div>
            </>
          )}

          {/* --- MY REPORTS TAB --- */}
          {activeTab === 'My Reports' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', minHeight: '450px' }}>
              <h2 className="headline-md" style={{ marginBottom: 'var(--space-lg)' }}>My Filed Reports</h2>
              
              {myReports.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xxl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                  <p className="body-lg">You haven't reported any issues yet.</p>
                  <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={() => setActiveTab('Report Issue')}>Report Now</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myReports.map((report) => (
                    <div 
                      key={report.id}
                      className="bento-card"
                      style={{ 
                        padding: 'var(--space-lg)', 
                        border: '1px solid var(--color-outline-variant)',
                        backgroundColor: 'var(--color-surface-container-low)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="label-md font-bold" style={{ color: 'var(--color-primary)' }}>{report.id}</span>
                            <span className="chip" style={{ backgroundColor: 'var(--color-surface-container-high)', fontSize: '11px', padding: '2px 8px' }}>{report.category}</span>
                            <span className="label-sm" style={{ color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaCalendarAlt size={11} /> {report.date}
                            </span>
                          </div>
                          <h3 className="headline-sm" style={{ marginTop: '8px' }}>{report.title}</h3>
                          <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px', lineHeight: 1.6 }}>
                            {report.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`chip ${report.status === 'Resolved' ? 'chip-resolved' : report.status === 'In Progress' ? 'chip-pending' : ''}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                            {report.status}
                          </span>
                          <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '8px' }}>
                            Assigned worker: <strong>{report.assignee}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Ticket Progress Timeline Widget */}
                      <div style={{ borderTop: '1px solid var(--color-outline-variant)', marginTop: '20px', paddingTop: '16px' }}>
                        <p className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600, marginBottom: '12px' }}>TICKET RESOLUTION STEPS</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '600px' }}>
                          {/* Timeline bar line */}
                          <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '3px', backgroundColor: 'var(--color-surface-container-high)', zIndex: 1 }}>
                            <div style={{ 
                              width: report.status === 'Resolved' ? '100%' : report.status === 'In Progress' ? '50%' : '0%', 
                              height: '100%', 
                              backgroundColor: 'var(--color-primary)', 
                              transition: 'width 0.5s ease' 
                            }} />
                          </div>

                          {/* Step 1: Submitted */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                              <FaCheck size={10} />
                            </div>
                            <span className="label-sm" style={{ marginTop: '4px', fontWeight: 600 }}>Submitted</span>
                          </div>

                          {/* Step 2: Assigned / In Progress */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ 
                              width: '30px', height: '30px', borderRadius: '50%', 
                              backgroundColor: report.status === 'In Progress' || report.status === 'Resolved' ? 'var(--color-primary)' : 'var(--color-surface-container-high)', 
                              color: report.status === 'In Progress' || report.status === 'Resolved' ? '#fff' : 'var(--color-outline)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' 
                            }}>
                              {report.status === 'Resolved' ? <FaCheck size={10} /> : '2'}
                            </div>
                            <span className="label-sm" style={{ marginTop: '4px', fontWeight: report.status === 'In Progress' ? 700 : 500, color: report.status === 'In Progress' ? 'var(--color-primary)' : 'inherit' }}>In Progress</span>
                          </div>

                          {/* Step 3: Resolved */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ 
                              width: '30px', height: '30px', borderRadius: '50%', 
                              backgroundColor: report.status === 'Resolved' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)', 
                              color: '#fff', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' 
                            }}>
                              {report.status === 'Resolved' ? <FaCheck size={10} /> : '3'}
                            </div>
                            <span className="label-sm" style={{ marginTop: '4px', fontWeight: report.status === 'Resolved' ? 700 : 500, color: report.status === 'Resolved' ? 'var(--color-secondary)' : 'inherit' }}>Resolved</span>
                          </div>

                        </div>
                      </div>

                      {report.status === 'Resolved' && report.resolutionNotes && (
                        <div 
                          style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--color-secondary-container)',
                            color: 'var(--color-on-secondary-container)',
                            borderRadius: 'var(--radius-default)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            border: '1px solid rgba(0, 108, 73, 0.15)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
                            <FaCheckCircle size={14} style={{ color: 'var(--color-on-secondary-container)' }} />
                            <span>Resolution Notes from Engineer</span>
                          </div>
                          <p className="body-sm" style={{ margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
                            {report.resolutionNotes}
                          </p>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* --- REPORT ISSUE FORM TAB --- */}
          {activeTab === 'Report Issue' && (
            <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)' }}>
              <div className="noise-overlay" />
              <div>
                <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Log a Complaint
                </span>
                <h2 className="headline-md" style={{ marginBottom: 'var(--space-xs)' }}>Report an Infrastructure Issue</h2>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                  Submit details of broken streetlights, potholes, water leaks, or sanitary issues. Your report will be routed to the appropriate ward engineer.
                </p>
              </div>

              {successMsg && (
                <div style={{ padding: '16px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCheckCircle />
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{ padding: '16px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleReportSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                
                {/* Left Form Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Issue Title */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Issue Summary / Title</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Clogged drain leading to overflow" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Interactive Category Cards Grid */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ marginBottom: '8px' }}>Category</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { id: 'Roads', label: 'Roads & Footpaths', icon: <FaRoad size={20} /> },
                        { id: 'Water', label: 'Water Leak / Supply', icon: <FaTint size={20} /> },
                        { id: 'Electricity', label: 'Streetlights & Power', icon: <FaLightbulb size={20} /> },
                        { id: 'Sanitation', label: 'Waste / Sanitation', icon: <FaTrash size={20} /> }
                      ].map(cat => {
                        const isSelected = category === cat.id;
                        return (
                          <div 
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            style={{
                              padding: '16px',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                              background: isSelected ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: isSelected ? 'var(--shadow-near)' : 'none'
                            }}
                            onMouseOver={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--color-outline)'; }}
                            onMouseOut={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--color-outline-variant)'; }}
                          >
                            <div style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-outline)' }}>
                              {cat.icon}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Detailed Description</label>
                    <textarea 
                      className="input-field" 
                      rows={4}
                      placeholder="Specify exact landmark, description, and severity level..."
                      style={{ padding: '12px 16px', minHeight: '100px', fontFamily: 'inherit' }}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Enhanced File Upload Container */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Attachment Proof (Optional)</label>
                    
                    {photoPreview ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)' }}>
                        <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: 'var(--radius-default)', overflow: 'hidden' }}>
                          <Image src={photoPreview} alt="Proof preview" fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p className="body-sm font-semibold" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{photo}</p>
                          <p className="label-sm" style={{ color: 'var(--color-outline)' }}>Image ready for upload</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setPhoto(null); setPhotoPreview(null); }} 
                          style={{ background: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={{
                          border: '2px dashed var(--color-outline-variant)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'var(--color-surface-container-low)',
                          transition: 'border-color 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 2 }}
                        />
                        <FaFileUpload style={{ fontSize: '28px', color: 'var(--color-primary)', marginBottom: '8px' }} />
                        <p className="body-sm" style={{ fontWeight: 600 }}>Click or Drag photo here to attach proof</p>
                        <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '2px' }}>PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Interactive Map Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label" style={{ margin: 0 }}>Incident Location Map Picker</label>
                    <span className="chip chip-resolved" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      Auto Warding
                    </span>
                  </div>

                  {/* Stylized Simulated Map Container */}
                  <div 
                    style={{
                      height: '280px',
                      borderRadius: 'var(--radius-lg)',
                      background: '#e0ece4',
                      border: '1px solid var(--color-outline-variant)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Simulated map background grid lines and graphics */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #c7decb 10%, transparent 11%)', backgroundSize: '20px 20px', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', top: '120px', left: '-50px', width: '300px', height: '40px', background: '#d5e6db', transform: 'rotate(-25deg)', borderRadius: '20px' }} />
                    <div style={{ position: 'absolute', top: '40px', left: '160px', width: '40px', height: '260px', background: '#d5e6db', transform: 'rotate(15deg)', borderRadius: '20px' }} />
                    <div style={{ position: 'absolute', top: '80px', left: '100px', width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', top: '210px', left: '80px', width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', top: '150px', left: '220px', width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }} />

                    {/* Interactive pins */}
                    {wardsList.map(w => {
                      const isActive = ward === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWard(w.id)}
                          style={{
                            position: 'absolute',
                            top: w.top,
                            left: w.left,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 10,
                            transform: isActive ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                          }}
                          title={`${w.id} (${w.name})`}
                        >
                          <FaMapMarkerAlt 
                            style={{ 
                              color: isActive ? 'var(--color-primary)' : 'var(--color-outline)', 
                              fontSize: '28px',
                              filter: isActive ? 'drop-shadow(0px 4px 10px rgba(53, 37, 205, 0.45))' : 'none'
                            }} 
                          />
                          {isActive && (
                            <span 
                              style={{ 
                                position: 'absolute', 
                                bottom: '-22px', 
                                whiteSpace: 'nowrap', 
                                background: 'var(--color-primary)', 
                                color: '#fff', 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                boxShadow: 'var(--shadow-near)'
                              }}
                            >
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--color-outline)', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
                      📍 Click a pin to set ward location
                    </span>
                  </div>

                  {/* Selection Display */}
                  <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                    <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>SELECTED LOCATION WARD</p>
                    <p className="body-md font-bold" style={{ margin: '4px 0 0 0', color: 'var(--color-primary)' }}>
                      {(() => {
                        const w = wardsList.find(x => x.id === ward);
                        return w ? `${w.id} (${w.name})` : ward;
                      })()}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-glow btn-shimmer"
                      style={{ borderRadius: 'var(--radius-full)', padding: '0 32px', width: '100%', minHeight: '48px' }}
                    >
                      Submit Complaint Ticket
                    </button>
                  </div>

                </div>

              </form>
            </div>
          )}

          {/* --- REPORTS TAB --- */}
          {activeTab === 'Reports' && (
            <div className="col-span-4 stagger-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              
              {/* Print-Only Header */}
              <div className="print-only" style={{ display: 'none' }}>
                <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h1 style={{ color: 'var(--color-primary)', fontSize: '24px', margin: 0 }}>Nammude Kozhikode Civic Report</h1>
                  <p style={{ fontSize: '12px', color: 'var(--color-outline)', marginTop: '4px' }}>
                    Generated on {new Date().toLocaleDateString('en-IN')} | Authenticated Citizen Copy
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px', fontSize: '14px' }}>
                    <div><strong>Citizen:</strong> {user.name}</div>
                    <div><strong>Ward:</strong> {user.ward}</div>
                    <div><strong>Active Filters:</strong> Category: {filterCategory}, Status: {filterStatus}, Ward: {filterWard}</div>
                  </div>
                </div>
              </div>

              {/* Title Header Card */}
              <div className="awwwards-bento-card print-hide" style={{ padding: 'var(--space-lg)', background: 'var(--color-surface-container-low)' }}>
                <div className="noise-overlay" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                  <div>
                    <span className="chip" style={{ background: 'rgba(53, 37, 205, 0.08)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                      Civic Analytics
                    </span>
                    <h2 className="headline-md" style={{ margin: 0 }}>Reports & Insights Hub</h2>
                    <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                      Monitor infrastructure logs, query corporate statistics, and download custom compliance data.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={exportToCSV}
                      className="btn btn-outline"
                      style={{ height: '40px', minHeight: '40px', borderRadius: 'var(--radius-full)', padding: '0 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}
                    >
                      <FaDownload size={14} /> Export CSV
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="btn btn-primary btn-glow"
                      style={{ height: '40px', minHeight: '40px', borderRadius: 'var(--radius-full)', padding: '0 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}
                    >
                      <FaPrint size={14} /> Print Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="awwwards-bento-card print-hide" style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                  
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaFilter size={11} /> Search Keyword
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Search tickets..."
                      value={reportSearch}
                      onChange={e => setReportSearch(e.target.value)}
                      style={{ height: '40px', minHeight: '40px' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Category</label>
                    <select
                      className="input-field"
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      style={{ height: '40px', minHeight: '40px', padding: '0 12px' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Roads">Roads & Footpaths</option>
                      <option value="Water">Water Leak / Supply</option>
                      <option value="Electricity">Streetlights / Power</option>
                      <option value="Sanitation">Waste Dumping / Sanitation</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Status</label>
                    <select
                      className="input-field"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      style={{ height: '40px', minHeight: '40px', padding: '0 12px' }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Ward</label>
                    <select
                      className="input-field"
                      value={filterWard}
                      onChange={e => setFilterWard(e.target.value)}
                      style={{ height: '40px', minHeight: '40px', padding: '0 12px' }}
                    >
                      <option value="All">All Wards</option>
                      {wardsList.map(w => (
                        <option key={w.id} value={w.id}>{w.id} ({w.name})</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Statistics Bento Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                
                {/* Total Filtered */}
                <div className="awwwards-bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>Total Filtered Issues</p>
                  <p className="display-md" style={{ fontWeight: 700, margin: '8px 0 0 0' }}>{totalFiltered}</p>
                  <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px', margin: 0 }}>Active matches in current query</p>
                </div>

                {/* Resolution Rate */}
                <div className="awwwards-bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>Resolution Rate</p>
                  <p className="display-md" style={{ fontWeight: 700, margin: '8px 0 0 0', color: 'var(--color-secondary)' }}>{resolutionRate}%</p>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${resolutionRate}%`, height: '100%', backgroundColor: 'var(--color-secondary)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Pending vs In Progress */}
                <div className="awwwards-bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>Active Issues Pipeline</p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <div>
                      <p className="headline-sm" style={{ fontWeight: 700, margin: 0, color: 'var(--color-tertiary)' }}>{pendingFiltered}</p>
                      <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>Pending</p>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-outline-variant)' }} />
                    <div>
                      <p className="headline-sm" style={{ fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>{inProgressFiltered}</p>
                      <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>In Progress</p>
                    </div>
                  </div>
                </div>

                {/* Avg Resolution Time */}
                <div className="awwwards-bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="label-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>Avg Resolution Time</p>
                  <p className="display-md" style={{ fontWeight: 700, margin: '8px 0 0 0' }}>2.3 Days</p>
                  <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '4px', margin: 0 }}>Ward standard performance</p>
                </div>

              </div>

              {/* Visualization row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="print-page-break">
                
                {/* Category Distribution Chart */}
                <div className="awwwards-bento-card" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaChartBar style={{ color: 'var(--color-primary)' }} /> Category Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {['Roads', 'Water', 'Electricity', 'Sanitation'].map(cat => {
                      const count = categoryCounts[cat] || 0;
                      const percentage = totalFiltered > 0 ? Math.round((count / totalFiltered) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                            <span>{cat === 'Roads' ? 'Roads & Footpaths' : cat === 'Water' ? 'Water Leak / Supply' : cat === 'Electricity' ? 'Streetlights / Power' : 'Waste Dumping / Sanitation'}</span>
                            <span style={{ color: 'var(--color-outline)' }}>{count} ({percentage}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              backgroundColor: cat === 'Roads' ? 'var(--color-primary)' : cat === 'Water' ? '#00bcd4' : cat === 'Electricity' ? '#ff9800' : '#4caf50',
                              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ward Comparison Statistics */}
                <div className="awwwards-bento-card" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaDatabase style={{ color: 'var(--color-secondary)' }} /> Ward Resolution Stats
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Ward 12', 'Ward 4', 'Ward 18', 'Ward 9'].map(wd => {
                      const wardReports = reports.filter(r => r.ward === wd);
                      const resolved = wardReports.filter(r => r.status === 'Resolved').length;
                      const total = wardReports.length;
                      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
                      return (
                        <div key={wd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                          <div>
                            <span className="label-md font-bold" style={{ color: 'var(--color-primary)' }}>{wd}</span>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', margin: '2px 0 0 0' }}>{resolved} of {total} resolved</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="chip chip-resolved" style={{ fontSize: '11px', padding: '3px 8px', background: rate > 75 ? 'var(--color-secondary-container)' : 'var(--color-tertiary-container)', color: rate > 75 ? 'var(--color-on-secondary-container)' : 'var(--color-on-tertiary-container)' }}>
                              {rate}% Resolved
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Reports List Table Card */}
              <div className="awwwards-bento-card" style={{ padding: 'var(--space-lg)', overflowX: 'auto' }}>
                <h3 className="headline-sm" style={{ marginBottom: '16px' }}>Detailed Infrastructure Logs</h3>
                
                {filteredReports.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-outline)' }}>
                    <p className="body-md">No reports match the current filter selection.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)', fontSize: '13px', fontWeight: 600 }}>
                        <th style={{ padding: '12px 8px' }}>Ticket ID</th>
                        <th style={{ padding: '12px 8px' }}>Title</th>
                        <th style={{ padding: '12px 8px' }}>Category</th>
                        <th style={{ padding: '12px 8px' }}>Ward</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map(report => (
                        <tr key={report.id} className="print-row" style={{ borderBottom: '1px solid var(--color-outline-variant)', fontSize: '13px', transition: 'background-color 0.2s ease' }}>
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: 'var(--color-primary)' }}>{report.id}</td>
                          <td style={{ padding: '14px 8px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={report.title}>{report.title}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <span className="chip" style={{ background: 'var(--color-surface-container-high)', fontSize: '11px', padding: '2px 8px' }}>{report.category}</span>
                          </td>
                          <td style={{ padding: '14px 8px' }}>{report.ward}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <span className={`chip ${report.status === 'Resolved' ? 'chip-resolved' : report.status === 'In Progress' ? 'chip-pending' : ''}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {report.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 8px', color: 'var(--color-outline)' }}>{report.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Custom Print-specific CSS styles */}
              <style>{`
                @media print {
                  /* Hide all default dashboard framework components */
                  aside, 
                  header, 
                  .print-hide, 
                  button,
                  nav {
                    display: none !important;
                  }
                  
                  /* Clean printable area container */
                  body {
                    background: #fff !important;
                    color: #000 !important;
                  }
                  
                  /* Unset grid and force standard paper width spacing */
                  main {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }

                  .print-only {
                    display: block !important;
                  }

                  .awwwards-bento-grid {
                    display: block !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }

                  .awwwards-bento-card {
                    border: none !important;
                    box-shadow: none !important;
                    padding: 10px 0 !important;
                    margin-bottom: 24px !important;
                    background: transparent !important;
                  }

                  .print-page-break {
                    page-break-before: always;
                  }
                  
                  table {
                    width: 100% !important;
                    page-break-inside: auto;
                  }
                  
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  
                  .print-row {
                    border-bottom: 1px solid #ddd !important;
                  }
                }
              `}</style>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
