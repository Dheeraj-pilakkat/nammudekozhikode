"use client";

import React, { useState } from 'react';

interface AnalyticsTabProps {
  reports: { status: string; category: string }[];
}

export default function AnalyticsTab({ reports }: AnalyticsTabProps) {
  const [analyticsDept, setAnalyticsDept] = useState('All Departments');
  const [analyticsYear, setAnalyticsYear] = useState('2026');
  const [analyticsMonth, setAnalyticsMonth] = useState('All Months');

  const getChartData = () => {
    let baseData = [40, 65, 30, 80, 55, 90, 70, 85, 100, 60, 45, 75];
    if (analyticsDept === 'Roads') baseData = [15, 25, 10, 30, 20, 35, 25, 30, 40, 20, 15, 25];
    if (analyticsDept === 'Water') baseData = [10, 15, 5, 20, 10, 25, 15, 20, 25, 15, 10, 20];
    if (analyticsYear === '2025') baseData = [30, 50, 40, 70, 45, 80, 60, 95, 85, 50, 35, 60];
    baseData[5] = reports.length * 12;
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

  return (
    <div className="awwwards-bento-card col-span-4 stagger-fade-up" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h2 className="headline-md" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', lineHeight: '1.6' }}>
          <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>Visualizing resolution trends for</span>
          <select
            id="analytics-dept"
            value={analyticsDept}
            onChange={e => setAnalyticsDept(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="All Departments">all departments</option>
            <option value="Roads">roads & transport</option>
            <option value="Water">water & sanitation</option>
            <option value="Electricity">electricity</option>
          </select>
          <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>in year</span>
          <select
            id="analytics-year"
            value={analyticsYear}
            onChange={e => setAnalyticsYear(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </h2>
      </div>

      {/* Bar Chart */}
      <div className="bento-card" style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--color-surface-container-lowest)', position: 'relative' }}>
        <div style={{ position: 'relative', height: '320px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
          {/* Grid lines */}
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
              <div style={{ width: '70%', background: 'linear-gradient(to top, var(--color-primary-container), var(--color-primary))', height: `${(val / maxChartValue) * 100}%`, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', transition: 'height 0.5s ease' }} />
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
  );
}
