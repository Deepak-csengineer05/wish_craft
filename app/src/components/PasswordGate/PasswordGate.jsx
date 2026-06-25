import React, { useState, useRef } from 'react';
import { useGift } from '../../context/GiftContext';
import { trackEvent } from '../../analytics';
import './PasswordGate.css';

export default function PasswordGate({ onUnlock, onyourLogin }) {
  const { giftId, config } = useGift();
  const [value, setValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const CORRECT_PASSWORD = config?.user_password || 'Wish@17';
  const your_PASSWORD = config?.your_password || 'your@17';
  const recipientName = config?.recipient_name || 'Friend';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (value === your_PASSWORD && onyourLogin) {
      onyourLogin();
      return;
    }
    if (value === CORRECT_PASSWORD) {
      localStorage.setItem(`wish_unlocked_${giftId}`, 'true');
      onUnlock();
    } else {
      // Send the actual typed incorrect password to Supabase Analytics
      trackEvent(giftId, 'PasswordGate', 'failed_attempt', { attempted: value, length: value.length });
      setShaking(true);
      setError(`Are you ${recipientName}? This vault was made only for them — you don't have permission to open it.`);
      setValue('');
      setTimeout(() => setShaking(false), 650);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="gate-page">
      <form
        className={`gate-card ${shaking ? 'shake' : ''}`}
        onSubmit={handleSubmit}
        noValidate
        aria-label="Unlock the gift"
      >
        <div className="gate-shadow" />

        {/* Icon button */}
        <button className="gate-icon-btn" type="submit" aria-label="Unlock">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </button>

        {/* Password input */}
        <input
          ref={inputRef}
          className="gate-input"
          type="password"
          placeholder="Enter the password..."
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          autoFocus
          autoComplete="off"
        />
      </form>

      {/* Error outside card so card doesn't shift */}
      {error && (
        <p className={`gate-error ${error ? 'gate-error--visible' : ''}`}>
          {error}
        </p>
      )}
    </div>
  );
}
