"use client";

import React, { useState } from 'react';
import {
  FaSearch, FaFileAlt, FaRoad, FaTint, FaLightbulb, FaTrash,
  FaMapMarkerAlt, FaCalendarAlt, FaCheck
} from 'react-icons/fa';

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

interface EngineerSummary {
  id: string;
  name: string;
  dept: string;
  activeJobs: number;
}

interface ReportsManagerProps {
  reports: Report[];
  engineers: EngineerSummary[];
  onUpdateReport: (id: string, status: Report['status'], assignee: string) => void;
}

export default function ReportsManager({ reports, engineers, onUpdateReport }: ReportsManagerProps) {
  const [reportStatus, setReportStatus] = useState('All');
  const [reportCategory, setReportCategory] = useState('All');
  const [reportSearch, setReportSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredWorkerName, setHoveredWorkerName] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    const matchStatus = reportStatus === 'All' || r.status === reportStatus;
    const matchCategory = reportCategory === 'All' || r.category === reportCategory;
    const matchSearch = reportSearch
      ? [r.id, r.title, r.description, r.ward, r.reporter]
          .some(f => f.toLowerCase().includes(reportSearch.toLowerCase()))
      : true;
    return matchStatus && matchCategory && matchSearch;
  });

  const categoryMeta = (cat: string) => {
    if (cat === 'Water') return { color: '#00bcd4', icon: <FaTint /> };
    if (cat === 'Electricity') return { color: '#ff9800', icon: <FaLightbulb /> };
    if (cat === 'Sanitation') return { color: 'var(--color-secondary)', icon: <FaTrash /> };
    return { color: 'var(--color-primary)', icon: <FaRoad /> };
  };

  const rep = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;

  const FilterPills = ({
    label, values, current, counts, onSelect
  }: {
    label: string;
    values: string[];
    current: string;
    counts: Record<string, number>;
    onSelect: (v: string) => void;
  }) => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600 }}>{label}:</span>
      {values.map(v => {
        const isSelected = current === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(v)}
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
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {v}
            <span style={{
              fontSize: '10px', opacity: 0.8,
              background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
              padding: '2px 6px', borderRadius: '10px',
            }}>{counts[v]}</span>
          </button>
        );
      })}
    </div>
  );

  const statusCounts: Record<string, number> = {
    All: reports.length,
    Pending: reports.filter(r => r.status === 'Pending').length,
    'In Progress': reports.filter(r => r.status === 'In Progress').length,
    Resolved: reports.filter(r => r.status === 'Resolved').length,
  };

  const categoryCounts: Record<string, number> = {
    All: reports.length,
    Roads: reports.filter(r => r.category === 'Roads').length,
    Water: reports.filter(r => r.category === 'Water').length,
    Electricity: reports.filter(r => r.category === 'Electricity').length,
    Sanitation: reports.filter(r => r.category === 'Sanitation').length,
  };

  return (
    <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', minHeight: '550px' }}>
      {/* Header */}
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

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--space-lg)', padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-outline)' }} />
          <input
            id="reports-search-input"
            type="text"
            className="input-field"
            placeholder="Search by ID, Title, Reporter, Ward..."
            value={reportSearch}
            onChange={e => setReportSearch(e.target.value)}
            style={{ paddingLeft: '40px', minHeight: '44px', width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-lowest)' }}
          />
        </div>
        <FilterPills label="Category" values={['All', 'Roads', 'Water', 'Electricity', 'Sanitation']} current={reportCategory} counts={categoryCounts} onSelect={setReportCategory} />
        <div style={{ borderLeft: '1px solid var(--color-outline-variant)', paddingLeft: '16px' }}>
          <FilterPills label="Status" values={['All', 'Pending', 'In Progress', 'Resolved']} current={reportStatus} counts={statusCounts} onSelect={setReportStatus} />
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '24px' }}>

        {/* Left: Report List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredReports.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-lowest)', color: 'var(--color-outline)', padding: '20px' }}>
              <p className="body-md" style={{ fontWeight: 600 }}>No reports matched filters.</p>
              <p className="label-sm" style={{ marginTop: '4px' }}>Try broadening your search or selecting a different filter.</p>
            </div>
          ) : filteredReports.map(report => {
            const isSelected = selectedReportId === report.id;
            const { color: categoryColor, icon: categoryIcon } = categoryMeta(report.category);
            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                onClick={() => setSelectedReportId(report.id)}
                onMouseEnter={() => setHoveredCardId(report.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `6px solid ${categoryColor}`,
                  border: isSelected ? `1px solid rgba(53, 37, 205, 0.3)` : `1px solid var(--color-outline-variant)`,
                  borderLeftWidth: '6px',
                  borderLeftColor: categoryColor,
                  backgroundColor: isSelected ? 'rgba(53, 37, 205, 0.05)' : 'var(--color-surface-container-lowest)',
                  cursor: 'pointer',
                  boxShadow: isSelected || hoveredCardId === report.id ? 'var(--shadow-layer-2)' : 'var(--shadow-near)',
                  transform: hoveredCardId === report.id ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="label-sm font-extrabold" style={{ color: categoryColor, letterSpacing: '0.05em' }}>{report.id}</span>
                    <span className="chip" style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {categoryIcon} {report.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {report.status === 'Pending' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-error)', animation: 'pulse-neon 1.2s infinite' }} />}
                    {report.status === 'In Progress' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse-neon-blue 1.2s infinite' }} />}
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
          })}
        </div>

        {/* Right: Report detail + actions */}
        <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '24px', backgroundColor: 'var(--color-surface-container-lowest)', overflow: 'hidden' }}>
          {rep ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="label-sm font-extrabold" style={{ color: 'var(--color-primary)', letterSpacing: '0.05em' }}>{rep.id}</span>
                  <span className="chip" style={{
                    fontSize: '11px', padding: '4px 10px',
                    background: rep.status === 'Resolved' ? 'var(--color-secondary-container)' : rep.status === 'In Progress' ? 'var(--color-primary-container)' : 'var(--color-tertiary-container)',
                    color: rep.status === 'Resolved' ? 'var(--color-on-secondary-container)' : rep.status === 'In Progress' ? 'var(--color-on-primary-container)' : 'var(--color-on-tertiary-container)',
                  }}>{rep.category}</span>
                </div>
                <h3 className="headline-sm" style={{ color: 'var(--color-on-surface)', fontSize: '18px', fontWeight: 800, lineBreak: 'anywhere' }}>{rep.title}</h3>
              </div>

              {/* Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
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

              {/* Description */}
              <div>
                <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '6px' }}>Citizen Incident Description</label>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-low)', borderLeft: '3px solid var(--color-outline-variant)', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-on-surface-variant)' }}>
                  &quot;{rep.description}&quot;
                </div>
              </div>

              {/* Status workflow */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '8px' }}>Update Workflow State</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'Pending', activeColor: 'var(--color-error)', bgColor: 'rgba(186, 26, 26, 0.1)' },
                    { id: 'In Progress', activeColor: 'var(--color-primary)', bgColor: 'rgba(53, 37, 205, 0.1)' },
                    { id: 'Resolved', activeColor: 'var(--color-secondary)', bgColor: 'rgba(0, 108, 73, 0.1)' },
                  ].map(st => {
                    const isCurrent = rep.status === st.id;
                    return (
                      <button
                        key={st.id}
                        id={`status-btn-${st.id.replace(' ', '-').toLowerCase()}`}
                        type="button"
                        onClick={() => onUpdateReport(rep.id, st.id as Report['status'], rep.assignee)}
                        style={{
                          flex: 1, minHeight: '40px',
                          borderRadius: 'var(--radius-full)',
                          border: isCurrent ? `2px solid ${st.activeColor}` : '1px solid var(--color-outline-variant)',
                          background: isCurrent ? st.bgColor : 'transparent',
                          color: isCurrent ? st.activeColor : 'var(--color-on-surface-variant)',
                          fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.activeColor }} />}
                        {st.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crew assignment */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '10px' }}>Allocate Field Crew & Engineer</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Unassigned card */}
                  <div
                    onClick={() => onUpdateReport(rep.id, rep.status, 'Unassigned')}
                    onMouseEnter={() => setHoveredWorkerName('Unassigned')}
                    onMouseLeave={() => setHoveredWorkerName(null)}
                    style={{
                      padding: '12px', borderRadius: 'var(--radius-md)',
                      border: rep.assignee === 'Unassigned' ? '2px solid var(--color-error)' : '1px solid var(--color-outline-variant)',
                      background: rep.assignee === 'Unassigned' ? 'rgba(186,26,26,0.05)' : hoveredWorkerName === 'Unassigned' ? 'var(--color-surface-container-low)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      transform: hoveredWorkerName === 'Unassigned' ? 'translateY(-1px)' : 'translateY(0)',
                      boxShadow: hoveredWorkerName === 'Unassigned' ? 'var(--shadow-near)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(186,26,26,0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>❌</div>
                    <div>
                      <p className="label-sm font-semibold" style={{ margin: 0, fontSize: '12px' }}>Unassigned</p>
                      <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>No field team</p>
                    </div>
                  </div>
                  {/* Engineer cards */}
                  {engineers.map(eng => {
                    const isCurrentAssignee = rep.assignee === eng.name;
                    const isBusy = eng.activeJobs >= 2;
                    return (
                      <div
                        key={eng.id}
                        onClick={() => onUpdateReport(rep.id, rep.status, eng.name)}
                        onMouseEnter={() => setHoveredWorkerName(eng.name)}
                        onMouseLeave={() => setHoveredWorkerName(null)}
                        style={{
                          padding: '12px', borderRadius: 'var(--radius-md)',
                          border: isCurrentAssignee ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                          background: isCurrentAssignee ? 'rgba(53,37,205,0.05)' : hoveredWorkerName === eng.name ? 'var(--color-surface-container-low)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                          transform: hoveredWorkerName === eng.name ? 'translateY(-1px)' : 'translateY(0)',
                          boxShadow: hoveredWorkerName === eng.name ? 'var(--shadow-near)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isCurrentAssignee ? 'var(--color-primary)' : 'var(--color-surface-container-high)', color: isCurrentAssignee ? '#fff' : 'var(--color-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                          {eng.name.split(' ').map(n => n[0]).join('')}
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

              {/* Audit Log */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px', marginTop: '4px' }}>
                <label className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '10px' }}>Dispatch Audit Log</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: '6px', top: '4px', bottom: '4px', width: '2px', backgroundColor: 'var(--color-surface-container-high)' }} />
                  {[
                    { dot: 'var(--color-secondary)', title: 'Ticket Submitted', sub: `Logged by citizen ${rep.reporter} in ${rep.ward}` },
                    { dot: rep.assignee !== 'Unassigned' ? 'var(--color-primary)' : 'var(--color-outline)', title: 'Crew Dispatched', sub: rep.assignee !== 'Unassigned' ? `Assigned engineer: ${rep.assignee}` : 'Pending crew allocation' },
                    { dot: rep.status === 'Resolved' ? 'var(--color-secondary)' : 'var(--color-outline)', title: 'Resolution Completed', sub: rep.status === 'Resolved' ? 'Marked resolved by assignee' : 'In progress toward resolution' },
                  ].map((item, i) => (
                    <div key={i} style={{ position: 'relative', fontSize: '11px' }}>
                      <div style={{ position: 'absolute', left: '-18px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.dot }} />
                      <p className="label-sm font-bold" style={{ margin: 0, fontSize: '11px' }}>{item.title}</p>
                      <p className="label-sm" style={{ color: 'var(--color-outline)', fontSize: '9px', margin: 0 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Empty workload state */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(53,37,205,0.08)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FaFileAlt style={{ fontSize: '28px' }} />
                </div>
                <h3 className="headline-sm">Municipal Control Center</h3>
                <p className="body-sm" style={{ color: 'var(--color-outline)', marginTop: '4px', maxWidth: '320px', margin: '4px auto 0 auto' }}>
                  Select a ticket from the feed to view dispatch history, update resolution states, and allocate municipal field crews.
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '20px' }}>
                <h4 className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Ward Health Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { label: 'Dispatcher Backlog', count: reports.filter(r => r.status === 'Pending').length, total: reports.length, color: 'var(--color-error)' },
                    { label: 'Active Operations', count: reports.filter(r => r.status === 'In Progress').length, total: reports.length, color: 'var(--color-primary)' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
                      <p className="label-sm" style={{ color: 'var(--color-outline)', margin: 0 }}>{s.label}</p>
                      <p className="headline-sm" style={{ fontWeight: 800, marginTop: '4px', color: s.color, margin: 0 }}>{s.count} {s.label.includes('Backlog') ? 'Pending' : 'In Progress'}</p>
                      <div style={{ width: '100%', height: '4px', background: `${s.color}22`, borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${(s.count / (s.total || 1)) * 100}%`, height: '100%', background: s.color }} />
                      </div>
                    </div>
                  ))}
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
              <div style={{ background: 'rgba(53,37,205,0.03)', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <p className="label-sm font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px', marginTop: 0 }}>FIELD OPERATIONS CAPACITY</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {engineers.map(eng => (
                    <div key={eng.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
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
  );
}
