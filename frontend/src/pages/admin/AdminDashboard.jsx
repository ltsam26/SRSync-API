import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { UsersIcon, FolderIcon, KeyIcon, BoltIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <span>Loading system stats...</span>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide statistics and overview</p>
      </div>

      <div className="grid-3 section">
        <StatCard label="Total Users" value={stats?.total_users ? Number(stats.total_users).toLocaleString() : '0'} icon={UsersIcon} color="blue" />
        <StatCard label="Total Projects" value={stats?.total_projects ? Number(stats.total_projects).toLocaleString() : '0'} icon={FolderIcon} color="purple" />
        <StatCard label="Active API Keys" value={stats?.active_keys ? Number(stats.active_keys).toLocaleString() : '0'} icon={KeyIcon} color="cyan" />
        <StatCard label="Requests (24h)" value={stats?.requests_today ? Number(stats.requests_today).toLocaleString() : '0'} icon={BoltIcon} color="green" />
        <StatCard label="Requests (7d)" value={stats?.requests_7d ? Number(stats.requests_7d).toLocaleString() : '0'} icon={BoltIcon} color="yellow" />
        <StatCard label="Active Subscriptions" value={stats?.active_subscriptions ? Number(stats.active_subscriptions).toLocaleString() : '0'} icon={CreditCardIcon} color="blue" />
      </div>
    </div>
  );
}
