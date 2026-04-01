import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { CreditCardIcon, CheckIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const PLAN_COLORS = {
  free:       { accent: 'var(--text-muted)',    bg: 'rgba(148,163,184,0.08)', border: 'var(--border)' },
  basic:      { accent: 'var(--accent-blue-bright)', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)' },
  pro:        { accent: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.35)' },
  enterprise: { accent: 'var(--accent-yellow)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' },
};

export default function Subscriptions() {
  const [plans, setPlans]             = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [cancelling, setCancelling]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          api.get('/subscriptions/plans'),
          api.get('/subscriptions/me'),
        ]);
        setPlans(plansRes.data.plans || []);
        setSubscription(subRes.data.subscription);
        setPayments(subRes.data.payments || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planId) => {
    setCheckoutLoading(planId);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const { data } = await api.post('/payments/checkout', { planId });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SaaS API Platform",
        description: "Subscription Upgrade",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert("Payment Successful! Your plan is now upgraded.");
            window.location.reload();
          } catch (err) {
            alert(err.response?.data?.message || "Payment Verification Failed");
          }
        },
        theme: { color: "#8b5cf6" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally { setCheckoutLoading(null); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setCancelling(true);
    try {
      await api.post('/subscriptions/cancel');
      setSubscription(prev => ({ ...prev, status: 'cancelled', cancel_at_period_end: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="loading-screen"><div className="spinner" style={{ width: 36, height: 36 }} /><span>Loading plans...</span></div>
  );

  const currentPlanName = subscription?.plan_name || 'free';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Subscription & Billing</h1>
        <p className="page-subtitle">Manage your plan, billing, and payment history</p>
      </div>

      {/* Current subscription banner */}
      {subscription && (
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {currentPlanName} Plan
              <span className={`badge badge-${subscription.status === 'active' ? 'green' : 'yellow'}`} style={{ marginLeft: 10, fontSize: 12 }}>
                {subscription.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {subscription.current_period_end
                ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                : 'Free plan — no expiry'}
            </div>
          </div>
          {currentPlanName !== 'free' && subscription.status === 'active' && (
            <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <XMarkIcon style={{ width: 14, height: 14 }} />}
              Cancel Plan
            </button>
          )}
        </div>
      )}

      {/* Plans grid */}
      <div className="section">
        <div className="section-title"><CreditCardIcon style={{ width: 18, height: 18 }} /> Available Plans</div>
        <div className="grid-4">
          {plans.map(plan => {
            const c = PLAN_COLORS[plan.name] || PLAN_COLORS.free;
            const isCurrent = plan.name === currentPlanName;
            const features = plan.features || {};
            const featureList = [
              `${plan.request_limit_daily.toLocaleString()} req/day`,
              `${plan.request_limit_monthly.toLocaleString()} req/month`,
              `${plan.max_projects === -1 ? 'Unlimited' : plan.max_projects} projects`,
              `${plan.max_api_keys === -1 ? 'Unlimited' : plan.max_api_keys} API keys`,
              features.analytics ? `${features.analytics} analytics` : null,
              features.ai_insights ? 'AI insights' : null,
              features.support ? `${features.support} support` : null,
            ].filter(Boolean);

            return (
              <div key={plan.id} style={{
                background: isCurrent ? c.bg : 'var(--bg-card)',
                border: `1px solid ${isCurrent ? c.border : 'var(--border)'}`,
                borderRadius: 16, padding: 24,
                transition: 'all 0.2s',
                position: 'relative',
                ...(plan.name === 'pro' ? { boxShadow: '0 0 32px rgba(139,92,246,0.15)' } : {}),
              }}>
                {plan.name === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, color: c.accent, textTransform: 'capitalize', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${plan.price_monthly === 0 ? '0' : plan.price_monthly}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mo</span>
                </div>
                <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {featureList.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <CheckIcon style={{ width: 15, height: 15, color: c.accent, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                {isCurrent ? (
                  <div className="btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'default', opacity: 0.7 }}>
                    Current Plan
                  </div>
                ) : plan.price_monthly === 0 ? null : (
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleCheckout(plan.id)} disabled={checkoutLoading === plan.id}>
                    {checkoutLoading === plan.id
                      ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Redirecting...</>
                      : <><ArrowTopRightOnSquareIcon style={{ width: 14, height: 14 }} /> Upgrade Now</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="section">
          <div className="section-title"><CreditCardIcon style={{ width: 18, height: 18 }} /> Payment History</div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Invoice</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>${p.amount} {p.currency?.toUpperCase()}</td>
                    <td><span className={`badge badge-${p.status === 'succeeded' ? 'green' : 'red'}`}>{p.status}</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.stripe_invoice_id?.substring(0, 20) || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
