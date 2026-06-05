"use client";

import React from 'react';
import { FaCalendarAlt, FaCheck, FaCheckCircle } from 'react-icons/fa';

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

interface MyReportsTabProps {
  reports: Report[];
  onGoToReportIssue: () => void;
}

export default function MyReportsTab({ reports, onGoToReportIssue }: MyReportsTabProps) {
  return (
    <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', minHeight: '450px' }}>
      <h2 className="headline-md" style={{ marginBottom: 'var(--space-lg)' }}>My Filed Reports</h2>

      {reports.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xxl)', textAlign: 'center', color: 'var(--color-outline)' }}>
          <p className="body-lg">You haven&apos;t reported any issues yet.</p>
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={onGoToReportIssue}>Report Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reports.map(report => (
            <div
              key={report.id}
              className="bento-card"
              style={{ padding: 'var(--space-lg)', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', position: 'relative' }}
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

              {/* Timeline Progress */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', marginTop: '20px', paddingTop: '16px' }}>
                <p className="label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600, marginBottom: '12px' }}>TICKET RESOLUTION STEPS</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '600px' }}>
                  {/* Bar */}
                  <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '3px', backgroundColor: 'var(--color-surface-container-high)', zIndex: 1 }}>
                    <div style={{
                      width: report.status === 'Resolved' ? '100%' : report.status === 'In Progress' ? '50%' : '0%',
                      height: '100%',
                      backgroundColor: 'var(--color-primary)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  {/* Steps */}
                  {[
                    { label: 'Submitted', done: true, active: false },
                    { label: 'In Progress', done: report.status === 'Resolved', active: report.status === 'In Progress' },
                    { label: 'Resolved', done: report.status === 'Resolved', active: false },
                  ].map((step, idx) => (
                    <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        backgroundColor: step.done ? (idx === 2 ? 'var(--color-secondary)' : 'var(--color-primary)') : step.active ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: step.done || step.active ? '#fff' : 'var(--color-outline)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                      }}>
                        {step.done ? <FaCheck size={10} /> : <span>{idx + 1}</span>}
                      </div>
                      <span className="label-sm" style={{
                        marginTop: '4px',
                        fontWeight: step.done || step.active ? 700 : 500,
                        color: step.done ? (idx === 2 ? 'var(--color-secondary)' : 'var(--color-primary)') : step.active ? 'var(--color-primary)' : 'inherit',
                      }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Notes */}
              {report.status === 'Resolved' && report.resolutionNotes && (
                <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', borderRadius: 'var(--radius-default)', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid rgba(0, 108, 73, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
                    <FaCheckCircle size={14} />
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
  );
}
