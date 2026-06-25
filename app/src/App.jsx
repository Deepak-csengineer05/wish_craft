import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import PasswordGate from './components/PasswordGate/PasswordGate';
import BirthdayExperience from './pages/BirthdayExperience';
import YourDashboard from './pages/YourDashboard';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorHub from './pages/CreatorHub';
import { GiftProvider, useGift } from './context/GiftContext';
import { recordVisit, updateTimeSpent, ping } from './analytics';
import './index.css';

/* ── your Route wrapper ──────── */
function YourRoute() {
  const [yourUnlocked, setyourUnlocked] = useState(false);
  const { config } = useGift();

  if (!yourUnlocked) {
    return (
      <PasswordGate
        onUnlock={() => { }} // No-op for your path
        onyourLogin={() => setyourUnlocked(true)}
      />
    );
  }

  return <YourDashboard />;
}

/* ── Main Experience Route ───────────────────────── */
function MainRoute() {
  const { giftId, config } = useGift();
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(`wish_unlocked_${giftId}`) === 'true');
  const [fading, setFading] = useState(false);
  const [isRevisit, setIsRevisit] = useState(() => localStorage.getItem(`wish_unlocked_${giftId}`) === 'true');
  const navigate = useNavigate();

  // Track visit on mount for recipient experience
  useEffect(() => {
    if (giftId) {
      recordVisit(giftId);
      ping(giftId); // Immediate ping on load
    }
  }, [giftId]);

  // Periodically update time spent and ping online status
  useEffect(() => {
    if (!giftId) return;

    // 5-second interval for real-time ping
    const pingInterval = setInterval(() => {
      if (!document.hidden) {
        ping(giftId);
      }
    }, 5000);

    // 30-second interval for cumulative time tracking
    const timeInterval = setInterval(() => {
      updateTimeSpent(giftId);
    }, 30000);

    // Also update on page visibility change / unload
    const handleVisibility = () => {
      if (!document.hidden) ping(giftId);
      if (document.hidden) updateTimeSpent(giftId);
    };
    const handleBeforeUnload = () => {
      updateTimeSpent(giftId);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      clearInterval(timeInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateTimeSpent(giftId); // Final save on unmount
    };
  }, [giftId]);

  const handleUnlock = () => {
    setFading(true);
    setTimeout(() => {
      setIsRevisit(false);
      setUnlocked(true);
      setFading(false);
    }, 1500);
  };

  const handleyourLogin = () => {
    navigate(`/gift/${giftId}/your`);
  };

  if (unlocked) {
    return <BirthdayExperience isRevisit={isRevisit} />;
  }

  return (
    <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 1.5s ease' }}>
      <PasswordGate onUnlock={handleUnlock} onyourLogin={handleyourLogin} />
    </div>
  );
}

/* ── Gift Context Wrapper Route ──────────────────── */
function GiftRouteWrapper({ isyour = false }) {
  const { giftId } = useParams();
  return (
    <GiftProvider giftId={giftId}>
      {isyour ? <YourRoute /> : <MainRoute />}
    </GiftProvider>
  );
}

/* ── App Root Routing Table ──────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Creator Platform Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<CreatorDashboard />} />
        <Route path="/builder" element={<CreatorHub />} />

        {/* Dynamic Gift Routes */}
        <Route path="/gift/:giftId" element={<GiftRouteWrapper isyour={false} />} />
        <Route path="/gift/:giftId/your" element={<GiftRouteWrapper isyour={true} />} />
      </Routes>
    </BrowserRouter>
  );
}
