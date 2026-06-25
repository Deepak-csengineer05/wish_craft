import React, { useState, useEffect, useCallback } from 'react';
import { useGift } from '../context/GiftContext';
import { clearAnalytics } from '../analytics';
import { supabase } from '../supabaseClient';
import './YourDashboard.css';

/* ── Section 9 Question Map ────────────────────── */
const SECTION10_QUESTIONS = [
  { id: 0, text: "Are you surprised by the gift?", type: 'options' },
  { id: 1, text: "Sorry for this, next time I assure the gift will be the best to make you smile.", type: 'info' },
  { id: 2, text: "Do you know who done this for you?", type: 'options' },
  { id: 3, text: "For all the options, I would say only one name...", type: 'info' },
  { id: 4, text: "Who is the Creator to you?", type: 'input' },
  { id: 5, text: "Are you really happy with this gift? Did you expect this from them?", type: 'input' },
  { id: 6, text: "If you could say one thing to them, what would it be?", type: 'input' },
  { id: 7, text: "Are you wondering why they made this for you, and what you did to inspire it?", type: 'input' },
  { id: 8, text: "I can simply say why they are doing this for you but...", type: 'info' },
  { id: 9, text: "Will you be their best friend in any situation, and never leave them? Tell the truth.", type: 'input' },
];

const LOCATION_MAP = {
  'Scene1': 'The Moon',
  'Scene3': 'Fireworks',
  'Scene4': 'The Envelope',
  'Section2': 'Wall of Memories',
  'Section4': 'The Gifts',
  'Section5': 'The Cake',
  'Section6': 'Star Puzzle',
  'Section7': 'Magical Gallery',
  'Section8': 'Diary for you',
  'Section9': 'Wish Cards',
  'Section10': 'The Questions',
  'Section11': 'Birthday Wish Letter',
  'PasswordGate': 'Password Gate'
};

