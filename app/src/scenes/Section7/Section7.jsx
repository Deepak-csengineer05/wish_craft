import React, { useState, useMemo, useEffect } from 'react';
import './Section7.css';
import ScratchCard from './ScratchCard';
import { trackEvent } from '../../analytics';
import { useGift } from '../../context/GiftContext';

export default function Section7({ onNext }) {
  const { giftId, configData } = useGift();
  const [focusedId, setFocusedId] = useState(null);
  const [transformedIds, setTransformedIds] = useState([]);
  const [isSectionComplete, setIsSectionComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const CARDS = useMemo(() => {
    if (configData?.scratchCount) {
      return Array.from({ length: configData.scratchCount }, (_, i) => i + 1);
    }
    const uploadedKeys = Object.keys(configData?.scratchUrls || {});
    if (uploadedKeys.length > 0) {
      return uploadedKeys.map(k => parseInt(k, 10)).sort((a, b) => a - b);
    }
    return [1, 2, 3, 4, 5, 6, 7];
  }, [configData]);

  // Generate random static stars for the background once
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`
    }));
  }, []);

  const handleCardClick = (id) => {
    if (focusedId === id) return;
    setFocusedId(id);
  };

  const closeFocus = () => {
    setFocusedId(null);
    if (transformedIds.length === CARDS.length && !isSectionComplete) {
      setTimeout(() => setIsSectionComplete(true), 2000);
    }
  };

  const handleTransformComplete = (id) => {
    if (!transformedIds.includes(id)) {
      trackEvent(giftId, 'Section7', 'scratch_reveal', {
        cardId: id,
        revealOrder: transformedIds.length + 1,
      });
      setTransformedIds(prev => [...prev, id]);
    }
  };

  const getCardImageSrc = (id, isGhibliStyle = false) => {
    if (isGhibliStyle) {
      const ghibliUrl = configData?.scratchGhibliUrls?.[id];
      if (ghibliUrl) return ghibliUrl;
      return `/sec7pic${id}Ghibli.${id === 6 ? 'png' : 'jpeg'}`;
    }
    const origUrl = configData?.scratchUrls?.[id];
    if (origUrl) return origUrl;
    return `/sec7pic${id}.${[4, 5, 7].includes(id) ? 'png' : 'jpeg'}`;
  };

  return (
    <div className={`section7-container ${isSectionComplete ? 'section-complete' : ''}`}>
      
      {/* Background Audio */}
      <audio src="/bg-music-4.webm" autoPlay loop />
      
      {/* Drifting Galaxy Nebulas */}
      <div className="s7-nebula s7-nebula-1"></div>
      <div className="s7-nebula s7-nebula-2"></div>
      <div className="s7-nebula s7-nebula-3"></div>
      <div className="s7-nebula s7-nebula-4"></div>

      {/* Dynamic Starfield */}
      <div className="s7-starfield-container">
        {stars.map(star => (
          <div key={star.id} className="s7-star" style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}></div>
        ))}
      </div>

      {/* Edge Vignette */}
      <div className="section7-vignette"></div>
      
      {/* Title */}
      <div className={`s7-header ${focusedId !== null ? 'fade-out' : ''}`}>
        <h1>Stellar Transformations</h1>
        <p>Choose a star, uncover the memory, and tap to reveal the magic.</p>
      </div>

      {isMobile ? (
        <div className="s7-mobile-carousel" style={{ display: focusedId !== null ? 'none' : 'flex' }}>
          {CARDS.map((id) => {
            const isTransformed = transformedIds.includes(id);
            return (
              <div 
                key={`mobile-${id}`}
                className={`s7-mobile-card ${isTransformed ? 'transformed' : ''}`}
                onClick={() => handleCardClick(id)}
              >
                <div className="mini-card-visual">
                  {isTransformed ? (
                    <img 
                      src={getCardImageSrc(id, true)} 
                      alt={`Thumbnail ${id}`} 
                      className="mini-ghibli-layer" 
                      style={{ objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getCardImageSrc(id, false);
                      }}
                    />
                  ) : (
                    <div className="mini-scratch-layer">
                      <span>Scratch to reveal</span>
                    </div>
                  )}
                  <div className="mini-border-glow"></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="s7-perspective-scene">
          <div className={`s7-orbit-ring ${focusedId !== null ? 'paused' : 'spinning'}`}>
            
            <div className="s7-orbit-center-star">
              <div className="moon-sphere"></div>
            </div>

            {CARDS.map((id, index) => {
               const rotateZAngle = (index / CARDS.length) * 360;
               const isTransformed = transformedIds.includes(id);
               const isHidden = focusedId === id; // Hide the orbiting copy when focused

               return (
                 <div 
                   key={`orbit-${id}`}
                   className="s7-orbit-pivot" 
                   style={{ '--angle': `${rotateZAngle}deg` }}
                 >
                   <div className="s7-orbit-item-container">
                     <div 
                       className={`s7-card-counter-rotator ${isHidden ? 'hidden' : ''} ${isTransformed ? 'transformed' : ''}`}
                       onClick={() => handleCardClick(id)}
                     >
                        {/* Miniature representation for the orbit with nice V1 stars */}
                        <div className="mini-card-visual">
                          {isTransformed ? (
                            <img 
                              src={getCardImageSrc(id, true)} 
                              alt={`Thumbnail ${id}`} 
                              className="mini-ghibli-layer" 
                              style={{ objectFit: 'cover' }} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getCardImageSrc(id, false);
                              }}
                            />
                          ) : (
                            <div className="mini-scratch-layer">
                              <span>Scratch to reveal</span>
                            </div>
                          )}
                          <div className="mini-border-glow"></div>
                        </div>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Focused Center Card (Flat to screen to ensure reliable scratching) */}
      <div className={`s7-focus-layer ${focusedId !== null ? 'active' : ''}`}>
        {focusedId !== null && (
          <div className="s7-focused-safe-zone">
            <ScratchCard 
              id={focusedId}
              isFocused={true}
              isInitiallyTransformed={transformedIds.includes(focusedId)}
              onTransformComplete={() => handleTransformComplete(focusedId)}
              onReturn={closeFocus}
            />
          </div>
        )}
      </div>

      {/* Grand Finale Overlay */}
      <div className={`s7-finale-overlay ${isSectionComplete ? 'show' : ''}`}>
        <div className="s7-finale-content">
          <h2>Did you like these?</h2>
          <p>Every memory with you rests safely among the stars.</p>
          <button className="next-section-btn s7-next" style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '30px', cursor: 'pointer', background: 'var(--grad-violet-glow)', boxShadow: '0 8px 25px var(--violet-glow)', border: 'none', color: '#fff', marginTop: '20px' }} onClick={onNext}>
            Next Section
          </button>
        </div>
      </div>
      
    </div>
  );
}
