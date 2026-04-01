import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FolderIcon, PlusIcon, TrashIcon, FolderPlusIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [error, setError]       = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(''); setCreating(true);
    try {
      await api.post('/projects', { name: name.trim(), description: desc.trim() });
      setName(''); setDesc(''); setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setCreating(false); }
  };

  if (loading) return (
    <div className="loading-screen"><div className="spinner" style={{ width: 36, height: 36 }} /><span>Loading projects...</span></div>
  );

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Organize your API keys by project</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusIcon style={{ width: 16, height: 16 }} /> New Project
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card slide-in" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderPlusIcon style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} /> Create New Project
          </h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Project Name *</label>
                <input id="proj-name" type="text" className="input-field" placeholder="My Awesome API"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                <input id="proj-desc" type="text" className="input-field" placeholder="Optional description"
                  value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : <><PlusIcon style={{ width: 14, height: 14 }} /> Create</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderIcon style={{ width: 64, height: 64 }} />
          <h3>No projects yet</h3>
          <p>Projects help you organize API keys for different apps or environments.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <PlusIcon style={{ width: 16, height: 16 }} /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24,
              transition: 'all 0.2s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderIcon style={{ width: 22, height: 22, color: 'var(--accent-blue-bright)' }} />
                </div>
                <span className="badge badge-green">Active</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, minHeight: 40 }}>
                {p.description || 'No description provided.'}
              </p>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Created {new Date(p.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
              </div>
              <a href={`/keys/${p.id}`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                <KeyIcon style={{ width: 14, height: 14, ... {} }} /> Manage Keys
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line
import { KeyIcon } from '@heroicons/react/24/outline';