/* ── Time Formatter ────────────────────────────── */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0s';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/* ── Stars Background ──────────────────────────── */
function Starfield() {
  const [stars] = useState(() =>
    Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 0.5}px`,
      dur: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))
  );

  return (
    <div className="your-starfield">
      {stars.map(s => (
        <div key={s.id} className="your-star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          '--dur': s.dur,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
}

/* ── Sidebar Tabs Config ───────────────────────── */
const MENU_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'overview', icon: '📊', label: 'Overview' },
    ]
  },
  {
    title: 'Scenes',
    items: [
      { id: 'scene1', icon: '🌕', label: 'The Moon' },
      { id: 'scene3', icon: '🎆', label: 'Fireworks' },
      { id: 'scene4', icon: '💌', label: 'The Envelope' },
    ]
  },
  {
    title: 'Memories',
    items: [
      { id: 'sec2', icon: '🌿', label: 'Wall of Memories' },
      { id: 'sec4', icon: '🎁', label: 'The Gifts' },
      { id: 'sec5', icon: '🎂', label: 'The Cake' },
      { id: 'sec6', icon: '✨', label: 'Star Puzzle' },
      { id: 'sec7', icon: '🖼️', label: 'Magical Gallery' },
      { id: 'sec8', icon: '📖', label: 'Diary for you' },
      { id: 'sec9', icon: '💖', label: 'Wish Cards' },
      { id: 'sec10', icon: '🌙', label: 'The Questions' },
      { id: 'sec11', icon: '📜', label: 'Birthday Wish Letter' },
    ]
  }
];

/* ── Main Dashboard ────────────────────────────── */
export default function YourDashboard() {
  const { giftId } = useGift();
  const [data, setData] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTargetOnline, setIsTargetOnline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Core Data Fetch & Normalizer Function
  const fetchDashboardData = useCallback(async () => {
    if (!giftId) return;
    try {
      // 1. Fetch main gift metrics
      const { data: gift } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', giftId)
        .single();

      // 2. Fetch analytic events
      const { data: analytics } = await supabase
        .from('gift_analytics')
        .select('*')
        .eq('gift_id', giftId)
        .order('timestamp', { ascending: true });

      // 3. Fetch replies
      const { data: replies } = await supabase
        .from('gift_replies')
        .select('*')
        .eq('gift_id', giftId)
        .order('timestamp', { ascending: false });

      if (!gift) return;

      // 4. Normalize Postgres records to exact Firebase schema expected by the JSX
      const eventsList = (analytics || []).map(row => ({
        category: row.category,
        action: row.action,
        data: row.data,
        timestamp: row.timestamp
      }));

      const visitsList = eventsList
        .filter(e => e.action === 'visit')
        .map(e => e.timestamp);

      const section10Answers = {};
      eventsList
        .filter(e => e.category === 'Section10' && e.action === 'text_input')
        .forEach(e => {
          const qId = e.data.questionId;
          section10Answers[qId] = {
            question: e.data.questionText,
            answer: e.data.answer,
            timestamp: e.timestamp
          };
        });

      const repliesList = (replies || []).map(row => ({
        text: row.text,
        timestamp: row.timestamp
      }));

      const normalizedData = {
        visitCount: gift.visit_count || 0,
        totalTimeSpent: gift.total_time_spent || 0,
        lastActivity: gift.last_activity,
        events: eventsList,
        visits: visitsList,
        section10Answers,
        replies: repliesList,
        configData: gift.config_data || {}
      };

      setData(normalizedData);

      // Check online status (pinged within last 15 seconds)
      if (gift.last_activity) {
        const timeSinceLastPing = Date.now() - new Date(gift.last_activity).getTime();
        const onlineNow = timeSinceLastPing <= 15000;

        setIsTargetOnline((prevOnline) => {
          if (!prevOnline && onlineNow) {
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 5000);
          }
          return onlineNow;
        });
      } else {
        setIsTargetOnline(false);
      }
    } catch (err) {
      console.error('Error fetching dashboard database metrics:', err);
    }
  }, [giftId]);

  // Fetch initial data and subscribe to Realtime updates
  useEffect(() => {
    fetchDashboardData();

    // Establish dynamic postgres channels for realtime UI updates
    const channel = supabase.channel(`realtime-dashboard-${giftId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gift_analytics', filter: `gift_id=eq.${giftId}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gift_replies', filter: `gift_id=eq.${giftId}` }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts', filter: `id=eq.${giftId}` }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [giftId, fetchDashboardData]);

  const handleClear = async () => {
    if (confirmClear) {
      await clearAnalytics(giftId);
      fetchDashboardData();
      setConfirmClear(false);
      setActiveTab('overview');
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  if (!data) return null;

  /* ── Derived Data ── */
  const scene1Events = data.events.filter(e => e.category === 'Scene1');
  const scene3Events = data.events.filter(e => e.category === 'Scene3');
  const scene4Events = data.events.filter(e => e.category === 'Scene4');
  const sec2Events = data.events.filter(e => e.category === 'Section2');
  const sec4Events = data.events.filter(e => e.category === 'Section4');
  const sec5Events = data.events.filter(e => e.category === 'Section5');
  const sec6Events = data.events.filter(e => e.category === 'Section6');
  const sec7Events = data.events.filter(e => e.category === 'Section7');
  const sec8Events = data.events.filter(e => e.category === 'Section8');
  const sec9Events = data.events.filter(e => e.category === 'Section9');
  const sec10Events = data.events.filter(e => e.category === 'Section10');
  const sec11Events = data.events.filter(e => e.category === 'Section11');
  const passwordEvents = data.events.filter(e => e.category === 'PasswordGate');

  const giftBoxOpenEvents = sec4Events.filter(e => e.action === 'gift_box_open');
  const feedbackEvent = sec4Events.find(e => e.action === 'feedback_response');
  const candleEvents = sec5Events.filter(e => e.action === 'candle_blown');
  const wordEvents = sec6Events.filter(e => e.action === 'word_found');
  const hintEvents = sec6Events.filter(e => e.action === 'hint_used');
  const scratchEvents = sec7Events.filter(e => e.action === 'scratch_reveal');
  const favQuoteEvent = sec8Events.find(e => e.action === 'favourite_quote');
  const letterTimeEvent = sec11Events.find(e => e.action === 'letter_read_time');
  const skippedFireworks = scene3Events.some(e => e.action === 'skip_fireworks');

  const sec10Options = Object.values(
    sec10Events
      .filter(e => e.action === 'option_click')
      .reduce((acc, e) => {
        const qId = e.data?.questionId !== undefined ? e.data.questionId : e.data?.questionText;
        if (qId !== undefined) {
          acc[qId] = e;
        }
        return acc;
      }, {})
  );

  const totalEvents = data.events.length;
  const lastVisit = data.visits.length > 0 ? data.visits[data.visits.length - 1] : null;

  const calculateMostLoved = () => {
    if (totalEvents === 0) return 'None';
    const categoryCounts = {};
    data.events.forEach(evt => {
      const category = evt.category;
      if (LOCATION_MAP[category]) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    let maxCount = 0;
    let topCategory = null;

    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    }

    if (!topCategory) return 'None';
    const fullName = LOCATION_MAP[topCategory];
    return fullName.split(':')[0];
  };

  const mostLovedMemory = calculateMostLoved();
  const recentEvents = [...data.events].reverse().slice(0, 20);
  const mostRecentEvent = recentEvents[0];
  const currentLocation = mostRecentEvent && LOCATION_MAP[mostRecentEvent.category]
    ? LOCATION_MAP[mostRecentEvent.category]
    : 'Unknown / Hub';

  /* ── Content Renderers ── */
  const renderOverview = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel desktop-only-header">
        <div className="your-header desktop-header-content">
          <h1 className="your-title">Reaction Control 🌙</h1>
          <p className="your-subtitle">
            Analytics Dashboard
            {isTargetOnline ? (
              <>
                <span className="live-indicator online">🟢 ONLINE</span>
                <span className="current-location-pill">📍 At: {currentLocation}</span>
              </>
            ) : (
              <span className="live-indicator offline">⚪ Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="your-stats-row">
        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-value">{data.visitCount}</div>
          <div className="stat-label">Total Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱</div>
          <div className="stat-value">{formatDuration(data.totalTimeSpent)}</div>
          <div className="stat-label">Time Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{totalEvents}</div>
          <div className="stat-label">Interactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value" style={{ fontSize: '1.2rem', padding: '0.4rem 0' }}>
            {lastVisit ? formatTimestamp(lastVisit) : 'Never'}
          </div>
          <div className="stat-label">Last Visit</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{mostLovedMemory}</div>
          <div className="stat-label">Most Loved</div>
        </div>
      </div>

      <div className="your-grid-panels">
        <div className="your-panel flex-grow">
          <div className="panel-header">
            <div className="panel-icon">📋</div>
            <div className="panel-title">Visit History</div>
            <div className="panel-badge">{data.visits.length} Visits</div>
          </div>
          {data.visits.length > 0 ? (
            <div className="visit-log">
              {[...data.visits].reverse().map((v, i) => (
                <div key={i} className="visit-chip">
                  #{data.visits.length - i} · {formatTimestamp(v)}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No visits recorded yet.</div>
          )}
        </div>

        <div className="your-panel">
          <div className="panel-header">
            <div className="panel-icon">🔐</div>
            <div className="panel-title">Password Attempts</div>
            <div className="panel-badge pink">{passwordEvents.length} Failed</div>
          </div>
          <div className="event-list limit-height">
            {passwordEvents.length > 0 ? passwordEvents.map((evt, i) => (
              <div key={i} className="event-item">
                <div className="event-dot pink" />
                <div className="event-text">
                  Failed: <strong style={{ color: '#ff4d4d' }}>"{evt.data.attempted || 'Unknown'}"</strong>
                  <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '8px' }}>({evt.data.length || 0} chars)</span>
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            )) : (
              <div className="empty-state">No failed attempts detected.</div>
            )}
          </div>
        </div>
      </div>

      <div className="your-panel full-width mt-15">
        <div className="panel-header">
          <div className="panel-icon">⚡</div>
          <div className="panel-title">Live Activity Feed</div>
          <div className="panel-badge">{recentEvents.length} Recent Events</div>
        </div>
        <div className="event-list limit-height-large">
          {recentEvents.length > 0 ? recentEvents.map((evt, i) => {
            const rawData = evt.data ? JSON.stringify(evt.data).replace(/[{}"']/g, '').replace(/:/g, ': ') : '';
            return (
              <div key={i} className="event-item active-glow feed-item">
                <div className="feed-category">{LOCATION_MAP[evt.category] || evt.category}</div>
                <div className="event-text flex-1">
                  <strong>{evt.action.replace(/_/g, ' ')}</strong>
                  {rawData && <span className="feed-data-preview"> ({rawData})</span>}
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            );
          }) : (
            <div className="empty-state">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScene1 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🌕</div>
          <div className="panel-title">The Moon</div>
          <div className="panel-badge">{scene1Events.length} Choices</div>
        </div>
        {scene1Events.length > 0 ? (
          <div className="event-list large">
            {scene1Events.map((evt, i) => (
              <div key={i} className="event-item active-glow">
                <div className={`event-dot ${evt.data.optionIndex === 0 ? 'green' : 'pink'}`} />
                <div className="event-text">
                  Step <strong>{evt.data.stepId}</strong> → selected <strong>"{evt.data.optionText}"</strong>
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderScene3 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🎆</div>
          <div className="panel-title">Fireworks</div>
        </div>
        <div className="event-list large">
          {scene3Events.length > 0 ? (
            <div className="event-item active-glow">
              <div className={`event-dot ${skippedFireworks ? 'pink' : 'green'}`} />
              <div className="event-text">
                {skippedFireworks ? '⏭ Skipped the fireworks show' : '✨ Watched the full fireworks display'}
              </div>
            </div>
          ) : (
            <div className="empty-state">Not reached yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScene4 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">💌</div>
          <div className="panel-title">The Envelope</div>
        </div>
        <div className="event-list large">
          {scene4Events.length > 0 ? scene4Events.map((evt, i) => (
            <div key={i} className="event-item active-glow">
              <div className="event-dot gold" />
              <div className="event-text">Clicked the moon seal 🌙</div>
              <div className="event-time">{formatTime(evt.timestamp)}</div>
            </div>
          )) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    </div>
  );

  const renderSec2 = () => {
    const SEC2_PHOTOS_MAP = {
      1: 'pic1.jpeg', 6: 'pic2.jpeg', 2: 'pic3.jpeg', 7: 'pic4.jpeg',
      3: 'pic5.jpeg', 4: 'pic6.jpeg', 8: 'pic7.jpeg', 5: 'pic8.jpeg'
    };

    return (
      <div className="tab-pane fade-in">
        <div className="your-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🌿</div>
            <div className="panel-title">Wall of Memories</div>
            <div className="panel-badge">{sec2Events.length} Photos Viewed</div>
          </div>
          {sec2Events.length > 0 ? (
            <div className="event-list large auto-grid">
              {sec2Events.map((evt, i) => {
                const photoSrc = SEC2_PHOTOS_MAP[evt.data.photoId];
                return (
                  <div key={i} className="event-item card-style active-glow dashboard-polaroid">
                    {photoSrc && (
                      <div className="polaroid-image-box">
                        <img src={`/${photoSrc}`} alt={`Pic ${evt.data.photoId}`} className="polaroid-pic" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <div className="polaroid-details">
                      <div className="event-dot cyan" style={{ position: 'relative', top: 0, right: 0 }} />
                      <div className="event-text text-center">
                        <div><strong>#{evt.data.photoId}</strong> viewed</div>
                        <div className="sub-text italic">"{evt.data.caption}"</div>
                      </div>
                      <div className="event-time mt-auto">{formatTime(evt.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    );
  };

  const renderSec4 = () => {
    const uniqueBoxesOpened = new Set(giftBoxOpenEvents.map(e => e.data.boxIndex)).size;

    return (
      <div className="tab-pane fade-in">
        <div className="your-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🎁</div>
            <div className="panel-title">The Gifts</div>
            <div className="panel-badge">{uniqueBoxesOpened}/5 Opened</div>
          </div>

          {giftBoxOpenEvents.length > 0 ? (
            <>
              <div className="gift-boxes-wrapper">
                <div className="gift-boxes-row">
                  {[0, 1, 2, 3, 4].map(i => {
                    const openEvt = giftBoxOpenEvents.find(e => e.data.boxIndex === i);
                    const order = openEvt ? giftBoxOpenEvents.indexOf(openEvt) + 1 : null;
                    return (
                      <div key={i} className={`gift-box-card ${openEvt ? 'opened' : ''}`}>
                        <span className="gift-box-icon">{openEvt ? '🎁' : '📦'}</span>
                        {order && <span className="gift-box-order animate-pop">{order}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {feedbackEvent && (
                <div className="feedback-container fade-in">
                  <div className="feedback-title">"Did you like the gift?"</div>
                  <div className={`feedback-badge ${feedbackEvent.data.response} glowing`}>
                    {feedbackEvent.data.response === 'yes' ? '✅ Yes' : '❌ No'}
                    <span className="feedback-details">— response recorded</span>
                  </div>
                </div>
              )}
            </>
          ) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    );
  };

  const renderSec5 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🎂</div>
          <div className="panel-title">The Cake</div>
          <div className="panel-badge">{candleEvents.length}/5 Blown</div>
        </div>
        {candleEvents.length > 0 ? (
          <div className="candle-row large-padding">
            {[0, 1, 2, 3, 4].map(i => {
              const evt = candleEvents.find(e => e.data.candleIndex === i);
              return (
                <div key={i} className="candle-item">
                  <div className={`candle-icon ${evt ? 'blown-anim' : 'unblown'}`}>
                    {evt ? '🕯️' : '🕳️'}
                  </div>
                  {evt && <div className="candle-order glowing-text">#{evt.data.blownOrder}</div>}
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec6 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">✨</div>
          <div className="panel-title">Star Puzzle</div>
          <div className="panel-badge">{wordEvents.length} Words · {hintEvents.length} Hints</div>
        </div>
        {wordEvents.length > 0 || hintEvents.length > 0 ? (
          <div className="event-list large auto-grid">
            {wordEvents.map((evt, i) => (
              <div key={i} className="event-item card-style active-glow">
                <div className="event-dot green" />
                <div className="event-text">
                  Found <strong className="highlight">"{evt.data.word}"</strong>
                  <div className="sub-text">Word #{evt.data.foundOrder}</div>
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            ))}
            {hintEvents.length > 0 && (
              <div className="event-item card-style hint-card active-glow">
                <div className="event-dot gold" />
                <div className="event-text">
                  Used <strong>{hintEvents.length}</strong> Hint{hintEvents.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec7 = () => {
    const scratchCount = data.configData?.scratchCount || 7;
    const cardsList = Array.from({ length: scratchCount }, (_, i) => i + 1);

    return (
      <div className="tab-pane fade-in">
        <div className="your-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🖼️</div>
            <div className="panel-title">Magical Gallery</div>
            <div className="panel-badge">{scratchEvents.length}/{scratchCount} Revealed</div>
          </div>
          {scratchEvents.length > 0 ? (
            <div className="scratch-row large-padding">
              {cardsList.map(id => {
                const evt = scratchEvents.find(e => e.data.cardId === id);
                const customOrigUrl = data.configData?.scratchUrls?.[id];
                const customGhibliUrl = data.configData?.scratchGhibliUrls?.[id];
                const ghibliSrc = customGhibliUrl || customOrigUrl || `/sec7pic${id}Ghibli.${id === 6 ? 'png' : 'jpeg'}`;
                const normalSrc = customOrigUrl || `/sec7pic${id}.${[4, 5, 7].includes(id) ? 'png' : 'jpeg'}`;

                return (
                  <div key={id} className={`scratch-item ${evt ? 'revealed animate-pop' : ''}`}>
                    {evt && <div className="scratch-num">#{evt.data.revealOrder}</div>}
                    {evt ? (
                      <img
                        src={ghibliSrc}
                        alt={`Scratched ${id}`}
                        className="scratch-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = normalSrc;
                        }}
                      />
                    ) : (
                      <div className="unrevealed-overlay">Card {id}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    );
  };

  const renderSec8 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">📖</div>
          <div className="panel-title">Diary for you</div>
        </div>
        {favQuoteEvent ? (
          <div className="fav-quote-wrap">
            <div className="fav-quote-card premium-glow fade-in">
              <div className="fav-quote-text">"{favQuoteEvent.data.quoteText}"</div>
              <div className="fav-quote-num">★ Quote #{favQuoteEvent.data.quoteIndex + 1} ★</div>
            </div>
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec10 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height premium-border">
        <div className="panel-header">
          <div className="panel-icon highlight-icon">🌙</div>
          <div className="panel-title highlight-text">The Questions</div>
          <div className="panel-badge highlight-badge">⭐ Key Insights</div>
        </div>
        {(sec10Options.length > 0 || Object.keys(data.section10Answers).length > 0) ? (
          <div className="qa-grid">
            {sec10Options.map((evt, i) => (
              <div key={`opt-${i}`} className="qa-card active-glow slide-up">
                <div className="qa-question">
                  <span className="qa-question-num">Q</span>
                  {evt.data.questionText}
                </div>
                <div className="qa-option-selected">
                  → {evt.data.selectedOption}
                </div>
              </div>
            ))}
            {Object.entries(data.section10Answers).map(([qId, entry], i) => (
              <div key={`ans-${qId}`} className="qa-card active-glow gold-border slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="qa-question">
                  <span className="qa-question-num gold-num">Q</span>
                  {entry.question}
                </div>
                <div className="qa-answer handwritten-font">
                  {entry.answer}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec9 = () => {
    const cardFlips = sec9Events.filter(e => e.action === 'card_flip');
    const cardCounts = {};
    cardFlips.forEach(c => {
      const lbl = c.data?.label || c.data?.cardId || 'Unknown';
      cardCounts[lbl] = (cardCounts[lbl] || 0) + 1;
    });

    return (
      <div className="tab-pane fade-in">
        <div className="your-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🌟</div>
            <div className="panel-title">Wish Cards</div>
          </div>

          <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="stat-card gold-glow glass-panel" style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{cardFlips.length}</div>
              <div className="stat-label" style={{ opacity: 0.8, marginTop: '5px' }}>Total Flips</div>
            </div>
            <div className="stat-card purple-glow glass-panel" style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Object.keys(cardCounts).length}</div>
              <div className="stat-label" style={{ opacity: 0.8, marginTop: '5px' }}>Unique Cards</div>
            </div>
          </div>

          <div className="panel-content split-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div className="history-column glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
              <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>Chronological History</h3>
              {cardFlips.length > 0 ? (
                <div className="event-list scrollable" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                  {cardFlips.map((evt, idx) => (
                    <div key={idx} className="event-item card-style">
                      <div className="event-dot purple highlight-glow" />
                      <div className="event-time" style={{ minWidth: '80px', fontSize: '0.9rem' }}>{formatTime(evt.timestamp)}</div>
                      <div className="event-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                        <span style={{ opacity: 0.6, marginRight: '5px' }}>#{idx + 1}</span>
                        <strong>{evt.data?.label || evt.data?.cardId || 'Unknown'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state">No cards flipped yet.</div>}
            </div>

            <div className="counts-column glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
              <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>Total Tap Counts</h3>
              {Object.keys(cardCounts).length > 0 ? (
                <div className="event-list scrollable" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                  {Object.entries(cardCounts).sort((a, b) => b[1] - a[1]).map(([lbl, count], idx) => (
                    <div key={idx} className="event-item card-style" style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '15px', alignItems: 'center' }}>
                      <div className="event-text" style={{ flex: 1, paddingRight: '10px', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                        <strong>{lbl}</strong>
                      </div>
                      <div className="event-badge gold highlight-glow" style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--gold-main)', color: '#fff', fontWeight: 'bold' }}>
                        {count} {count === 1 ? 'tap' : 'taps'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state">No data available.</div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSec11 = () => (
    <div className="tab-pane fade-in">
      <div className="your-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">📜</div>
          <div className="panel-title">Birthday Wish Letter</div>
        </div>
        {letterTimeEvent ? (
          <div className="event-list large">
            <div className="event-item active-glow card-style">
              <div className="event-dot gold highlight-glow" />
              <div className="event-text" style={{ fontSize: '1.2rem' }}>
                Read the letter for <strong className="highlight">{formatDuration(letterTimeEvent.data.seconds)}</strong>
              </div>
              <div className="event-time">{formatTime(letterTimeEvent.timestamp)}</div>
            </div>
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}

        <div className="panel-header mt-15" style={{ marginTop: '30px' }}>
          <div className="panel-icon">			💌</div>
          <div className="panel-title">Their Replies</div>
          <div className="panel-badge pink">{data.replies?.length || 0} received</div>
        </div>
        {data.replies && data.replies.length > 0 ? (
          <div className="event-list large" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {data.replies.map((reply, i) => (
              <div key={i} className="event-item active-glow card-style" style={{ display: 'block', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="event-dot pink highlight-glow" style={{ position: 'static', margin: '0 10px 0 0', flexShrink: 0 }} />
                  <div className="event-time" style={{ marginLeft: 'auto', flexShrink: 0 }}>{formatTime(reply.timestamp)}</div>
                </div>
                <div className="event-text" style={{ fontSize: '1.4rem', fontStyle: 'italic', color: '#ffdab3', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontFamily: "'Dancing Script', cursive", wordBreak: 'break-word', letterSpacing: '1px' }}>
                  "{reply.text}"
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">No replies received yet.</div>}
      </div>
    </div>
  );

  return (
    <div className="your-root">
      <Starfield />

      {/* Online Toast Alert */}
      <div className={`your-toast ${showOnlineToast ? 'show' : ''}`}>
        <span>🟢</span> Target is now ONLINE!
      </div>

      <div className={`your-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        {/* Sidebar Navigation */}
        <aside className="your-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">
              <span className="logo-icon">🌙</span>
              {isSidebarOpen && <span className="logo-text">Reaction</span>}
            </span>
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <div className="sidebar-menu">
            {MENU_GROUPS.map((group, gi) => (
              <div key={gi} className="menu-group">
                <span className="menu-group-title">{group.title}</span>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    title={item.label}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    {activeTab === item.id && <span className="active-indicator" />}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className={`btn-clear-data ${confirmClear ? 'confirming' : ''}`} onClick={handleClear}>
              <span className="btn-icon">🗑</span>
              {isSidebarOpen && (
                <span className="btn-lbl">
                  {confirmClear ? 'Click to Confirm Wiping' : 'Clear Analytics Data'}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="your-main">
          <div className="main-scroll-area">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'scene1' && renderScene1()}
            {activeTab === 'scene3' && renderScene3()}
            {activeTab === 'scene4' && renderScene4()}
            {activeTab === 'sec2' && renderSec2()}
            {activeTab === 'sec4' && renderSec4()}
            {activeTab === 'sec5' && renderSec5()}
            {activeTab === 'sec6' && renderSec6()}
            {activeTab === 'sec7' && renderSec7()}
            {activeTab === 'sec8' && renderSec8()}
            {activeTab === 'sec9' && renderSec9()}
            {activeTab === 'sec10' && renderSec10()}
            {activeTab === 'sec11' && renderSec11()}
          </div>
        </main>

      </div>
    </div>
  );
}
