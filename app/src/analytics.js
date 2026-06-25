/* ═══════════════════════════════════════════════════════
   ✨ WISH CRAFT ANALYTICS — Supabase Edition
   Tracks visits, heartbeats, interactions, and replies.
   ═══════════════════════════════════════════════════════ */

import { supabase } from './supabaseClient';

const LOCAL_KEY = 'wish_analytics';

/* ── Local Helpers ──────────────────────────────────── */
function getLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : createEmptyStore();
  } catch {
    return createEmptyStore();
  }
}

function saveLocalStore(store) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[Analytics] localStorage save failed:', e);
  }
}

function createEmptyStore() {
  return {
    visitCount: 0,
    totalTimeSpent: 0,
    sessionStart: null,
    lastActivity: null,
  };
}

/* ══════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════ */

/**
 * Heartbeat ping — updates last_activity timestamp.
 * Called every 5s while user is active.
 */
export async function ping(giftId) {
  if (!giftId) return;
  const now = new Date().toISOString();

  // Local
  const store = getLocalStore();
  store.lastActivity = Date.now();
  saveLocalStore(store);

  // Supabase (update gifts row)
  await supabase
    .from('gifts')
    .update({ last_activity: now })
    .eq('id', giftId);
}

/**
 * Record a new site visit.
 */
export async function recordVisit(giftId) {
  if (!giftId) return;
  const now = new Date().toISOString();

  // Local
  const store = getLocalStore();
  store.visitCount += 1;
  store.sessionStart = Date.now();
  saveLocalStore(store);

  // Supabase: Increments visit count. Uses RPC or direct value update.
  // To avoid race conditions, we first fetch, then increment.
  try {
    const { data: gift } = await supabase
      .from('gifts')
      .select('visit_count')
      .eq('id', giftId)
      .single();

    const currentVisits = gift?.visit_count || 0;

    await supabase
      .from('gifts')
      .update({
        visit_count: currentVisits + 1,
        last_activity: now,
      })
      .eq('id', giftId);

    // Track a visit event in analytic logs
    await trackEvent(giftId, 'System', 'visit', { visitNum: currentVisits + 1 });
  } catch (err) {
    console.error('[Analytics] Failed to record visit:', err);
  }
}

/**
 * Update cumulative time spent.
 */
export async function updateTimeSpent(giftId) {
  if (!giftId) return;
  const store = getLocalStore();
  if (store.sessionStart) {
    const elapsed = Math.floor((Date.now() - store.sessionStart) / 1000);
    store.totalTimeSpent += elapsed;
    store.sessionStart = Date.now();
    saveLocalStore(store);

    // Supabase
    try {
      const { data: gift } = await supabase
        .from('gifts')
        .select('total_time_spent')
        .eq('id', giftId)
        .single();

      const currentSecs = gift?.total_time_spent || 0;

      await supabase
        .from('gifts')
        .update({
          total_time_spent: currentSecs + elapsed,
          last_activity: new Date().toISOString(),
        })
        .eq('id', giftId);
    } catch (err) {
      console.error('[Analytics] Failed to update time spent:', err);
    }
  }
}

/**
 * Track an interaction event.
 */
export async function trackEvent(giftId, category, action, data = {}) {
  if (!giftId) return;
  try {
    await supabase.from('gift_analytics').insert({
      gift_id: giftId,
      category,
      action,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[Analytics] event push failed:', e);
  }
}

/**
 * Store a Section 10 text answer.
 */
export async function trackSection10Answer(giftId, questionId, questionText, answer) {
  if (!giftId) return;
  // Store Q&A responses in the analytical events table
  await trackEvent(giftId, 'Section10', 'text_input', {
    questionId,
    questionText,
    answer,
  });
}

/**
 * Store a Section 11 letter reply.
 */
export async function trackReply(giftId, text) {
  if (!giftId) return;
  try {
    await supabase.from('gift_replies').insert({
      gift_id: giftId,
      text,
      timestamp: new Date().toISOString(),
    });
    // Log interaction
    await trackEvent(giftId, 'Section11', 'letter_reply_sent', { length: text.length });
  } catch (err) {
    console.error('[Analytics] Failed to send reply:', err);
  }
}

/**
 * Clear analytics for a gift (your reset option).
 */
export async function clearAnalytics(giftId) {
  if (!giftId) return;
  localStorage.removeItem(LOCAL_KEY);

  // Wipes analytics and replies for this gift, resets count
  await supabase.from('gift_analytics').delete().eq('gift_id', giftId);
  await supabase.from('gift_replies').delete().eq('gift_id', giftId);
  await supabase.from('gifts').update({ visit_count: 0, total_time_spent: 0, last_activity: null }).eq('id', giftId);
}
