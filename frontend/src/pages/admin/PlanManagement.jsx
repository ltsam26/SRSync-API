import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { TagIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/admin/plans');
      setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const handleEditClick = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      price_monthly: plan.price_monthly,
      request_limit_daily: plan.request_limit_daily,
      request_limit_monthly: plan.request_limit_monthly,
      max_projects: plan.max_projects,
      max_api_keys: plan.max_api_keys,
    });
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/admin/plans/${id}`, {
        price_monthly: Number(editForm.price_monthly),
        request_limit_daily: Number(editForm.request_limit_daily),
        request_limit_monthly: Number(editForm.request_limit_monthly),
        // we can also support updating max_projects, etc if API allows, but let's stick to these for now
      });
      setEditingPlan(null);
      loadPlans();
    } catch (e) {
      alert('Failed to update plan limits');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Plan Management</h1>
        <p className="page-subtitle">Configure subscription limits and pricing.</p>
      </div>

      <div className="grid-2 section">
        {plans.map(plan => (
          <div key={plan.id} className="glass-card" style={{ padding: 24, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TagIcon style={{ width: 24, height: 24, color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>{plan.name}</h3>
              </div>
              {editingPlan !== plan.id ? (
                <button onClick={() => handleEditClick(plan)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                  <PencilIcon style={{ width: 14 }} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSave(plan.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                    <CheckIcon style={{ width: 14 }} /> Save
                  </button>
                  <button onClick={() => setEditingPlan(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Monthly Price ($)</label>
                {editingPlan === plan.id ? (
                  <input type="number" className="input-field" value={editForm.price_monthly} onChange={e => setEditForm({...editForm, price_monthly: e.target.value})} />
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 500 }}>${plan.price_monthly}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Daily Request Limit</label>
                {editingPlan === plan.id ? (
                  <input type="number" className="input-field" value={editForm.request_limit_daily} onChange={e => setEditForm({...editForm, request_limit_daily: e.target.value})} />
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{plan.request_limit_daily.toLocaleString()}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Monthly Request Limit</label>
                {editingPlan === plan.id ? (
                  <input type="number" className="input-field" value={editForm.request_limit_monthly} onChange={e => setEditForm({...editForm, request_limit_monthly: e.target.value})} />
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{plan.request_limit_monthly.toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
