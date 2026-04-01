import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await api.post('/auth/signup', { name: fullName, email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const backendRes = await api.post('/auth/google', {
          email: userInfo.data.email,
          name: userInfo.data.name,
          googleId: userInfo.data.sub
        });
        login(backendRes.data.token, backendRes.data.user);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to securely register with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-In window closed or failed.');
    }
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      background: 'linear-gradient(135deg, #faf7fc 0%, #f1f6fa 100%)',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1a1820',
          textAlign: 'center',
          marginBottom: '2rem',
          letterSpacing: '-0.5px'
        }}>
          Create Your Account
        </h1>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>Account created!</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Name Fields Array */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid transparent',
                      fontSize: '0.95rem',
                      color: '#111827',
                      background: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid transparent',
                      fontSize: '0.95rem',
                      color: '#111827',
                      background: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john.doe@gmail.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    fontSize: '0.95rem',
                    color: '#111827',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="**********"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    fontSize: '0.95rem',
                    color: '#111827',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '2px'
                  }}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="**********"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    fontSize: '0.95rem',
                    color: '#111827',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '2px'
                  }}
                />
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  style={{ 
                    width: '16px', height: '16px', 
                    accentColor: '#9f67a7',
                    cursor: 'pointer'
                  }} 
                />
                <label htmlFor="terms" style={{ fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                  I agree to the Terms and Conditions
                </label>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#9f67a7',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  marginTop: '0.25rem',
                  marginBottom: '1rem',
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Creating...' : 'Signup'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => handleGoogleAuth()}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="Google" />
                Sign in with Google
              </button>
              
              <button 
                type="button"
                style={{
                  flex: 1,
                  minWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" width="22" alt="Teams" />
                Sign in with Team
              </button>
            </div>

            {/* Footer Link */}
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
              Already Have an Account ?{' '}
              <Link to="/login" style={{ color: '#9f67a7', fontWeight: 600, textDecoration: 'none' }}>
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
