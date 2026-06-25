import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import './Section4.css';
import { trackEvent } from '../../analytics';
import { useGift } from '../../context/GiftContext';

export default function Section4({ onNext }) {
  const { giftId, configData, config } = useGift();
  const [activeIndex, setActiveIndex] = useState(0);
  const [openedBoxes, setOpenedBoxes] = useState([false, false, false, false, false]);
  const [lettersViewed, setLettersViewed] = useState([false, false, false, false, false]);
  const [activeLetter, setActiveLetter] = useState(null); // null or 0-4
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState(null); // 'yes' or 'no'
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const themeHue = config?.theme_hue ?? 198;
  const getThemedHeartEmoji = (hue) => {
    if (hue >= 250 && hue <= 290) return '💜'; // Violet
    if (hue > 290 && hue <= 350) return '💖';  // Pink
    if (hue > 350 || hue <= 15) return '❤️';   // Red
    if (hue > 15 && hue <= 50) return '💛';    // Yellow/Orange
    if (hue > 50 && hue <= 160) return '💚';   // Green
    if (hue > 160 && hue <= 205) return '🩵';  // Teal
    return '💙';                              // Navy/Blue
  };
  const heartEmoji = getThemedHeartEmoji(themeHue);

  const letters = [
    {
      image: configData?.giftBoxUrls?.[1] || "gift1.jpeg",
      text: configData?.giftBoxText1 || "A beautiful memory \n\nEvery day spent with you is a gift in itself."
    },
    {
      image: configData?.giftBoxUrls?.[2] || "gift2.jpeg",
      text: configData?.giftBoxText2 || "Your unique vibe 💜..\n\nYou bring so much color and joy into my world."
    },
    {
      image: configData?.giftBoxUrls?.[3] || "gift3.jpeg",
      text: configData?.giftBoxText3 || "Special moments 😊.\n\nThank you for always being there and making me smile."
    },
    {
      image: configData?.giftBoxUrls?.[4] || "pic1.jpeg",
      text: configData?.giftBoxText4 || "A bright future 💫\n\nMay all your dreams and wishes come true."
    },
    {
      image: configData?.giftBoxUrls?.[5] || "pic4.jpeg",
      text: configData?.giftBoxText5 || "A token of appreciation\n\nBecause you deserve the best on your special day."
    }
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleBox = useCallback((index) => {
    if (showFeedback) return;
    
    setOpenedBoxes((prev) => {
      const newOpened = [...prev];
      newOpened[index] = !newOpened[index];
      
      if (newOpened[index]) {
        // Box just opened
        trackEvent(giftId, 'Section4', 'gift_box_open', { boxIndex: index });
        setActiveLetter(index);
        setLettersViewed(prevViewed => {
          const newViewed = [...prevViewed];
          newViewed[index] = true;
          return newViewed;
        });
      } else {
        // Box just closed
        if (activeLetter === index) {
          setActiveLetter(null);
        }
      }
      return newOpened;
    });
  }, [giftId, activeLetter, showFeedback]);

  const closeLetter = useCallback(() => {
    setActiveLetter(null);
    // Also close the box visually
    setOpenedBoxes(prev => {
      const newOpened = [...prev];
      if (activeLetter !== null) {
        newOpened[activeLetter] = false;
      }
      return newOpened;
    });
  }, [activeLetter]);

  // Check if all viewed and letter overlay is closed
  useEffect(() => {
    if (activeLetter === null && lettersViewed.every(v => v === true)) {
      // Small timeout to allow letter to transition down before showing dialog
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeLetter, lettersViewed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFeedback || activeLetter !== null) return; // Block navigation if letter open or feedback showing

      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % 5);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + 5) % 5);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent page scroll
        toggleBox(activeIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, activeLetter, showFeedback, toggleBox]);

  const handleFeedback = (response) => {
    trackEvent(giftId, 'Section4', 'feedback_response', { response });
    setFeedbackResponse(response);
  };

  const handleTouchStart = (e) => {
    if (activeLetter !== null || showFeedback) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) { // minimum threshold for swipe
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % 5);
      } else {
        setActiveIndex((prev) => (prev - 1 + 5) % 5);
      }
    }
    setTouchStart(null);
  };

  return (
    <div 
      className="section4-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="section-heading">
        <h1>Some gifts for you</h1>
      </div>
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 2.5, 9.5], fov: isMobile ? 65 : 45 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
        >
          <Experience 
            activeIndex={activeIndex}
            openedBoxes={openedBoxes}
            onBoxClick={(index) => {
              if (activeLetter !== null) {
                // If a letter is open, clicking anywhere on canvas could close it, or we do nothing.
                return;
              }
              setActiveIndex(index);
              toggleBox(index);
            }}
          />
        </Canvas>
      </div>

      <div className="ui-overlay">
        {!showFeedback && activeLetter === null && (
          <div className="controls-hint">
            Use <kbd>←</kbd> <kbd>→</kbd> to select, <kbd>Space</kbd> or Click to open
          </div>
        )}
      </div>

      <div className={`letter-overlay ${activeLetter !== null ? 'visible' : ''}`} style={{ pointerEvents: activeLetter !== null ? 'auto' : 'none' }}>
        <div className={`letter-content ${activeLetter !== null ? 'show' : ''}`}>
          <button className="letter-close-btn" onClick={closeLetter}>×</button>
          <div className="letter-body">
            {activeLetter !== null && (
              <>
                <div className="letter-image-container">
                  {letters[activeLetter].image ? (
                    <img src={letters[activeLetter].image} alt={`Memory ${activeLetter + 1}`} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#4c1d95'; }} />
                  ) : (
                    <div className="image-placeholder">
                      <span>📸 Add Your Image Here</span>
                    </div>
                  )}
                </div>
                <div className="letter-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {letters[activeLetter].text}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`feedback-dialog-overlay ${showFeedback ? 'show' : ''}`}>
        <div className="feedback-dialog">
          <h2>Do you like these gifts?</h2>
          
          {!feedbackResponse && (
            <div className="feedback-buttons">
              <button className="feedback-btn yes" onClick={() => handleFeedback('yes')}>I love them! {heartEmoji}</button>
              <button className="feedback-btn no" onClick={() => handleFeedback('no')}>Not really</button>
            </div>
          )}
          
          {feedbackResponse === 'yes' && (
            <div className="feedback-response">
              <p>I'm so glad they brought a smile to your face! Ready to see what's next?</p>
              <button className="next-section-btn" onClick={onNext}>Continue ✨</button>
            </div>
          )}

          {feedbackResponse === 'no' && (
            <div className="feedback-response">
              <p>I'm sorry they didn't match your expectations. I promise to make the next parts even better!</p>
              <button className="next-section-btn" onClick={onNext}>Continue ✨</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
