import React, { useState, useRef } from 'react';
import LetterScene from './LetterScene';
import LetterScroll from './LetterScroll';
import { useGift } from '../../context/GiftContext';
import { trackEvent } from '../../analytics';
import './Section11.css';

export default function Section11({ onNext }) {
  const { giftId } = useGift();
  const [phase, setPhase] = useState('table'); // table -> reading -> exiting
  const [currentTrack, setCurrentTrack] = useState('/bg-music-5.mp3');

  const handleTrackEnd = () => {
    setCurrentTrack(prev => prev === '/bg-music-5.mp3' ? '/bg-music-6.mp3' : '/bg-music-5.mp3');
  };

  const readStartRef = useRef(null);

  const handleOpenEnvelope = () => {
    setPhase('reading');
    readStartRef.current = Date.now();
  };

  const handleFoldLetter = () => {
    setPhase('exiting');
    if (readStartRef.current) {
      const readTime = Math.floor((Date.now() - readStartRef.current) / 1000);
      trackEvent(giftId, 'Section11', 'letter_read_time', { seconds: readTime });
    }
    setTimeout(() => {
      onNext();
    }, 1000); 
  };

  return (
    <div className="s10-root">
      {/* Background BGM */}
      <audio 
        src={currentTrack} 
        autoPlay 
        onEnded={handleTrackEnd}
        style={{ display: 'none' }} 
      />

      {/* 3D Scene - Persists throughout to handle open/close animations natively */}
      <div className={`s10-scene-wrapper ${phase === 'exiting' ? 'fade-scene' : ''}`}>
        <LetterScene 
          onOpen={handleOpenEnvelope} 
          active={phase === 'table'} 
          isFoldingBack={phase === 'exiting'}
        />
      </div>

      {/* 2D HTML Overlay for Reading */}
      <LetterScroll 
        show={phase === 'reading'} 
        onFold={handleFoldLetter} 
      />
    </div>
  );
}
