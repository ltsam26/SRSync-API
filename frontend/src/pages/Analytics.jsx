import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../components/StatCard';
import { ChartBarIcon, BoltIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const PERIOD_OPTIONS = [
  { label: '24h', value: 1 },
  { label: '7d',  value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.value.toLocaleString()} requests</div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [period, setPeriod]             = useState(7);
  const [summary, setSummary]           = useState(null);
  const [daily, setDaily]               = useState([]);
  const [hourly, setHourly]             = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [anomalies, setAnomalies]       = useState(null);
  const [prediction, setPrediction]     = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sumRes, usageRes, topRes, anomRes, predRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get(`/analytics/usage?period=${period}`),
          api.get('/analytics/top-endpoints'),
          api.get('/analytics/anomalies'),
          api.get('/analytics/predict'),
        ]);
        setSummary(sumRes.data.summary);
        setDaily(usageRes.data.daily || []);
        setHourly(usageRes.data.hourly || []);
        setTopEndpoints(topRes.data.endpoints || []);
        setAnomalies(anomRes.data.anomalies);
        setPrediction(predRes.data.prediction);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  // Build full hourly array 0-23
  const hourlyFull = Array.from({ length: 24 }, (_, h) => {
    const found = hourly.find(r => parseInt(r.hour) === h);
    return { hour: `${h}:00`, count: found ? parseInt(found.request_count) : 0 };
  });

  if (loading) return (
    <div className="loading-screen"><div className="spinner" style={{ width: 36, height: 36 }} /><span>Loading analytics...</span></div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Monitor API traffic, detect anomalies, and predict future usage</p>
      </div>

      {/* Summary stats */}
      <div className="grid-4 section">
        <StatCard label="Today"    value={Number(summary?.today || 0).toLocaleString()}      icon={BoltIcon}     color="blue"   />
        <StatCard label="7 Days"   value={Number(summary?.last_7_days || 0).toLocaleString()}  icon={ChartBarIcon} color="purple" />
        <StatCard label="30 Days"  value={Number(summary?.last_30_days || 0).toLocaleString()} icon={ChartBarIcon} color="cyan"   />
        <StatCard label="All Time" value={Number(summary?.total || 0).toLocaleString()}         icon={ChartBarIcon} color="green"  />
      </div>

      {/* Period toggle + line chart */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            <ChartBarIcon style={{ width: 18, height: 18 }} /> Request Trend
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIOD_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPeriod(opt.value)} style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: period === opt.value ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-card)',
                color: period === opt.value ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${period === opt.value ? 'transparent' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 16px 12px' }}>
          {daily.length === 0 ? (
            <div className="empty-state" style={{ padding: 40, color: 'var(--text-muted)' }}>No data for this period yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily.map(d => ({ date: d.date, requests: parseInt(d.request_count) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="requests" stroke="var(--accent-blue)" strokeWidth={2.5}
                  dot={{ fill: 'var(--accent-blue)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid-2 section">
        {/* Hourly bar chart */}
        <div>
          <div className="section-title"><BoltIcon style={{ width: 18, height: 18 }} /> Today by Hour</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 12px 12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyFull}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false}
                  interval={3} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hourlyFull.map((_, i) => <Cell key={i} fill={`rgba(139,92,246,${0.4 + i / 40})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top endpoints */}
        <div>
          <div className="section-title"><ChartBarIcon style={{ width: 18, height: 18 }} /> Top Endpoints</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            {topEndpoints.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '24px 0', textAlign: 'center' }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topEndpoints.slice(0, 6).map((ep, i) => {
                  const max = parseInt(topEndpoints[0].request_count);
                  const pct = (parseInt(ep.request_count) / max) * 100;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          <span style={{ color: 'var(--accent-cyan)', marginRight: 6 }}>{ep.method}</span>{ep.endpoint}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{Number(ep.request_count).toLocaleString()}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2 section">
        {/* Anomalies */}
        <div>
          <div className="section-title"><ExclamationTriangleIcon style={{ width: 18, height: 18, color: 'var(--accent-yellow)' }} /> Anomaly Detection</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            {!anomalies || anomalies.anomalies?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)' }}>No anomalies detected</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Traffic looks normal based on {anomalies?.totalDaysAnalyzed || 0} days</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Found {anomalies.anomalies.length} anomalous day(s) · avg: {anomalies.mean} req/day · σ: {anomalies.std}
                </div>
                {anomalies.anomalies.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{a.date}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.count.toLocaleString()} req</span>
                      <span className={`badge ${a.type === 'spike' ? 'badge-red' : 'badge-yellow'}`}>{a.type} z={a.zscore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Prediction */}
        <div>
          <div className="section-title"><SparklesIcon style={{ width: 18, height: 18, color: 'var(--accent-purple)' }} /> 7-Day Forecast</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            {!prediction?.prediction?.length ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>Not enough data to forecast</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <span className={`badge ${prediction.model?.trend === 'increasing' ? 'badge-green' : prediction.model?.trend === 'decreasing' ? 'badge-red' : 'badge-blue'}`}>
                    {prediction.model?.trend} trend
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>R²={prediction.model?.rSquared}</span>
                </div>
                {prediction.prediction.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.date}</span>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>~{p.predictedCount.toLocaleString()} req</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
