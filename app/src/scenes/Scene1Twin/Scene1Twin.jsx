import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGift } from '../../context/GiftContext';
import { trackEvent } from '../../analytics';
import './Scene1Twin.css';

/* ─── Floating NO button (portal + physics) ──────── */
function FloatingNo({ onNoClick, stepId, declineText }) {
  const pos    = useRef({ x: window.innerWidth * 0.72, y: window.innerHeight * 0.72 });
  const vel    = useRef({ x: 0, y: 0 });
  const mouse  = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    pos.current = {
      x: window.innerWidth  * (0.55 + Math.random() * 0.3),
      y: window.innerHeight * (0.55 + Math.random() * 0.3),
    };
    vel.current = { x: 0, y: 0 };
  }, [stepId]);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const REPEL_RADIUS = 150;
    const REPEL_FORCE  = 18;
    const FRICTION     = 0.78;
    const MARGIN       = 70;

    const tick = () => {
      const { x: bx, y: by } = pos.current;
      const { x: mx, y: my } = mouse.current;
      const dx   = bx - mx;
      const dy   = by - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const strength = (REPEL_RADIUS - dist) / REPEL_RADIUS;
        vel.current.x += (dx / dist) * REPEL_FORCE * strength;
        vel.current.y += (dy / dist) * REPEL_FORCE * strength;
      }

      vel.current.x *= FRICTION;
      vel.current.y *= FRICTION;

      const newX = Math.min(window.innerWidth  - MARGIN, Math.max(MARGIN, bx + vel.current.x));
      const newY = Math.min(window.innerHeight - MARGIN, Math.max(MARGIN, by + vel.current.y));
      pos.current = { x: newX, y: newY };

      if (btnRef.current) {
        btnRef.current.style.display = 'block';
        btnRef.current.style.left = `${newX}px`;
        btnRef.current.style.top  = `${newY}px`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return createPortal(
    <button
      ref={btnRef}
      className="btn-option btn-no btn-no-floating"
      style={{
        position:  'fixed',
        left:      0,
        top:       0,
        transform: 'translate(-50%, -50%)',
        zIndex:    9998,
        display:   'none'
      }}
      onClick={onNoClick}
    >
      {declineText}
    </button>,
    document.body
  );
}

