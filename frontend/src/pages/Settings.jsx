import React, { useState } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { UserCircleIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [savingPw, setSavingPw]     = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setProfileMsg(null);
    try {
      const { data } = await api.put('/user/profile', profile);
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' }); return;
    }
    if (pw.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return;
    }
    setSavingPw(true); setPwMsg(null);
    try {
      await api.put('/user/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
    } finally { setSavingPw(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and account security</p>
      </div>

      <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Profile */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCircleIcon style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} /> Profile Information
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Update your display name and email address.</p>

          {profileMsg && <div className={`alert alert-${profileMsg.type === 'success' ? 'success' : 'error'}`}>{profileMsg.text}</div>}

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: 'white',
            }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
              <span className={`badge badge-${user?.role === 'admin' ? 'yellow' : 'blue'}`} style={{ marginTop: 6 }}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input id="settings-name" type="text" className="input-field" placeholder="John Doe"
                  value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input id="settings-email" type="email" className="input-field" placeholder="you@example.com"
                  value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><CheckCircleIcon style={{ width: 14, height: 14 }} /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* Password */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LockClosedIcon style={{ width: 20, height: 20, color: 'var(--accent-purple)' }} /> Change Password
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Use a strong password with at least 6 characters.</p>

          {pwMsg && <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'error'}`}>{pwMsg.text}</div>}

          <form onSubmit={handlePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {[
                { id: 'pw-current', key: 'currentPassword', label: 'Current Password' },
                { id: 'pw-new',     key: 'newPassword',     label: 'New Password' },
                { id: 'pw-confirm', key: 'confirm',         label: 'Confirm New Password' },
              ].map(({ id, key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input id={id} type="password" className="input-field" placeholder="••••••••"
                    value={pw[key]} onChange={e => setPw({ ...pw, [key]: e.target.value })} required />
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary" disabled={savingPw}>
              {savingPw ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Updating...</> : <><LockClosedIcon style={{ width: 14, height: 14 }} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
