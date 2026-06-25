import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const getAuthEmail = (input) => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) {
      return trimmed;
    }
    // Convert plain usernames to fake emails for Supabase Auth compatibility
    return `${trimmed.toLowerCase()}@wish-craft.local`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password || (activeTab === 'signup' && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authEmail = getAuthEmail(usernameOrEmail);

      if (activeTab === 'signin') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password
        });
        if (authError) throw authError;
        navigate('/dashboard');
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });
        if (authError) throw authError;
        setSuccessMessage('Registration successful! You can now log in directly.');
        setActiveTab('signin');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-root auth-theme-${activeTab}`}>
      <div className="auth-glow-orb orb-teal" />
      <div className="auth-glow-orb orb-blue" />
      <div className="auth-glow-orb orb-dark" />

      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
           Wish Craft
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab-slider ${activeTab}`} />
          <button 
            className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setError(''); setSuccessMessage(''); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); setSuccessMessage(''); }}
          >
            Sign Up
          </button>
        </div>

        {successMessage && (
          <div className="auth-success" style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#4ade80',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form key={activeTab} onSubmit={handleSubmit} noValidate>
          {activeTab === 'signup' && (
            <div className="auth-group">
              <label className="auth-label">Your Name</label>
              <input 
                type="text" 
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sophia"
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div className="auth-group">
            <label className="auth-label">Username or Email Address</label>
            <input 
              type="text" 
              className="auth-input"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="e.g. sophia or name@domain.com"
              autoComplete="username"
              autoFocus={activeTab === 'signin'}
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="auth-input auth-input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          {activeTab === 'signin' ? (
            <>
              New to Wish Craft?{' '}
              <span onClick={() => { setActiveTab('signup'); setError(''); }}>
                Create an account
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={() => { setActiveTab('signin'); setError(''); }}>
                Sign in here
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
