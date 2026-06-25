import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGift } from '../../context/GiftContext';
import { trackEvent } from '../../analytics';
import './Scene3Fireworks.css';

/* ─── Canvas Fireworks Helpers ─── */
class Particle {
  constructor(x, y, color, speed = 1, sizeMultiplier = 1) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = (Math.random() * 2.5 + 0.8) * speed; 
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.color = color;
    this.alpha = 1;
    this.decay = 0.003 + Math.random() * 0.005; 
    this.size  = (Math.random() * 2.8 + 0.8) * sizeMultiplier;
  }
  update() {
    this.vx *= 0.95; 
    this.vy *= 0.95;
    this.vy += 0.015; 
    this.x  += this.vx; this.y  += this.vy;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur  = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Rocket {
  constructor(targetX, targetY, color, isHuge = false) {
    this.x  = Math.random() * window.innerWidth;
    this.y  = window.innerHeight + 10;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const spd  = isHuge ? 7 : 4.5 + Math.random() * 1.5; 
    this.vx = (dx / dist) * spd;
    this.vy = (dy / dist) * spd;
    this.tx = targetX; this.ty = targetY;
    this.color = color;
    this.trail = [];
    this.dead  = false;
    this.explodeCb = null;
    this.isHuge = isHuge;
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > (this.isHuge ? 12 : 6)) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    const dx = this.tx - this.x, dy = this.ty - this.y;
    if (dx * this.vx + dy * this.vy <= 0) {
      this.dead = true;
      this.explodeCb?.(this.x, this.y);
    }
  }
  draw(ctx) {
    ctx.beginPath();
    if (this.trail.length > 1) {
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      this.trail.forEach(p => ctx.lineTo(p.x, p.y));
    }
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = this.isHuge ? 4 : 2.2;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }
}

const PALETTE = [
  '#ff3b30', '#ff9500', '#ffcc00', '#4cd964', '#5ac8fa', 
  '#007aff', '#5856d6', '#ff2d55', '#b39ddb', '#e8e0f5', 
  '#00ffcc', '#ff00ff'
];

const playFireworkSound = (isHuge) => {
  try {
    const audio = new Audio('/firework.mp3');
    audio.volume = isHuge ? 0.2 : 0.05 + Math.random() * 0.15;
    audio.playbackRate = isHuge ? 0.7 : 0.9 + Math.random() * 0.4;
    audio.play().catch(() => {});
  } catch {}
};

function makeExplosion(x, y, particles, count = 55, speed = 1, sizeMultiplier = 1) {
  playFireworkSound(sizeMultiplier > 1.5);
  
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color, speed, sizeMultiplier));
  }
  if (sizeMultiplier > 1.5) {
     for (let i = 0; i < count/2; i++) {
       particles.push(new Particle(x, y, '#d4a853', speed * 1.2, sizeMultiplier * 0.8));
     }
  }
}

