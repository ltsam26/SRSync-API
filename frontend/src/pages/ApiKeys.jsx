import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ApiKeyCard from '../components/ApiKeyCard';
import { KeyIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function ApiKeys() {
  const { projectId } = useParams();
  const [projects, setProjects]   = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [keys, setKeys]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keyName, setKeyName]     = useState('');
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data.projects || []);
      if (!selectedProject && data.projects?.length > 0) {
        setSelectedProject(data.projects[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProject) { setLoading(false); return; }
    setLoading(true);
    api.get(`/keys/${selectedProject}`)
      .then(({ data }) => setKeys(data.keys || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(''); setGenerating(true);
    try {
      const { data } = await api.post('/keys/generate', { projectId: selectedProject, name: keyName });
      // Inject rawKey so it can be shown once
      setKeys(prev => [{ ...data.keyInfo, rawKey: data.apiKey, name: keyName || 'API Key', is_active: true }, ...prev]);
      setKeyName(''); setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate key');
    } finally { setGenerating(false); }
  };

  const handleRevoke = async (keyId) => {
    try {
      await api.patch(`/keys/revoke/${keyId}`);
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke key');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">API Keys</h1>
          <p className="page-subtitle">Generate and manage API keys for your projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedProject}>
          <PlusIcon style={{ width: 16, height: 16 }} /> Generate Key
        </button>
      </div>

      {/* Project selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          <FolderIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />Select Project
        </label>
        <select
          id="project-select"
          className="input-field"
          style={{ maxWidth: 320 }}
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
        >
          <option value="">-- Choose a project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Generate form */}
      {showForm && selectedProject && (
        <div className="glass-card slide-in" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Generate New API Key</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Key Name (optional)</label>
              <input id="key-name" type="text" className="input-field" placeholder="e.g. Production Key"
                value={keyName} onChange={e => setKeyName(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={generating}>
              {generating ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Generating...</> : <><KeyIcon style={{ width: 14, height: 14 }} /> Generate</>}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
          </form>
        </div>
      )}

      {/* Keys list */}
      {!selectedProject ? (
        <div className="empty-state">
          <FolderIcon style={{ width: 56, height: 56 }} />
          <h3>Select a project</h3>
          <p>Choose a project above to view and manage its API keys.</p>
        </div>
      ) : loading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
      ) : keys.length === 0 ? (
        <div className="empty-state">
          <KeyIcon style={{ width: 56, height: 56 }} />
          <h3>No API keys yet</h3>
          <p>Generate your first API key to start making authenticated requests.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <PlusIcon style={{ width: 16, height: 16 }} /> Generate First Key
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {keys.map(k => (
            <ApiKeyCard key={k.id} keyData={k} onRevoke={handleRevoke} />
          ))}
        </div>
      )}
    </div>
  );
}
