"use client";

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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

interface EngineerWithJobs extends Engineer {
  activeJobs: number;
}

interface EngineersManagerProps {
  engineers: EngineerWithJobs[];
  engineersList: Engineer[];
  onAddOrUpdate: (data: {
    id?: string;
    name: string;
    dept: string;
    mobile: string;
    email: string;
    password: string;
  }) => void;
  onToggleAccess: (id: string) => void;
}

export default function EngineersManager({
  engineers,
  engineersList,
  onAddOrUpdate,
  onToggleAccess,
}: EngineersManagerProps) {
  const [newEngName, setNewEngName] = useState('');
  const [newEngDept, setNewEngDept] = useState('Roads Dept');
  const [newEngMobile, setNewEngMobile] = useState('');
  const [newEngEmail, setNewEngEmail] = useState('');
  const [newEngPassword, setNewEngPassword] = useState('');
  const [showNewEngPassword, setShowNewEngPassword] = useState(false);
  const [editingEngineerId, setEditingEngineerId] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');

  const handleSelectEngineer = (eng: Engineer) => {
    setEditingEngineerId(eng.id);
    setNewEngName(eng.name);
    setNewEngDept(eng.dept);
    setNewEngMobile(eng.mobile);
    setNewEngEmail(eng.email);
    setNewEngPassword(eng.password || 'engineer123');
    setShowNewEngPassword(false);
  };

  const handleResetForm = () => {
    setEditingEngineerId(null);
    setNewEngName('');
    setNewEngDept('Roads Dept');
    setNewEngMobile('');
    setNewEngEmail('');
    setNewEngPassword('');
    setShowNewEngPassword(false);
    setAddError('');
    setAddSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSuccess('');
    setAddError('');

    if (!newEngName || !newEngMobile || !newEngEmail || !newEngPassword) {
      setAddError('Please fill in all fields.');
      return;
    }

    onAddOrUpdate({
      id: editingEngineerId ?? undefined,
      name: newEngName,
      dept: newEngDept,
      mobile: newEngMobile,
      email: newEngEmail,
      password: newEngPassword,
    });

    setAddSuccess(editingEngineerId ? 'Field engineer profile updated successfully!' : 'Field engineer added successfully!');
    setTimeout(() => setAddSuccess(''), 3000);
    if (!editingEngineerId) handleResetForm();
    else {
      setEditingEngineerId(null);
      handleResetForm();
    }
  };

  return (
    <div className="col-span-4 stagger-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

      {/* Left: Add / Edit Form */}
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

        <form id="engineer-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '11px' }}>Full Name</label>
            <input id="eng-name" type="text" className="input-field" placeholder="Rajesh Kumar" value={newEngName} onChange={e => setNewEngName(e.target.value)} style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }} />
          </div>

          {/* Department */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '11px' }}>Department</label>
            <select id="eng-dept" className="input-field" value={newEngDept} onChange={e => setNewEngDept(e.target.value)} style={{ minHeight: '38px', fontSize: '13px', padding: '0 12px', background: 'var(--color-surface-container-lowest)' }}>
              <option value="Roads Dept">Roads & Transport</option>
              <option value="Water Dept">Water & Sanitation</option>
              <option value="Electrical Dept">Electricity & Power</option>
              <option value="Sanitation Crew">Sanitation Crew</option>
            </select>
          </div>

          {/* Mobile */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '11px' }}>Mobile Number</label>
            <input id="eng-mobile" type="tel" className="input-field" placeholder="+91 98765 43210" value={newEngMobile} onChange={e => setNewEngMobile(e.target.value)} style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }} />
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '11px' }}>Email Address</label>
            <input id="eng-email" type="email" className="input-field" placeholder="rajesh.k@kozhikode.gov.in" value={newEngEmail} onChange={e => setNewEngEmail(e.target.value)} style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)' }} />
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '11px' }}>Portal Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="eng-password"
                type={showNewEngPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={newEngPassword}
                onChange={e => setNewEngPassword(e.target.value)}
                style={{ minHeight: '38px', fontSize: '13px', background: 'var(--color-surface-container-lowest)', width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                id="eng-password-toggle"
                onClick={() => setShowNewEngPassword(v => !v)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--color-outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              >
                {showNewEngPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* Access Control — shown only when editing */}
          {editingEngineerId && (
            <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="label-sm font-semibold" style={{ fontSize: '11px', color: 'var(--color-outline)' }}>PORTAL STATUS CONTROL</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="eng-toggle-access"
                  onClick={() => onToggleAccess(editingEngineerId)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    background: engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? 'rgba(0, 108, 73, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                    color: engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? 'var(--color-secondary)' : 'var(--color-error)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {engineersList.find(e => e.id === editingEngineerId)?.hasAccess ? '🟢 Portal Access: Active' : '🔴 Portal Access: Revoked'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              id="eng-submit-btn"
              className="btn btn-primary btn-glow"
              style={{ flex: 1, borderRadius: 'var(--radius-full)', minHeight: '40px', fontSize: '13px' }}
            >
              {editingEngineerId ? 'Save Changes' : 'Add Engineer Profile'}
            </button>
            {editingEngineerId && (
              <button
                type="button"
                id="eng-cancel-btn"
                onClick={handleResetForm}
                className="btn btn-outline"
                style={{ flex: 1, borderRadius: 'var(--radius-full)', minHeight: '40px', fontSize: '13px' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right: Directory */}
      <div className="awwwards-bento-card" style={{ padding: 'var(--space-xl)', background: 'var(--color-surface-container-lowest)' }}>
        <h3 className="headline-sm" style={{ marginBottom: '8px' }}>Field Engineers Directory</h3>
        <p className="body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '20px' }}>
          Manage crew credentials, monitor workload capacities, and authorize portal access. Click on any profile to update credentials or manage access.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {engineers.map(eng => {
            const isSelected = editingEngineerId === eng.id;
            const matchedEngObj = engineersList.find(e => e.id === eng.id);
            const hasAccess = matchedEngObj ? matchedEngObj.hasAccess : eng.hasAccess;

            return (
              <div
                key={eng.id}
                id={`eng-card-${eng.id}`}
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
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary)' }}>
                    {eng.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="label-lg" style={{ fontWeight: 700, margin: 0 }}>{eng.name}</h4>
                    <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0, fontSize: '11px' }}>{eng.dept}</p>
                  </div>
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '12px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '8px' }}>
                  <span>📞 {eng.mobile}</span>
                  <span>✉️ {eng.email}</span>
                </div>

                {/* Footer: jobs + access */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', marginTop: '4px' }}>
                  <span className="label-sm" style={{ fontSize: '11px' }}>Active: <strong>{eng.activeJobs} jobs</strong></span>
                  <button
                    type="button"
                    id={`eng-access-${eng.id}`}
                    onClick={e => { e.stopPropagation(); onToggleAccess(eng.id); }}
                    style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      background: hasAccess ? 'var(--color-secondary-container)' : 'var(--color-error-container)',
                      color: hasAccess ? 'var(--color-on-secondary-container)' : 'var(--color-on-error-container)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {hasAccess ? 'Access Active' : 'Access Revoked'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
