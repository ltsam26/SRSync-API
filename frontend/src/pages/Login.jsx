import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import axios from 'axios';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user data from Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        
        // Pass info to our backend to generate JWT token / provision local account
        const backendRes = await api.post('/auth/google', {
          email: userInfo.data.email,
          name: userInfo.data.name,
          googleId: userInfo.data.sub
        });
        
        login(backendRes.data.token, backendRes.data.user);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to securely log in with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login window closed or failed.');
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
          marginBottom: '2.5rem',
          letterSpacing: '-0.5px'
        }}>
          Login to Your Account
        </h1>

        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Email Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
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
                padding: '14px 16px',
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
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="+1 340 57823"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
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

          {/* Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem' }}>
            <input 
              type="checkbox" 
              id="remember"
              style={{ 
                width: '18px', height: '18px', 
                accentColor: '#9f67a7',
                cursor: 'pointer'
              }} 
            />
            <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#4b5563', cursor: 'pointer' }}>
              Remember me
            </label>
          </div>

          {/* Login Button */}
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
              marginTop: '0.5rem',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <a href="#" style={{ fontSize: '0.85rem', color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
            Forgot Password?
          </a>
        </div>

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
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#9f67a7', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
