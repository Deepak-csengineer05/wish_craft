import React, { useRef, useEffect } from 'react';
import { useGift } from '../../context/GiftContext';
import './SceneVideo.css';

export default function SceneVideo({ onProceed }) {
  const { configData } = useGift();
  const videoRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      onProceed();
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video autoplay blocked by browser:", e));
    }
  }, [onProceed]);

  if (window.innerWidth <= 768) {
    return null;
  }

  const videoSrc = configData?.video1Url || "/video.mp4";

  return (
    <div className="scene-video-wrapper">
      <video 
        ref={videoRef}
        src={videoSrc} 
        className="full-screen-video"
        onEnded={onProceed}
        preload="auto"
        playsInline
      />
    </div>
  );
}
