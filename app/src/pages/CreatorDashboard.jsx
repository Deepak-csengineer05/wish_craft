import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './CreatorDashboard.css';

export default function CreatorDashboard() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(''); // e.g. `${gift.id}-recipient`
  const navigate = useNavigate();

  const fetchGifts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.error('Error fetching gifts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
      } else {
        setCreator(user);
        fetchGifts(user.id);
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDelete = async (giftId) => {
    if (deleteConfirmId !== giftId) {
      setDeleteConfirmId(giftId);
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === giftId ? null : prev);
      }, 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId);

      if (error) throw error;
      setGifts(prev => prev.filter(g => g.id !== giftId));
      setInfoMessage('Memory vault deleted successfully.');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (err) {
      setErrorMessage('Failed to delete gift: ' + err.message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setInfoMessage(`${label} copied to clipboard!`);
    setTimeout(() => {
      setInfoMessage(null);
      setCopiedKey('');
    }, 2500);
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 0) return '0s';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="db-root">
      <div className="db-container">

        {errorMessage && (
          <div className="ch-error-banner" style={{
            background: 'rgba(255, 85, 85, 0.1)',
            border: '1px solid rgba(255, 85, 85, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ff5555',
            fontSize: '0.95rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚠️</span>
              <div>{errorMessage}</div>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        )}

        {infoMessage && (
          <div className="ch-info-banner" style={{
            background: 'rgba(179, 157, 219, 0.1)',
            border: '1px solid rgba(179, 157, 219, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#b39ddb',
            fontSize: '0.95rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>✨</span>
              <div>{infoMessage}</div>
            </div>
            <button 
              onClick={() => setInfoMessage(null)} 
              style={{ background: 'none', border: 'none', color: '#b39ddb', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Bar */}
        <header className="db-header">
          <div className="db-user-info">
            <h1 className="db-title">Creator Dashboard 🌙</h1>
            {creator && (
              <span className="db-user-email">
                Logged in as: {creator.user_metadata?.name || (creator.email.endsWith('@wish-craft.local') ? creator.email.split('@')[0] : creator.email)}
              </span>
            )}
          </div>
          <div className="db-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/builder')}>
              Create New Gift <span>+</span>
            </button>
            <button className="lp-btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#h39ddd' }}>
            Loading your memory vault...
          </div>
        ) : gifts.length > 0 ? (
          <div className="db-grid">
            {gifts.map(gift => {
              const origin = window.location.origin;
              const recipientUrl = `${origin}/gift/${gift.id}`;
              const yourUrl = `${origin}/gift/${gift.id}/your`;

              // Count active sections in config
              const activeCount = Object.values(gift.active_sections || {}).filter(Boolean).length;

              return (
                <div
                  key={gift.id}
                  className="db-card"
                  style={{ '--glow-color': `hsla(${gift.theme_hue || 198}, 70%, 55%, 0.2)` }}
                >
                  <div className="db-card-glow" />

                  <div>
                    <div className="db-card-header">
                      <div className="db-recipient-name">To: {gift.recipient_name}</div>
                      <span className="db-birthday-label">🎂 {gift.birthday}</span>
                    </div>

                    <div className="db-card-stats">
                      <div className="db-stat-item">
                        <span className="db-stat-val">{gift.visit_count || 0}</span>
                        <span className="db-stat-lbl">Visits</span>
                      </div>
                      <div className="db-stat-item">
                        <span className="db-stat-val">{formatDuration(gift.total_time_spent)}</span>
                        <span className="db-stat-lbl">Time Spent</span>
                      </div>
                      <div className="db-stat-item">
                        <span className="db-stat-val">{activeCount}/11</span>
                        <span className="db-stat-lbl">Sections</span>
                      </div>
                    </div>

                    <div className="db-link-group">
                      <div className="db-link-row">
                        <span className="db-link-text">{recipientUrl}</span>
                        <button
                          className="db-copy-btn"
                          onClick={() => handleCopy(recipientUrl, `${gift.id}-recipient`, 'Recipient Link')}
                        >
                          {copiedKey === `${gift.id}-recipient` ? '✓ Copied!' : 'Copy Gift Link'}
                        </button>
                      </div>
                      <div className="db-link-row">
                        <span className="db-link-text">{yourUrl}</span>
                        <button
                          className="db-copy-btn"
                          onClick={() => handleCopy(yourUrl, `${gift.id}-your`, 'your Monitoring Link')}
                        >
                          {copiedKey === `${gift.id}-your` ? '✓ Copied!' : 'Copy your Link'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="db-card-actions">
                    <button className="db-btn-view" onClick={() => navigate(`/gift/${gift.id}`)}>
                      Test Gift 🎁
                    </button>
                    <button className="db-btn-your" onClick={() => navigate(`/gift/${gift.id}/your`)}>
                      Live Feed 📊
                    </button>
                    <button className="db-btn-icon" onClick={() => navigate(`/builder?edit=${gift.id}`)} title="Edit Configuration">
                      ✏️
                    </button>
                    <button 
                      className={`db-btn-icon delete ${deleteConfirmId === gift.id ? 'confirming' : ''}`} 
                      onClick={() => handleDelete(gift.id)} 
                      title={deleteConfirmId === gift.id ? "Click again to confirm delete!" : "Delete Template"}
                      style={deleteConfirmId === gift.id ? { background: 'rgba(255, 85, 85, 0.2)', border: '1px solid #ff5555' } : {}}
                    >
                      {deleteConfirmId === gift.id ? '⚠️' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="db-empty">
            <div className="db-empty-icon">💌</div>
            <h2 className="db-empty-title">Your vault is empty</h2>
            <p className="db-empty-desc">
              You haven't created any digital gifts yet. Take a moment to construct a memory timeline for a special friend.
            </p>
            <button className="lp-btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('/builder')}>
              Create Your First Gift <span>✦</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
