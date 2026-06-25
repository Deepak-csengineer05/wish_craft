import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { applyTheme } from '../utils/themeHelper';
import { DEFAULT_CONFIG } from '../utils/defaultConfigs';

const GiftContext = createContext(null);

export function useGift() {
  return useContext(GiftContext);
}

export function GiftProvider({ children, giftId }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!giftId) {
      setError('Missing Gift ID.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()
      .then(({ data, error: dbError }) => {
        if (dbError || !data) {
          setError('We could not find this memory vault. Verify your link address.');
        } else {
          // Merge database loaded configuration with the generic defaults
          const merged = {
            ...DEFAULT_CONFIG,
            ...data,
            config_data: {
              ...DEFAULT_CONFIG,
              ...(data.config_data || {})
            }
          };
          setConfig(merged);
          applyTheme(merged.theme_hue);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Connection error: ' + err.message);
        setLoading(false);
      });
  }, [giftId]);

  const value = {
    giftId,
    config,
    recipientName: config?.recipient_name || 'Friend',
    birthday: config?.birthday || '',
    activeSections: config?.active_sections || {},
    configData: config?.config_data || {},
    loading,
    error,
    isSectionActive: (name) => {
      if (!config) return false;
      return config.active_sections?.[name] !== false;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#010609',
        color: '#38bdf8',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite', marginBottom: '15px' }}>🌙</div>
          <div>Unsealing the memory vault...</div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#010609',
        color: '#ff8888',
        fontFamily: "'Inter', sans-serif",
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '440px',
          background: 'rgba(6, 31, 34, 0.4)',
          border: '1px solid rgba(255, 85, 85, 0.3)',
          padding: '40px 30px',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Vault Error</h2>
          <p style={{ lineHeight: '1.5', opacity: 0.8 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <GiftContext.Provider value={value}>
      {children}
    </GiftContext.Provider>
  );
}
