"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRoad, FaTint, FaLightbulb, FaTrash, FaMapMarkerAlt, FaFileUpload, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { db, isFirebaseEnabled } from '../../../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { DEFAULT_WARDS, Ward } from '../../../../lib/wards';

interface ReportIssueFormProps {
  userName: string;
  defaultWard: string;
  onSubmit: (report: {
    title: string;
    category: string;
    ward: string;
    description: string;
  }) => void;
}

const CATEGORIES = [
  { id: 'Roads', label: 'Roads & Footpaths', icon: <FaRoad size={20} /> },
  { id: 'Water', label: 'Water Leak / Supply', icon: <FaTint size={20} /> },
  { id: 'Electricity', label: 'Streetlights & Power', icon: <FaLightbulb size={20} /> },
  { id: 'Sanitation', label: 'Waste / Sanitation', icon: <FaTrash size={20} /> },
];

export default function ReportIssueForm({ userName, defaultWard, onSubmit }: ReportIssueFormProps) {
  const [wardsList, setWardsList] = useState<Ward[]>(DEFAULT_WARDS);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads');
  const [ward, setWard] = useState(defaultWard);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isFirebaseEnabled) {
      const unsubscribe = onSnapshot(collection(db, 'wards'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Ward[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Ward);
          });
          list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
          setWardsList(list);
        }
      }, (err) => {
        console.error("Failed to fetch wards in ReportIssueForm:", err);
      });
      return () => unsubscribe();
    } else {
      const storedWards = localStorage.getItem('nammude_wards');
      if (storedWards) {
        setWardsList(JSON.parse(storedWards));
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!title || !description) {
      setErrorMsg('Please fill in the title and description.');
      return;
    }
    onSubmit({ title, category, ward, description });
    setTitle('');
    setCategory('Roads');
    setWard(defaultWard);
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setSuccessMsg('Issue logged successfully! Redirecting to your reports...');
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  const wardLabel = (id: string) => {
    const w = wardsList.find(p => p.id === id);
    return w ? `${w.id} (${w.name})` : id;
  };

  return (
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
          <FaCheckCircle /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '16px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: 'var(--radius-default)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      <form id="report-issue-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>

        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Title */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Issue Summary / Title</label>
            <input id="issue-title" type="text" className="input-field" placeholder="e.g. Clogged drain leading to overflow" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* Category picker */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ marginBottom: '8px' }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    id={`cat-${cat.id.toLowerCase()}`}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '16px', borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                      background: isSelected ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? 'var(--shadow-near)' : 'none',
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-outline)' }}>{cat.icon}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Detailed Description</label>
            <textarea
              id="issue-description"
              className="input-field"
              rows={4}
              placeholder="Specify exact landmark, description, and severity level..."
              style={{ padding: '12px 16px', minHeight: '100px', fontFamily: 'inherit' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Photo upload */}
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
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{ background: 'rgba(186,26,26,0.1)', color: 'var(--color-error)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--color-surface-container-low)', transition: 'border-color 0.2s ease', position: 'relative' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
              >
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 2 }} />
                <FaFileUpload style={{ fontSize: '28px', color: 'var(--color-primary)', marginBottom: '8px' }} />
                <p className="body-sm" style={{ fontWeight: 600 }}>Click or Drag photo here to attach proof</p>
                <p className="label-sm" style={{ color: 'var(--color-outline)', marginTop: '2px' }}>PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ margin: 0 }}>Incident Location Map Picker</label>
            <span className="chip chip-resolved" style={{ fontSize: '11px', padding: '3px 8px' }}>Auto Warding</span>
          </div>

          {/* Stylised map */}
          <div style={{ height: '280px', borderRadius: 'var(--radius-lg)', background: '#e0ece4', border: '1px solid var(--color-outline-variant)', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #c7decb 10%, transparent 11%)', backgroundSize: '20px 20px', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: '120px', left: '-50px', width: '300px', height: '40px', background: '#d5e6db', transform: 'rotate(-25deg)', borderRadius: '20px' }} />
            <div style={{ position: 'absolute', top: '40px', left: '160px', width: '40px', height: '260px', background: '#d5e6db', transform: 'rotate(15deg)', borderRadius: '20px' }} />
            {wardsList.map(w => {
              const isActive = ward === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  id={`ward-pin-${w.id.replace(' ', '-').toLowerCase()}`}
                  onClick={() => setWard(w.id)}
                  title={`${w.id} (${w.name})`}
                  style={{ position: 'absolute', top: w.top, left: w.left, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, transform: isActive ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s ease' }}
                >
                  <FaMapMarkerAlt style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-outline)', fontSize: '28px', filter: isActive ? 'drop-shadow(0px 4px 10px rgba(53,37,205,0.45))' : 'none' }} />
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: '-22px', whiteSpace: 'nowrap', background: 'var(--color-primary)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', boxShadow: 'var(--shadow-near)' }}>
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

          {/* Selected ward display */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
            <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>SELECTED LOCATION WARD</p>
            <p className="body-md font-bold" style={{ margin: '4px 0 0 0', color: 'var(--color-primary)' }}>{wardLabel(ward)}</p>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button type="submit" id="submit-report-btn" className="btn btn-primary btn-glow btn-shimmer" style={{ borderRadius: 'var(--radius-full)', width: '100%', minHeight: '48px' }}>
              Submit Complaint Ticket
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