/* ─── Moon SVG ───────────────────────────────────── */
function MoonFace({ mood }) {
  const isCurious  = mood === 'curious';
  const isTeasing  = mood === 'teasing';
  const isExcited  = mood === 'excited';
  const isPleading = mood === 'pleading';

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="moon-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="rgba(179,157,219,0.08)" />
      <circle cx="100" cy="100" r="80" fill="#e8e0f5" />
      <circle cx="70"  cy="75"  r="13" fill="#c5b8e0" opacity="0.7"/>
      <circle cx="130" cy="68"  r="9"  fill="#c5b8e0" opacity="0.6"/>
      <circle cx="55"  cy="120" r="8"  fill="#c5b8e0" opacity="0.5"/>
      <circle cx="140" cy="115" r="11" fill="#c5b8e0" opacity="0.55"/>
      <circle cx="105" cy="145" r="7"  fill="#c5b8e0" opacity="0.5"/>
      <circle cx="85"  cy="55"  r="5"  fill="#c5b8e0" opacity="0.4"/>

      <ellipse cx="80" cy="97"
        rx={isPleading ? 10 : isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 11 : 10}
        fill="#1a1a2e"/>
      <ellipse cx="120" cy={isCurious ? 94 : 97}
        rx={isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 8 : 10}
        fill="#1a1a2e"/>
      <circle cx="83" cy="94" r="3" fill="white"/>
      <circle cx="123" cy={isCurious ? 91 : 94} r="3" fill="white"/>

      <ellipse cx="65"  cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>
      <ellipse cx="135" cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>

      {isPleading ? (
        <path d="M 88 122 Q 100 118 112 122" stroke="#7b52c8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : isTeasing ? (
        <path d="M 88 120 Q 100 132 112 120" stroke="#7b52c8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M 86 120 Q 100 133 114 120" stroke="#7b52c8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      )}
    </svg>
  );
}

function SpeechBubble({ lines }) {
  return (
    <div className="speech-bubble">
      <div className="bubble-pointer" />
      {lines.map((line, i) => (
        <p key={i} className={i === 0 ? 'bubble-intro' : 'bubble-question'}>
          {line}
        </p>
      ))}
    </div>
  );
}

export default function Scene1Twin({ onProceed, onAudioStart }) {
  const { giftId, configData } = useGift();
  const [stepId, setStepId]       = useState('intro');
  const [exiting, setExiting]     = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stepList = useMemo(() => {
    return [
      {
        id: 'intro',
        moonMood: 'happy',
        lines: [
          configData?.introText1 || 'Hi! I am Moon 🌕',
          configData?.introText2 || 'Is today a special day?'
        ],
        options: [
          configData?.introOpt1 || 'Of course ✦',
          configData?.introOpt2 || 'Yes, for sure ✨'
        ],
        onOption: () => 'beautiful',
      },
      {
        id: 'beautiful',
        moonMood: 'curious',
        lines: [
          'Oh...',
          configData?.moonLine2 || 'I heard that you are even brighter than me, is that true?'
        ],
        options: [
          configData?.moonOpt2_1 || 'Yes ✨',
          configData?.moonOpt2_2 || 'Not really'
        ],
        onOption: (idx) => idx === 0 ? 'twin' : 'beautiful_nudge',
      },
      {
        id: 'beautiful_nudge',
        moonMood: 'teasing',
        lines: [
          'No way...',
          configData?.moonLine3 || "Don't be shy, you look absolutely wonderful today! 💜"
        ],
        options: [
          configData?.moonOpt2_1 || 'Yes ✨',
          configData?.moonOpt2_2 || 'Not really'
        ],
        onOption: (idx) => idx === 0 ? 'twin' : 'beautiful_nudge',
      },
      {
        id: 'twin',
        moonMood: 'excited',
        lines: [
          'Perfect...',
          configData?.moonLine4 || 'So... my friend wanted to give you a surprise, can I show you?'
        ],
        options: [
          configData?.moonOpt4_1 || 'Yes, please! ✦',
          configData?.moonOpt4_2 || 'No, thanks'
        ],
        onOption: (idx) => idx === 0 ? 'done' : 'twin_nudge',
        noRepels: true,
      },
      {
        id: 'twin_nudge',
        moonMood: 'pleading',
        lines: [
          'Please?',
          configData?.moonLine5 || "Are you sure? I think you'll love it! 💜"
        ],
        options: [
          configData?.moonOpt4_1 || 'Yes, please! ✦',
          configData?.moonOpt4_2 || 'No, thanks'
        ],
        onOption: (idx) => idx === 0 ? 'done' : 'twin_nudge',
        noRepels: true,
      },
    ];
  }, [configData]);

  const stepMap = useMemo(() => {
    return Object.fromEntries(stepList.map(s => [s.id, s]));
  }, [stepList]);

  const step = stepMap[stepId] || stepList[0];

  const handleOption = useCallback((idx) => {
    trackEvent(giftId, 'Scene1', 'option_click', {
      stepId,
      optionIndex: idx,
      optionText: step.options[idx],
    });
    const nextId = step.onOption(idx);
    if (nextId === 'done') {
      setExiting(true);
      if (onAudioStart) onAudioStart();
      setTimeout(() => onProceed?.(), 900);
      return;
    }
    setStepId(nextId);
    setBubbleKey(k => k + 1);
  }, [step, stepId, onProceed, onAudioStart, giftId]);

  return (
    <div className={`scene1-wrapper ${exiting ? 'scene1-exit' : ''}`}>
      <div className="scene1-content">
        <div className="moon-container">
          <MoonFace mood={step.moonMood} />
          <span className="orbit-star s1">✦</span>
          <span className="orbit-star s2">✦</span>
          <span className="orbit-star s3">⭐</span>  
          <span className="orbit-star s4">⭐</span>
          <span className="orbit-star s5">✦</span>
          <span className="orbit-star s7">⭐</span>
        </div>

        <SpeechBubble lines={step.lines} key={bubbleKey} />

        <div className="scene1-buttons">
          <button
            className="btn-option btn-yes"
            onClick={() => handleOption(0)}
          >
            {step.options[0]}
          </button>

          {(step.noRepels && !isMobile) ? (
            <FloatingNo onNoClick={() => handleOption(1)} stepId={stepId} declineText={step.options[1]} />
          ) : (
            <button
              className="btn-option btn-no"
              onClick={() => handleOption(1)}
            >
              {step.options[1]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
