import React, { useState } from 'react';
import { ClipboardDocumentIcon, TrashIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ApiKeyCard({ keyData, onRevoke }) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCopy = async () => {
    if (!keyData.rawKey) return;
    await navigator.clipboard.writeText(keyData.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '20px',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {keyData.name || 'API Key'}
          </div>
          <span className={`badge ${keyData.is_active ? 'badge-green' : 'badge-gray'}`}>
            {keyData.is_active ? 'Active' : 'Revoked'}
          </span>
        </div>
        {keyData.is_active && (
          <div style={{ display: 'flex', gap: 8 }}>
            {confirming ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { onRevoke(keyData.id); setConfirming(false); }} className="btn-danger" style={{ fontSize: 12, padding: '6px 12px' }}>
                  Confirm
                </button>
                <button onClick={() => setConfirming(false)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className="btn-danger">
                <TrashIcon style={{ width: 14, height: 14 }} /> Revoke
              </button>
            )}
          </div>
        )}
      </div>

      {/* Key display */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <code style={{
          fontSize: 13, color: keyData.rawKey ? 'var(--accent-cyan)' : 'var(--text-muted)',
          fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {keyData.rawKey || `${keyData.id?.substring(0, 8)}...••••••••••••••••`}
        </code>
        {keyData.rawKey && (
          <button onClick={handleCopy} title="Copy key" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
            transition: 'color 0.2s', flexShrink: 0,
          }}>
            {copied
              ? <><CheckIcon style={{ width: 16, height: 16 }} /> Copied!</>
              : <><ClipboardDocumentIcon style={{ width: 16, height: 16 }} /> Copy</>}
          </button>
        )}
      </div>

      {keyData.rawKey && (
        <div className="alert alert-info" style={{ marginBottom: 14, fontSize: 12, display: 'flex', gap: 8 }}>
          <ExclamationTriangleIcon style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          Copy this key now — it won't be shown again for security.
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>Rate limit: <span style={{ color: 'var(--text-secondary)' }}>{keyData.rate_limit || 100}/day</span></span>
        <span>Created: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(keyData.created_at)}</span></span>
        {keyData.last_used_at && <span>Last used: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(keyData.last_used_at)}</span></span>}
      </div>
    </div>
  );
}
