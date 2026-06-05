"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHome, FaFileAlt, FaHardHat, FaCog, FaBell, FaSearch, FaCheckCircle, FaExclamationTriangle, FaClock, FaUserCircle, FaFilter, FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight, FaTrash, FaCheck, FaChartBar, FaSignOutAlt, FaRoad, FaTint, FaLightbulb, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';
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

const defaultEngineers: Engineer[] = [];

export default function OfficialDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const reports = user?.ward && user.ward !== 'Corporation Head Office'
    ? allReports.filter((r: Report) => r.ward === user.ward)
    : allReports;
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Dynamic Wards Registry
  const [wardsList, setWardsList] = useState<Ward[]>([]);
  const [newWardId, setNewWardId] = useState('');
  const [newWardName, setNewWardName] = useState('');
  const [wardSuccessMsg, setWardSuccessMsg] = useState('');
  const [wardErrorMsg, setWardErrorMsg] = useState('');

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
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [deletedNotifIds, setDeletedNotifIds] = useState<string[]>([]);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('');
  const [notifErrorMsg, setNotifErrorMsg] = useState('');

  const defaultReports: Report[] = [];

  useEffect(() => {
    setMounted(true);
    
    // Load read/deleted notification states from localStorage on mount
    const storedRead = localStorage.getItem('nammude_read_notifications');
    if (storedRead) setReadNotifIds(JSON.parse(storedRead));
    const storedDeleted = localStorage.getItem('nammude_deleted_notifications');
    if (storedDeleted) setDeletedNotifIds(JSON.parse(storedDeleted));

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

    if (isFirebaseEnabled) {
      // Real-time access check
      const unsubAccess = onSnapshot(doc(db, 'users', parsedUser.uid || parsedUser.id || ''), (docSnap) => {
        if (docSnap.exists()) {
          const currentProfile = docSnap.data();
          if (currentProfile && currentProfile.hasAccess === false) {
            localStorage.removeItem('nammude_user');
            router.push('/auth?error=revoked');
          }
        }
      }, (err) => {
        console.error("Access verification error:", err);
      });

      const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const fetchedReports: Report[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push(doc.data() as Report);
        });
        fetchedReports.sort((a, b) => b.id.localeCompare(a.id));
        setAllReports(fetchedReports);
      }, (err) => {
        console.error("Failed to load reports from Firestore:", err);
      });

      const unsubEngineers = onSnapshot(collection(db, 'engineers'), (snapshot) => {
        const fetchedEngineers: Engineer[] = [];
        snapshot.forEach((doc) => {
          fetchedEngineers.push(doc.data() as Engineer);
        });
        fetchedEngineers.sort((a, b) => a.name.localeCompare(b.name));
        setEngineersList(fetchedEngineers);
      }, (err) => {
        console.error("Failed to load engineers from Firestore:", err);
      });

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
        unsubEngineers();
        unsubAccess();
        unsubWards();
        unsubNotifs();
      };
    } else {
      // Local fallback access check
      const storedOfficials = localStorage.getItem('nammude_officials_list');
      if (storedOfficials) {
        const officialsList = JSON.parse(storedOfficials);
        const currentProfile = officialsList.find((off: any) => off.email.toLowerCase() === parsedUser.email.toLowerCase());
        if (currentProfile && currentProfile.hasAccess === false) {
          localStorage.removeItem('nammude_user');
          router.push('/auth?error=revoked');
          return;
        }
      }

      // Initialize Database
      const storedReports = localStorage.getItem('nammude_reports');
      if (storedReports) {
        setAllReports(JSON.parse(storedReports));
      } else {
        localStorage.setItem('nammude_reports', JSON.stringify(defaultReports));
        setAllReports(defaultReports);
      }

      const storedEngineers = localStorage.getItem('nammude_engineers');
      if (storedEngineers) {
        setEngineersList(JSON.parse(storedEngineers));
      } else {
        localStorage.setItem('nammude_engineers', JSON.stringify(defaultEngineers));
        setEngineersList(defaultEngineers);
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
  const handleUpdateReport = async (id: string, status: 'Pending' | 'In Progress' | 'Resolved', assignee: string) => {
    if (isFirebaseEnabled) {
      try {
        const repRef = doc(db, 'reports', id);
        const reportToUpdate = allReports.find(r => r.id === id);
        if (reportToUpdate) {
          await setDoc(repRef, { ...reportToUpdate, status, assignee });
        } else {
          await setDoc(repRef, { status, assignee }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to update report status in Firestore:", err);
      }
    } else {
      const updated = allReports.map(r => r.id === id ? { ...r, status, assignee } : r);
      localStorage.setItem('nammude_reports', JSON.stringify(updated));
      setAllReports(updated);
    }
    
    // Add Notification to dynamic broadcast
    const notificationId = `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`;
    const systemNotif: AppNotification = {
      id: notificationId,
      title: `${assignee} updated ticket`,
      content: `Ticket #${id} status updated to ${status}.`,
      target: 'officials',
      sender: assignee,
      senderRole: 'official',
      date: new Date().toISOString(),
      status: 'approved'
    };
    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'notifications', notificationId), systemNotif);
      } catch (err) {
        console.error("Failed to post system notification:", err);
      }
    } else {
      const stored = localStorage.getItem('nammude_notifications');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [systemNotif, ...list];
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
    }
  };

  const inboxNotifications = notificationsList
    .filter(n => n.status === 'approved' && (n.target === 'officials' || n.target === 'all'))
    .filter(n => !deletedNotifIds.includes(n.id))
    .map(n => ({
      id: n.id,
      title: n.title,
      boldText: '',
      suffix: n.content,
      time: new Date(n.date).toLocaleString(),
      read: readNotifIds.includes(n.id)
    }));

  const markAllAsRead = () => {
    const activeIds = inboxNotifications.map(n => n.id);
    const newRead = Array.from(new Set([...readNotifIds, ...activeIds]));
    setReadNotifIds(newRead);
    localStorage.setItem('nammude_read_notifications', JSON.stringify(newRead));
  };

  const deleteAllNotifications = () => {
    const activeIds = inboxNotifications.map(n => n.id);
    const newDeleted = Array.from(new Set([...deletedNotifIds, ...activeIds]));
    setDeletedNotifIds(newDeleted);
    localStorage.setItem('nammude_deleted_notifications', JSON.stringify(newDeleted));
  };

  const markAsRead = (id: string | number) => {
    const stringId = String(id);
    const newRead = Array.from(new Set([...readNotifIds, stringId]));
    setReadNotifIds(newRead);
    localStorage.setItem('nammude_read_notifications', JSON.stringify(newRead));
  };

  const deleteNotification = (id: string | number) => {
    const stringId = String(id);
    const newDeleted = Array.from(new Set([...deletedNotifIds, stringId]));
    setDeletedNotifIds(newDeleted);
    localStorage.setItem('nammude_deleted_notifications', JSON.stringify(newDeleted));
  };

  const handleRequestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSuccessMsg('');
    setNotifErrorMsg('');
    if (!notifTitle.trim() || !notifContent.trim()) {
      setNotifErrorMsg('Please fill in both title and content.');
      return;
    }
    const newRequest: AppNotification = {
      id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: notifTitle,
      content: notifContent,
      target: 'citizens',
      sender: user?.name || 'Ward Official',
      senderRole: 'official',
      date: new Date().toISOString(),
      status: 'pending',
      requestedBy: user?.email,
      requestedAt: new Date().toISOString()
    };
    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'notifications', newRequest.id), newRequest);
        setNotifSuccessMsg('Notification request submitted to Mayor for approval!');
      } catch (err: any) {
        console.error("Firestore submit request error:", err);
        setNotifErrorMsg(`Failed to submit: ${err.message}`);
        return;
      }
    } else {
      const updated = [newRequest, ...notificationsList];
      localStorage.setItem('nammude_notifications', JSON.stringify(updated));
      setNotificationsList(updated);
      setNotifSuccessMsg('Notification request submitted to Mayor for approval!');
    }
    setNotifTitle('');
    setNotifContent('');

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

  const handleAddEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSuccess('');
    setAddError('');

    if (!newEngName || !newEngMobile || !newEngEmail || !newEngPassword) {
      setAddError('Please fill in all fields.');
      return;
    }

    if (editingEngineerId) {
      // Update Mode
      if (isFirebaseEnabled) {
        try {
          const engRef = doc(db, 'engineers', editingEngineerId);
          const existingEng = engineersList.find(eng => eng.id === editingEngineerId);
          const updatedEng = {
            ...existingEng,
            id: editingEngineerId,
            name: newEngName,
            dept: newEngDept,
            mobile: newEngMobile,
            email: newEngEmail,
            password: newEngPassword,
            status: existingEng?.status || 'Available',
            hasAccess: existingEng ? existingEng.hasAccess : true
          };
          await setDoc(engRef, updatedEng);
          setAddSuccess('Field engineer profile updated successfully!');
        } catch (err: any) {
          console.error("Firestore update engineer error:", err);
          setAddError(`Failed to update engineer: ${err.message}`);
          return;
        }
      } else {
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
      }
      
      // Reset editing states
      setEditingEngineerId(null);
      setNewEngName('');
      setNewEngMobile('');
      setNewEngEmail('');
      setNewEngPassword('');
      setShowNewEngPassword(false);
    } else {
      // Create Mode
      const newId = `ENG-${Math.floor(100 + Math.random() * 900)}`;
      const newEng: Engineer = {
        id: newId,
        name: newEngName,
        dept: newEngDept,
        mobile: newEngMobile,
        email: newEngEmail,
        password: newEngPassword,
        status: 'Available',
        hasAccess: true
      };

      if (isFirebaseEnabled) {
        try {
          await setDoc(doc(db, 'engineers', newId), newEng);
          setAddSuccess('Field engineer added successfully!');
        } catch (err: any) {
          console.error("Firestore add engineer error:", err);
          setAddError(`Failed to add engineer: ${err.message}`);
          return;
        }
      } else {
        const updated = [...engineersList, newEng];
        localStorage.setItem('nammude_engineers', JSON.stringify(updated));
        setEngineersList(updated);
        setAddSuccess('Field engineer added successfully!');
      }
      
      setNewEngName('');
      setNewEngMobile('');
      setNewEngEmail('');
      setNewEngPassword('');
      setShowNewEngPassword(false);
    }
    
    // Auto-clear success message
    setTimeout(() => {
      setAddSuccess('');
    }, 3000);
  };

  const handleToggleAccess = async (id: string) => {
    if (isFirebaseEnabled) {
      try {
        const engRef = doc(db, 'engineers', id);
        const targetEng = engineersList.find(e => e.id === id);
        if (targetEng) {
          await setDoc(engRef, { ...targetEng, hasAccess: !targetEng.hasAccess });
        }
      } catch (err) {
        console.error("Failed to toggle engineer access in Firestore:", err);
      }
    } else {
      const updated = engineersList.map(e => e.id === id ? { ...e, hasAccess: !e.hasAccess } : e);
      localStorage.setItem('nammude_engineers', JSON.stringify(updated));
      setEngineersList(updated);
    }
    
    // Dispatch storage event to alert other components of access change
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    setWardErrorMsg('');
    setWardSuccessMsg('');

    if (!newWardId || !newWardName) {
      setWardErrorMsg('Please fill in both Ward ID and Area Name.');
      return;
    }

    const idTrim = newWardId.trim();
    const nameTrim = newWardName.trim();

    if (wardsList.some(w => w.id.toLowerCase() === idTrim.toLowerCase())) {
      setWardErrorMsg('A ward with this ID already exists.');
      return;
    }

    const coords = generateRandomCoords();
    const newWard: Ward = { id: idTrim, name: nameTrim, ...coords };

    if (isFirebaseEnabled) {
      try {
        await setDoc(doc(db, 'wards', idTrim), newWard);
      } catch (err: any) {
        console.error("Failed to save ward to Firestore:", err);
        setWardErrorMsg(`Failed to save ward: ${err.message}`);
        return;
      }
    } else {
      const updatedList = [...wardsList, newWard];
      localStorage.setItem('nammude_wards', JSON.stringify(updatedList));
      setWardsList(updatedList);
    }

    setWardSuccessMsg(`Ward ${idTrim} (${nameTrim}) added successfully!`);
    setNewWardId('');
    setNewWardName('');
    setTimeout(() => setWardSuccessMsg(''), 3000);
  };

  const handleRemoveWard = async (wardId: string) => {
    setWardErrorMsg('');
    setWardSuccessMsg('');

    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(db, 'wards', wardId));
      } catch (err: any) {
        console.error("Failed to delete ward from Firestore:", err);
        setWardErrorMsg(`Failed to delete ward: ${err.message}`);
        return;
      }
    } else {
      const updatedList = wardsList.filter(w => w.id !== wardId);
      localStorage.setItem('nammude_wards', JSON.stringify(updatedList));
      setWardsList(updatedList);
    }

    setWardSuccessMsg(`Ward ${wardId} removed successfully.`);
    setTimeout(() => setWardSuccessMsg(''), 3000);
  };

  // Dynamic Chart Calculations based on actual reports
  const getChartData = () => {
    if (analyticsMonth === 'All Months') {
      const counts = new Array(12).fill(0);
      
      reports.forEach(report => {
        if (!report.date) return;
        
        // Parse date format: YYYY-MM-DD
        const dateParts = report.date.split('-');
        if (dateParts.length < 2) return;
        
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1; // 0-indexed
        
        // Match year filter
        if (analyticsYear !== 'All Years' && year !== analyticsYear) {
          return;
        }
        
        // Match department filter
        if (analyticsDept !== 'All Departments') {
          const dept = analyticsDept.toLowerCase();
          const category = report.category.toLowerCase();
          
          if (dept === 'water') {
            if (category !== 'water' && category !== 'sanitation') {
              return;
            }
          } else if (dept === 'roads') {
            if (category !== 'roads') {
              return;
            }
          } else if (dept === 'electricity') {
            if (category !== 'electricity') {
              return;
            }
          } else {
            if (!category.includes(dept) && !dept.includes(category)) {
              return;
            }
          }
        }
        
        if (monthIndex >= 0 && monthIndex < 12) {
          counts[monthIndex] += 1;
        }
      });
      return counts;
    } else {
      // Month-wise analytics: Show breakdown by category/department for the selected month: [Roads, Water & Sanitation, Electricity]
      const counts = new Array(3).fill(0);
      const selectedMonthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(analyticsMonth);
      
      reports.forEach(report => {
        if (!report.date) return;
        const dateParts = report.date.split('-');
        if (dateParts.length < 2) return;
        
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1;

        if (analyticsYear !== 'All Years' && year !== analyticsYear) {
          return;
        }

        if (monthIndex !== selectedMonthIndex) {
          return;
        }

        const category = report.category.toLowerCase();

        // Match department filter if not 'All Departments'
        if (analyticsDept !== 'All Departments') {
          const dept = analyticsDept.toLowerCase();
          if (dept === 'water') {
            if (category !== 'water' && category !== 'sanitation') {
              return;
            }
          } else if (dept === 'roads') {
            if (category !== 'roads') {
              return;
            }
          } else if (dept === 'electricity') {
            if (category !== 'electricity') {
              return;
            }
          } else {
            if (!category.includes(dept) && !dept.includes(category)) {
              return;
            }
          }
        }

        if (category === 'roads') {
          counts[0] += 1;
        } else if (category === 'water' || category === 'sanitation') {
          counts[1] += 1; // combined "water & sanitation"
        } else if (category === 'electricity') {
          counts[2] += 1;
        }
      });
      return counts;
    }
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
            {(user?.ward === 'Corporation Head Office'
              ? ['Overview', 'Reports Manager', 'Engineers', 'Analytics', 'Manage Wards', 'Notifications']
              : ['Overview', 'Reports Manager', 'Engineers', 'Analytics', 'Notifications']
            ).map(tab => (
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
                {tab === 'Manage Wards' && <FaMapMarkerAlt style={{ fontSize: '20px', minWidth: '20px' }} />}
                {tab === 'Notifications' && <FaBell style={{ fontSize: '20px', minWidth: '20px' }} />}
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
                  {inboxNotifications.some(n => !n.read) && (
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
                      {inboxNotifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                          <p className="body-sm">No new notifications</p>
                        </div>
                      ) : (
                        inboxNotifications.map(n => (
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
                  <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>for month</span>
                  <select value={analyticsMonth} onChange={(e) => setAnalyticsMonth(e.target.value)} style={{ padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}>
                    <option value="All Months">all months</option>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
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
                  {(analyticsMonth === 'All Months'
                    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    : ['Roads', 'Water & Sani', 'Electricity']
                  ).map((label, idx) => (
                    <span key={idx} className="label-sm" style={{ width: '100%', textAlign: 'center' }}>{label}</span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* --- MANAGE WARDS TAB --- */}
          {activeTab === 'Manage Wards' && user?.ward === 'Corporation Head Office' && (
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
              
              {/* Add Ward Form Card */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)', height: 'fit-content' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Add Municipal Ward</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Register a new ward section in the city map and dispatch database.
                </p>

                {wardErrorMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {wardErrorMsg}
                  </div>
                )}

                {wardSuccessMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {wardSuccessMsg}
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
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
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
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
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

          {/* Tab View: Notifications */}
          {activeTab === 'Notifications' && (
            <div className="col-span-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
              
              {/* Proposal Request Form */}
              <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)', height: 'fit-content' }}>
                <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Request Citizen Broadcast</h3>
                <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Draft a public safety announcement or warning for Citizens. Submissions will be sent to the Mayor for permission.
                </p>

                {notifErrorMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {notifErrorMsg}
                  </div>
                )}

                {notifSuccessMsg && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    {notifSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleRequestNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Proposal Title</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Roads Blocked at Beach Road" 
                      value={notifTitle}
                      onChange={e => setNotifTitle(e.target.value)}
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Message Details</label>
                    <textarea 
                      className="input-field" 
                      placeholder="Explain the alert, event, or warning clearly..." 
                      value={notifContent}
                      onChange={e => setNotifContent(e.target.value)}
                      rows={5}
                      style={{ padding: '10px 12px', fontSize: '13px', background: 'var(--color-surface-container-lowest)', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Recipient Target</label>
                    <input
                      type="text"
                      className="input-field"
                      value="Citizens Only"
                      disabled
                      style={{ minHeight: '40px', fontSize: '13px', background: 'var(--color-surface-container-low)' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-glow"
                    style={{ borderRadius: 'var(--radius-full)', minHeight: '42px', fontSize: '13px', fontWeight: 700, marginTop: '8px', padding: '0 24px', alignSelf: 'flex-start' }}
                  >
                    Submit Proposal
                  </button>
                </form>
              </div>

              {/* Proposals and Inbox List Panels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* My Requests Tracker */}
                <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>My Broadcast Proposals</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                    Track permission logs for your citizen notification requests.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                    {notificationsList.filter(n => n.requestedBy === user?.email).length === 0 ? (
                      <p className="body-sm" style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '24px 0' }}>You haven't requested any broadcasts yet.</p>
                    ) : (
                      notificationsList.filter(n => n.requestedBy === user?.email).map(n => (
                        <div 
                          key={n.id}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-outline-variant)',
                            background: 'var(--color-surface-container-lowest)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 className="label-lg" style={{ fontWeight: 800 }}>{n.title}</h4>
                              <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '2px' }}>
                                Requested: {new Date(n.requestedAt || n.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`chip ${n.status === 'approved' ? 'chip-resolved' : n.status === 'denied' ? 'chip-pending' : ''}`} style={{ fontSize: '10px', background: n.status === 'pending' ? 'rgba(230,162,44,0.1)' : undefined, color: n.status === 'pending' ? '#e6a23c' : undefined }}>
                              {n.status === 'approved' ? 'Approved & Published' : n.status === 'denied' ? 'Denied' : 'Pending Review'}
                            </span>
                          </div>
                          <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{n.content}</p>
                          {n.approvedAt && (
                            <p className="label-sm" style={{ color: 'var(--color-primary)', fontWeight: 600, borderTop: '1px solid var(--color-outline-variant)', paddingTop: '6px' }}>
                              ✅ Approved by Mayor on {new Date(n.approvedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bulletin Inbox */}
                <div className="awwwards-bento-card stagger-fade-up" style={{ padding: 'var(--space-lg)' }}>
                  <h3 className="headline-sm" style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Official Bulletin Feed</h3>
                  <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                    Read official notices issued by the Mayor for all Corporation Officials.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                    {inboxNotifications.length === 0 ? (
                      <p className="body-sm" style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '24px 0' }}>No active bulletin notifications.</p>
                    ) : (
                      inboxNotifications.map(n => (
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
                            gap: '12px',
                            backgroundColor: n.read ? 'var(--color-surface-container-lowest)' : 'rgba(53, 37, 205, 0.04)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                              <h4 className="label-lg" style={{ fontWeight: n.read ? 700 : 800 }}>{n.title}</h4>
                            </div>
                            <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{n.suffix}</p>
                            <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '8px' }}>
                              Received: {n.time}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                style={{
                                  padding: '6px', borderRadius: '50%', border: 'none',
                                  cursor: 'pointer', background: 'rgba(53, 37, 205, 0.1)', color: 'var(--color-primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Mark as read"
                              >
                                <FaCheck size={10} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              style={{
                                  padding: '6px', borderRadius: '50%', border: 'none',
                                  cursor: 'pointer', background: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              title="Delete notification"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
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
}