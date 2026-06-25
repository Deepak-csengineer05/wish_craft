import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGift } from '../../context/GiftContext';
import { calculateMilestones } from '../../utils/dateHelper';
import './Scene2Countdown.css';

/* ─── Word-by-word reveal — diagonal top-left → bottom-right ─── */
function WordReveal({ lines, baseDelay = 0 }) {
  let wordIdx = 0;
  return (
    <div className="wr-block">
      {lines.map((line, li) => {
        const words = line.text.split(' ');
        return (
          <p key={li} className={`wr-line ${line.cls || ''}`}>
            {words.map((word, wi) => {
              const delay = baseDelay + wordIdx++ * 0.15;
              return (
                <span
                  key={wi}
                  className="wr-word"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {word}&nbsp;
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Rolling year 2006 → 2026 ─── */
function RollingYear({ trigger, birthYear = 2006 }) {
  const targetYear = new Date().getFullYear();
  const startYear = birthYear;
  const [year, setYear] = useState(startYear);

  useEffect(() => {
    if (!trigger) return;
    let cur = startYear;
    const tick = () => {
      cur++;
      setYear(cur);
      if (cur >= targetYear) return;
      const totalDiff = targetYear - startYear;
      const p     = (cur - startYear) / (totalDiff || 1);
      const delay = 40 + p * p * 380;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 100);
  }, [trigger, startYear, targetYear]);

  return <span className="year-roll">{year}</span>;
}

/* ─── Main component ─── */
export default function Scene2Countdown({ onProceed }) {
  const { birthday, configData } = useGift();
  const [phase,    setPhase]    = useState('journey');
  const [jIdx,     setJIdx]     = useState(0);
  const [itemVis,  setItemVis]  = useState(true);
  const [dateVis,  setDateVis]  = useState(false);
  const [yearTrig, setYearTrig] = useState(false);
  const [msgVis,   setMsgVis]   = useState([false, false, false]);
  const [exiting,  setExiting]  = useState(false);

  const proceed = useCallback(() => {
    setExiting(true);
    setTimeout(() => onProceed?.(), 1400);
  }, [onProceed]);

  // Compute milestones dynamically from birthday input
  const journeyList = useMemo(() => {
    const computed = calculateMilestones(birthday);
    const labels = {
      100: { pre: 'Yeah when it was', post: 'days before the day' },
      75: { pre: 'on', post: 'days before the day' },
      50: { pre: 'by', post: 'days before the day' },
      25: { pre: 'when I say', post: 'days before the day' },
      10: { pre: 'I remember when it was', post: 'days before the day' },
      5: { pre: 'when it was', post: "days ahead... I couldn't wait" }
    };

    return computed.map(item => {
      const lbl = labels[item.daysPrior] || { pre: 'on', post: 'days before the day' };
      return {
        pre: lbl.pre,
        date: `${item.dateLabel},`,
        count: String(item.daysPrior),
        post: lbl.post
      };
    });
  }, [birthday]);

  // Extract day and month names
  const birthdayLabel = useMemo(() => {
    if (!birthday) return { day: '17', month: 'April' };
    const parts = birthday.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (parts.length === 3 || parts.length === 2) {
      const d = parseInt(parts[0], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      return { day: String(d), month: monthNames[mIdx] || 'April' };
    }
    return { day: '17', month: 'April' };
  }, [birthday]);

  const birthYearVal = useMemo(() => {
    if (!birthday) return 2006;
    const parts = birthday.split('-');
    if (parts.length === 3) {
      return parseInt(parts[2], 10) || 2006;
    }
    return 2006;
  }, [birthday]);

  /* Journey auto-advance */
  useEffect(() => {
    if (phase !== 'journey') return;
    const t = setTimeout(() => {
      if (jIdx < journeyList.length - 1) {
        setItemVis(false);
        setTimeout(() => { setJIdx(i => i + 1); setItemVis(true); }, 600);
      } else {
        setItemVis(false);
        setTimeout(() => setPhase('finally'), 700);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, jIdx, journeyList]);

  /* "Finally" → date */
  useEffect(() => {
    if (phase !== 'finally') return;
    const t = setTimeout(() => setPhase('date'), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  /* Date reveal + rolling year */
  useEffect(() => {
    if (phase !== 'date') return;
    const t1 = setTimeout(() => setDateVis(true),  300);
    const t2 = setTimeout(() => setYearTrig(true), 1100);
    const t3 = setTimeout(() => setPhase('messages'), 5500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [phase]);

  /* Staggered messages */
  useEffect(() => {
    if (phase !== 'messages') return;
    const ts = [
      setTimeout(() => setMsgVis([true,  false, false]), 300),
      setTimeout(() => setMsgVis([true,  true,  false]), 2800),
      setTimeout(() => setMsgVis([true,  true,  true]),  5200),
      setTimeout(proceed, 8500),
    ];
    return () => ts.forEach(clearTimeout);
  }, [phase, proceed]);

  const item = journeyList[jIdx] || { pre: '', date: '', count: '', post: '' };

  return (
    <div className={`sc2-wrapper ${exiting ? 'sc2-exit' : ''}`}>
      <div className="sc2-overlay" />
      <div className="sc2-inner">

        {/* ── JOURNEY ── */}
        {phase === 'journey' && (
          <div className={`sc2-journey-card ${itemVis ? 'vis' : 'hid'}`}>
            <WordReveal
              lines={[
                { text: item.pre + ' ' + item.date, cls: 'wr-pre' },
              ]}
              baseDelay={0.05}
            />
            <div className="sc2-count-row">
              <span className="sc2-count">{item.count}</span>
            </div>
            <WordReveal
              lines={[{ text: item.post, cls: 'wr-post' }]}
              baseDelay={0.2}
            />
          </div>
        )}

        {/* ── FINALLY ── */}
        {phase === 'finally' && (
          <div className="sc2-finally">
            <WordReveal
              lines={[
                { text: 'But finally...', cls: 'wr-finally-pre' },
                { text: 'the day came', cls: 'wr-finally-main' },
              ]}
              baseDelay={0}
            />
          </div>
        )}

        {/* ── DATE REVEAL ── */}
        {phase === 'date' && (
          <div className={`sc2-date-reveal ${dateVis ? 'vis' : ''}`}>
            <div className="sc2-reveal-date">
              <span className="sc2-day">{birthdayLabel.day} </span>
              <span className="sc2-month">{birthdayLabel.month}</span>
              <span className="sc2-dot"> · </span>
              <RollingYear trigger={yearTrig} birthYear={birthYearVal} />
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {phase === 'messages' && (
          <div className="sc2-messages">
            {msgVis[0] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: configData?.countdownMsg1 || 'say a good bye to your teenage', cls: 'wr-msg' }]} baseDelay={0} />
              </div>
            )}
            {msgVis[1] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: configData?.countdownMsg2 || "Now you are in your 20's", cls: 'wr-msg wr-msg--hl' }]} baseDelay={0} />
              </div>
            )}
            {msgVis[2] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: configData?.countdownMsg3 || 'a special day to celebrate', cls: 'wr-msg' }]} baseDelay={0} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
