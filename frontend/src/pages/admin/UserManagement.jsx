import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { UsersIcon, CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      loadUsers(); // Refresh list to get updated data
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '50vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">View and manage platform users</p>
      </div>

      <div className="section">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name || 'No Name'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'yellow' : 'gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.is_active ? 'green' : 'red'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {u.plan_name || 'Free'}
                  </td>
                  <td>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        className={`btn-${u.is_active ? 'danger' : 'secondary'}`} 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        {u.is_active ? <><NoSymbolIcon style={{width: 14}}/> Disable</> : <><CheckCircleIcon style={{width: 14}}/> Enable</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
             <div className="empty-state">
                <UsersIcon style={{ width: 48, height: 48 }} />
                <h3>No users found</h3>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
