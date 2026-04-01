import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function StatCard({ label, value, icon: Icon, color = 'blue', change, suffix = '' }) {
  const colorMap = {
    blue:   { bg: 'rgba(59,130,246,0.1)',   text: 'var(--accent-blue-bright)', border: 'rgba(59,130,246,0.2)' },
    purple: { bg: 'rgba(139,92,246,0.1)',   text: 'var(--accent-purple)',      border: 'rgba(139,92,246,0.2)' },
    green:  { bg: 'rgba(16,185,129,0.1)',   text: 'var(--accent-green)',       border: 'rgba(16,185,129,0.2)' },
    yellow: { bg: 'rgba(245,158,11,0.1)',   text: 'var(--accent-yellow)',      border: 'rgba(245,158,11,0.2)' },
    cyan:   { bg: 'rgba(6,182,212,0.1)',    text: 'var(--accent-cyan)',        border: 'rgba(6,182,212,0.2)' },
    red:    { bg: 'rgba(239,68,68,0.1)',    text: 'var(--accent-red)',         border: 'rgba(239,68,68,0.2)' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 12 }}>
            {label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value ?? '—'}{suffix}
          </div>
          {change !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 8,
              fontSize: 12, color: change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {change >= 0
                ? <ArrowUpIcon style={{ width: 12, height: 12 }} />
                : <ArrowDownIcon style={{ width: 12, height: 12 }} />}
              {Math.abs(change)}% vs last period
            </div>
          )}
        </div>
        {Icon && (
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: c.bg, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon style={{ width: 22, height: 22, color: c.text }} />
          </div>
        )}
      </div>
    </div>
  );
}