/* ─── Main Component ─── */
export default function Scene3Fireworks({ onProceed }) {
  const { giftId, recipientName, configData } = useGift();
  const nickname = configData?.nickname || '';
  const canvasRef   = useRef(null);
  const particleRef = useRef([]);
  const rocketRef   = useRef([]);

  const [showHappy, setShowHappy]       = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const [fadeRecipient, setFadeRecipient] = useState(false);
  const [showNickname, setShowNickname]   = useState(false);
  
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    trackEvent(giftId, 'Scene3', 'watch_fireworks');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let raf;
    const sz = { w: 0, h: 0 };
    const resize = () => { sz.w = canvas.width = window.innerWidth; sz.h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    canvas._launchTargeted = (tx, ty, count, speed, sizeMult, cb) => {
      const r = new Rocket(tx, ty, PALETTE[Math.floor(Math.random() * PALETTE.length)], sizeMult > 1.5);
      r.explodeCb = (x, y) => {
        makeExplosion(x, y, particleRef.current, count, speed, sizeMult);
        cb?.();
      };
      rocketRef.current.push(r);
    };

    let bgCounter = 0;
    const loop = () => {
      ctx.fillStyle = 'rgba(1, 0, 12, 0.15)';
      ctx.fillRect(0, 0, sz.w, sz.h);

      bgCounter++;
      const isIntro = bgCounter < 60 * 4; 
      const freq = isIntro ? 70 : 130;
      const maxRockets = isIntro ? 12 : 5;

      if (bgCounter % freq === 0 && rocketRef.current.length < maxRockets) {
        const tx = sz.w * (0.1 + Math.random() * 0.8);
        const ty = sz.h * (0.1 + Math.random() * 0.4);
        const r  = new Rocket(tx, ty, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        r.explodeCb = (x, y) => makeExplosion(x, y, particleRef.current, isIntro ? 80 : 50, isIntro ? 1.5 : 1);
        rocketRef.current.push(r);
      }

      for (let i = rocketRef.current.length - 1; i >= 0; i--) {
        rocketRef.current[i].update();
        rocketRef.current[i].draw(ctx);
        if (rocketRef.current[i].dead) rocketRef.current.splice(i, 1);
      }

      for (let i = particleRef.current.length - 1; i >= 0; i--) {
        particleRef.current[i].update();
        particleRef.current[i].draw(ctx);
        if (particleRef.current[i].alpha <= 0) particleRef.current.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [giftId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const timers = [];
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    T(() => setShowHappy(true), 4000);
    T(() => setShowBirthday(true), 6000);
    T(() => setShowRecipient(true), 8000);

    T(() => {
      canvas?._launchTargeted(window.innerWidth * 0.15, window.innerHeight * 0.3, 180, 2.0, 2.0);
      canvas?._launchTargeted(window.innerWidth * 0.85, window.innerHeight * 0.3, 180, 2.0, 2.0);
    }, 10000);

    T(() => {
      if (nickname) {
        setFadeRecipient(true);
      }
    }, 12000);

    T(() => {
      if (nickname) {
        const tx = window.innerWidth * 0.5;
        const ty = window.innerHeight * 0.7; 
        canvas?._launchTargeted(tx, ty, 80, 1.2, 1, () => {
           setShowNickname(true);
        });
      }
    }, 13000);

    T(() => {
      canvas?._launchTargeted(window.innerWidth * 0.3, window.innerHeight * 0.45, 150, 2.2, 2.2);
      canvas?._launchTargeted(window.innerWidth * 0.7, window.innerHeight * 0.45, 150, 2.2, 2.2);
    }, 15000);

    T(() => {
      const tx = window.innerWidth * 0.5;
      const ty = window.innerHeight * 0.4; 
      canvas?._launchTargeted(tx, ty, 300, 3.0, 3.0);
    }, 17000);

    T(() => {
      setExiting(true);
      setTimeout(() => onProceed?.(), 1400);
    }, 20500);

    return () => timers.forEach(clearTimeout);
  }, [onProceed, nickname]);

  return (
    <div className={`sc3-wrapper ${exiting ? 'sc3-exit' : ''}`}>
      <canvas ref={canvasRef} className="sc3-canvas" />

      <div className="sc3-text-layer">
        <h1 className={`sc3-word-happy ${showHappy ? 'vis' : ''}`}>
          Happy
        </h1>
        <h1 className={`sc3-word-bday ${showBirthday ? 'vis' : ''}`}>
           Birthday
        </h1>
        
        <div className="sc3-name-slot">
          <h1 className={`sc3-word-recipient ${showRecipient ? 'vis' : ''} ${(fadeRecipient && nickname) ? 'fade-out' : ''}`}>
            {recipientName}
          </h1>
          {nickname && (
            <h1 className={`sc3-word-nickname ${showNickname ? 'vis' : ''}`}>
              {nickname}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}
