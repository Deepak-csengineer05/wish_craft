import React, { useState, useRef, useEffect } from 'react';
import './Section1.css';
import { useGift } from '../../context/GiftContext';

export default function Section1({ onNext, onVideoStart }) {
  const { configData } = useGift();
  const [showNextButton, setShowNextButton] = useState(false);
  const videoRef = useRef(null);

  const videoSrc = configData?.video2Url || "/section1.mp4";
  const endImageSrc = configData?.profileUrl || "/section1-end.png";

  useEffect(() => {
    if (videoRef.current) {
      // Start the music first
      if (onVideoStart) onVideoStart();
      
      // Delay the video slightly so the music begins playing beforehand
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.error("Section 1 video autoplay blocked:", e));
        }
      }, 800); // 800ms delay, adjust if needed for perfect sync!
    }
  }, [onVideoStart]);

  const handleVideoEnded = () => {
    setShowNextButton(true);
  };

  return (
    <div className="section1-wrapper">
      <video 
        ref={videoRef}
        src={videoSrc} 
        className="s1-video"
        onEnded={handleVideoEnded}
        preload="auto"
        playsInline
        muted
      />
      
      <div className={`s1-image-overlay ${showNextButton ? 'active' : ''}`}>
        {showNextButton && (
          <div className="s1-image-container">
            <img src={endImageSrc} alt="End scene" className="s1-end-image" onError={(e) => { e.target.onerror = null; e.target.src = "/section1-end.png"; }} />
            <div className="s1-invisible-trigger" onClick={onNext} title="Click Here to proceed"></div>
          </div>
        )}
      </div>
    </div>
  );
}
