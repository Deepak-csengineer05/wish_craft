import React, { useState, useEffect, useRef } from 'react';
import { useGift } from '../../context/GiftContext';
import './Scene4Envelope.css';
import { trackEvent } from '../../analytics';

export default function Scene4Envelope({ onProceed, onDoorsOpen }) {
  const { giftId } = useGift();
  const [phase, setPhase] = useState('falling'); // falling, landed, button-ready, spinning, doors-opening, done
  const [crackPoints, setCrackPoints] = useState([]);
  const [clipPathLeft, setClipPathLeft] = useState('');
  const [clipPathRight, setClipPathRight] = useState('');
  const [mousePos, setMousePos] = useState({ rx: 0, ry: 0 });
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);
  const btnRef = useRef(null);
  const crackAudioRef = useRef(null);

  // Mouse physics loop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (phase === 'falling' || phase === 'done' || phase === 'doors-opening') return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const ry = ((e.clientX - centerX) / centerX) * 12;  
      const rx = -((e.clientY - centerY) / centerY) * 12;

      let bx = 0, by = 0;
      if (btnRef.current && phase === 'button-ready') {
        const rect = btnRef.current.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        if (Math.hypot(dx, dy) < 150) {
          bx = dx * 0.4;
          by = dy * 0.4;
        }
      }
      setMousePos({ rx, ry });
      setBtnPos({ x: bx, y: by });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase]);

  // Generate dynamic crack perfectly matching window size, originating from EXACT center
  useEffect(() => {
    const handleResizeOrGenerate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      
      // Generate UP crack from center
      let upPts = [];
      let x = cx;
      let y = cy;
      upPts.push({ x, y });

      while (y > -100) {
        let direction = Math.random() > 0.5 ? 1 : -1;
        let dx = direction * (5 + Math.random() * 20); 
        let dy = -(10 + Math.random() * 25);
        
        if (x < cx - 120) dx = Math.abs(dx);
        if (x > cx + 120) dx = -Math.abs(dx);

        x += dx;
        y += dy;
        upPts.push({ x, y });
      }
      
      // Generate DOWN crack from center
      let downPts = [];
      x = cx;
      y = cy;
      downPts.push({ x, y });

      while (y < h + 100) {
        let direction = Math.random() > 0.5 ? 1 : -1;
        let dx = direction * (5 + Math.random() * 20); 
        let dy = 10 + Math.random() * 25;
        
        if (x < cx - 120) dx = Math.abs(dx);
        if (x > cx + 120) dx = -Math.abs(dx);

        x += dx;
        y += dy;
        downPts.push({ x, y });
      }
      
      setCrackPoints({ up: upPts, down: downPts });

      if (upPts.length > 0 && downPts.length > 0) {
        const leftPoly = [
          `0px 0px`,
          `${upPts[upPts.length - 1].x}px 0px`,
          ...[...upPts].reverse().map(p => `${p.x}px ${p.y}px`),
          ...downPts.slice(1).map(p => `${p.x}px ${p.y}px`),
          `${downPts[downPts.length - 1].x}px ${h}px`,
          `0px ${h}px`
        ].join(', ');
        
        const rightPoly = [
          `${w}px 0px`,
          `${w}px ${h}px`,
          ...[...downPts].reverse().map(p => `${p.x}px ${p.y}px`),
          ...upPts.slice(1).map(p => `${p.x}px ${p.y}px`)
        ].join(', ');

        setClipPathLeft(`polygon(${leftPoly})`);
        setClipPathRight(`polygon(${rightPoly})`);
      }
    };
    
    handleResizeOrGenerate();
    window.addEventListener('resize', handleResizeOrGenerate);
    return () => window.removeEventListener('resize', handleResizeOrGenerate);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('landed'), 1600);
    const t2 = setTimeout(() => setPhase('button-ready'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Audio Effects
  useEffect(() => {
    if (phase === 'cracking') {
      const audio = new Audio('/crack.mp3');
      audio.volume = 0.6;
      crackAudioRef.current = audio;
      audio.play().catch(e => console.log('Crack audio error:', e));
    } else if (phase === 'doors-opening' && crackAudioRef.current) {
      const audio = crackAudioRef.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 50); // Fades out smoothly over ~500ms
    }

    return () => {
      if (crackAudioRef.current) {
        crackAudioRef.current.pause();
      }
    };
  }, [phase]);

  const handleButtonClick = () => {
    if (phase !== 'button-ready') return;
    trackEvent(giftId, 'Scene4', 'moon_button_click', { clicked: true });
    setPhase('spinning');
    setMousePos({ rx: 0, ry: 0 });
    setBtnPos({ x: 0, y: 0 });

    setTimeout(() => {
      setPhase('cracking'); 
      setTimeout(() => {
        setPhase('doors-opening');
        if (onDoorsOpen) onDoorsOpen();
        setTimeout(() => {
          setPhase('done');
          if (onProceed) onProceed();
        }, 3500); 
      }, 7000); 
    }, 800);
  };

  const renderParticles = () => {
    return Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="burst-particle" style={{ '--angle': `${i * 30}deg` }} />
    ));
  };

  const renderPath = (pts, pathId) => {
    return pts.map((p1, i) => {
      if (i === pts.length - 1) return null;
      const p2 = pts[i+1];
      
      const t = i / pts.length;
      const thickness = 8 * (1 - t) + 1; 
      
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const segDur = 7.0 / pts.length;
      const delayS = i * segDur;

      return (
        <line 
          key={`${pathId}-${i}`}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke="#d4a853"
          strokeWidth={thickness}
          strokeLinecap="round"
          className="dynamic-crack-segment"
          style={{
            opacity: (phase === 'cracking' || phase === 'doors-opening' || phase === 'done') ? 1 : 0,
            strokeDasharray: Math.ceil(len) + 2, 
            strokeDashoffset: (phase === 'cracking' || phase === 'doors-opening' || phase === 'done') ? 0 : Math.ceil(len) + 2,
            transition: phase === 'cracking' ? `stroke-dashoffset ${segDur}s linear ${delayS}s` : 'none',
            filter: `drop-shadow(0 0 6px #d4a853)`
          }}
        />
      );
    });
  };

  const renderCrackSegments = () => {
    if (!crackPoints.up || !crackPoints.down) return null;
    return (
      <>
        {renderPath(crackPoints.up, 'up')}
        {renderPath(crackPoints.down, 'down')}
      </>
    );
  };

  return (
    <div className={`sc4-wrapper ${phase}`} ref={wrapperRef}>
      <div className="sc4-sky" />

      {/* Sliding Doors with dynamic clip paths and identical SVG lightning crack segments */}
      <div className={`sc4-door sc4-door-left ${phase === 'doors-opening' || phase === 'done' ? 'open' : ''}`} style={{ clipPath: clipPathLeft }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {renderCrackSegments()}
        </svg>
      </div>
      <div className={`sc4-door sc4-door-right ${phase === 'doors-opening' || phase === 'done' ? 'open' : ''}`} style={{ clipPath: clipPathRight }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {renderCrackSegments()}
        </svg>
      </div>

      <div className={`sc4-flash ${phase === 'spinning' ? 'flash-active' : ''}`} />

      <div className={`sc4-envelope-container 
        ${phase === 'falling' ? 'anim-drop' : ''} 
        ${phase === 'landed' || phase === 'button-ready' ? 'anim-settle envelope-float' : ''}
        ${phase === 'spinning' ? 'envelope-intense-glow' : ''}
        ${phase === 'doors-opening' || phase === 'done' ? 'fade-out' : ''}
      `}>
        
        <div 
          className="sc4-physics-wrapper"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.rx}deg) rotateY(${mousePos.ry}deg)`,
            transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <div className="sc4-envelope">
            <svg viewBox="0 0 320 220" className="sc4-env-svg">
              {/* Envelope Base perfectly aligned dynamically with theme */}
              <rect x="0" y="0" width="320" height="220" rx="8" fill="hsl(var(--theme-hue, 198), 70%, 15%)" />
              <path d="M 0,0 L 160,115 L 320,0 Z" fill="hsl(var(--theme-hue, 198), 65%, 28%)" />
              <path d="M 0,0 L 160,115 L 0,220 Z" fill="hsl(var(--theme-hue, 198), 65%, 22%)" />
              <path d="M 320,0 L 160,115 L 320,220 Z" fill="hsl(var(--theme-hue, 198), 65%, 22%)" />
              <path d="M 0,220 L 160,110 L 320,220 Z" fill="hsl(var(--theme-hue, 198), 65%, 33%)" />
              <path d="M 0,0 L 160,115 L 320,0" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 0,220 L 160,110 L 320,220" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="4" strokeLinejoin="round" />
              
              {/* Wax Seal Base with static Crescent Moon inside */}
              <circle cx="160" cy="115" r="26" fill="hsl(var(--theme-hue, 198), 70%, 12%)" stroke="hsl(var(--theme-hue, 198), 80%, 8%)" strokeWidth="2" />
              <g transform="translate(147, 102) scale(1.1)">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="hsl(var(--theme-hue, 198), 70%, 45%)" />
              </g>

              {/* Custom Envelope Text */}
              <text x="160" y="58" fontSize="16" fill="hsl(var(--theme-hue, 198), 75%, 75%)" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--font-primary, sans-serif)', letterSpacing: '1px', fontStyle: 'italic' }}>
                Are you waiting to explore ?
              </text>
            </svg>

            {phase !== 'falling' && phase !== 'landed' && (
              <div 
                className="sc4-btn-wrapper"
                style={{
                  transform: `translate(calc(-50% + ${btnPos.x}px), calc(-50% + ${btnPos.y}px))`,
                  transition: btnPos.x === 0 ? 'transform 0.5s ease' : 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <button 
                  ref={btnRef}
                  className={`sc4-moon-btn ${phase === 'button-ready' ? 'btn-idle' : ''} ${phase === 'spinning' ? 'btn-spin' : ''}`}
                  onClick={handleButtonClick}
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </button>
                {phase === 'spinning' && renderParticles()}
              </div>
            )}

            <div className={`sc4-hint ${phase === 'button-ready' ? 'show-hint' : ''} ${phase === 'spinning' || phase === 'cracking' ? 'fade-out' : ''}`}>
              Click the moon... 🌙
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
