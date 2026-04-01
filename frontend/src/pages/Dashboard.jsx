import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import StatCard from '../components/StatCard';
import {
  ChartBarIcon, KeyIcon, FolderIcon, BoltIcon,
  ArrowRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, projRes, subRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/projects'),
          api.get('/subscriptions/me'),
        ]);
        setSummary(sumRes.data.summary);
        setProjects(projRes.data.projects || []);
        setSubscription(subRes.data.subscription);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const planColors = { free: 'gray', basic: 'blue', pro: 'purple', enterprise: 'yellow' };
  const planName = subscription?.plan_name || 'free';

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'} 👋
          </h1>
          <p className="page-subtitle">Here's an overview of your API activity</p>
        </div>
        <span className={`badge badge-${planColors[planName]}`} style={{ fontSize: 13, padding: '6px 14px' }}>
          {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
        </span>
      </div>

      {/* Stats */}
      <div className="grid-4 section">
        <StatCard label="Requests Today"     value={Number(summary?.today || 0).toLocaleString()}      icon={BoltIcon}     color="blue"   />
        <StatCard label="Requests (7 days)"  value={Number(summary?.last_7_days || 0).toLocaleString()}  icon={ChartBarIcon} color="purple" />
        <StatCard label="Requests (30 days)" value={Number(summary?.last_30_days || 0).toLocaleString()} icon={ChartBarIcon} color="cyan"   />
        <StatCard label="Total Requests"     value={Number(summary?.total || 0).toLocaleString()}         icon={ChartBarIcon} color="green"  />
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-title"><SparklesIcon style={{ width: 18, height: 18 }} /> Quick Actions</div>
        <div className="grid-3">
          {[
            { to: '/projects', icon: FolderIcon, label: 'Create Project', desc: 'Organize your APIs into projects', color: 'blue' },
            { to: '/keys',     icon: KeyIcon,    label: 'Generate API Key', desc: 'Get a key to start making requests', color: 'purple' },
            { to: '/analytics',icon: ChartBarIcon, label: 'View Analytics', desc: 'Monitor usage and detect anomalies', color: 'cyan' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 24, cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `rgba(${color === 'blue' ? '59,130,246' : color === 'purple' ? '139,92,246' : '6,182,212'},0.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: 20, height: 20, color: `var(--accent-${color})` }} />
                  </div>
                  <ArrowRightIcon style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="section">
        <div className="section-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FolderIcon style={{ width: 18, height: 18 }} /> Recent Projects</span>
          <Link to="/projects" style={{ fontSize: 13, color: 'var(--accent-blue-bright)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>
        {projects.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <FolderIcon style={{ width: 48, height: 48 }} />
            <h3>No projects yet</h3>
            <p style={{ marginBottom: 16 }}>Create your first project to start generating API keys.</p>
            <Link to="/projects" className="btn-primary">Create Project</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.slice(0, 5).map(p => (
              <div key={p.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderIcon style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Created {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link to={`/keys/${p.id}`} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                  View Keys
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
