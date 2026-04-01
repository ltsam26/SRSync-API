import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  HomeIcon, FolderIcon, KeyIcon, ChartBarIcon,
  CreditCardIcon, CogIcon, UsersIcon, ShieldCheckIcon,
  ArrowRightOnRectangleIcon, CommandLineIcon, TagIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     icon: HomeIcon },
  { to: '/projects',      label: 'Projects',       icon: FolderIcon },
  { to: '/keys',          label: 'API Keys',       icon: KeyIcon },
  { to: '/analytics',     label: 'Analytics',      icon: ChartBarIcon },
  { to: '/subscriptions', label: 'Subscription',   icon: CreditCardIcon },
  { to: '/settings',      label: 'Settings',       icon: CogIcon },
];

const adminItems = [
  { to: '/admin',         label: 'Admin Home',     icon: ShieldCheckIcon },
  { to: '/admin/users',   label: 'Users',          icon: UsersIcon },
  { to: '/admin/plans',   label: 'Plans',          icon: TagIcon },
];

export default function Sidebar({ isAdmin }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = isAdmin ? [...adminItems] : navItems;

  // If admin user is on user dashboard, also show admin link
  const showAdminLink = !isAdmin && user?.role === 'admin';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '0',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CommandLineIcon style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              SRSync API
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isAdmin ? 'Admin Panel' : 'Developer Platform'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '0 8px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {isAdmin ? 'Admin Navigation' : 'Navigation'}
        </div>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              transition: 'all 0.15s ease',
              background: isActive
                ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.10))'
                : 'transparent',
              color: isActive ? 'var(--accent-blue-bright)' : 'var(--text-secondary)',
              border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
            })}
          >
            <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}

        {showAdminLink && (
          <>
            <div style={{ borderTop: '1px solid var(--border)', margin: '12px 8px', paddingTop: '12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '0 0 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Admin
              </div>
              <NavLink
                to="/admin"
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px',
                  textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                  background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                })}
              >
                <ShieldCheckIcon style={{ width: 18, height: 18 }} />
                Admin Panel
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
