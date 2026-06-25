import React, { useState, useRef, useEffect } from 'react';
import './Section8.css';
import DiaryScene from './DiaryScene';
import DiaryBook  from './DiaryBook';
import { trackEvent } from '../../analytics';
import { useGift } from '../../context/GiftContext';

const DEFAULT_QUOTES = [
  "There are people who bring smiles with just their words—you’re one of them. 💜",
  "You make ordinary days feel like the most beautiful just by words.",
  "Not every bond needs big words - just a quiet understanding of it.",
  "If they ask friendship as an example… I’m pretty sure it would be you.. 🌟",
  "Thank you for being the reason I smile without knowing why.",
  "Some bonds don’t need daily conversations… they just stay strong ✨",
  "In a world of changes, having a pure soul like you as a friend is a blessing. 💛",
];

const DEFAULT_TRACKS = [
  '/bg-music.mp3',
  '/bg-music-2.mp3',
  '/bg-music-3.mp3',
  '/bg-music-5.mp3',
  '/bg-music-6.mp3',
  '/bg-music-7.mp3',
];

export default function Section8({ onNext }) {
  const { giftId, configData, config } = useGift() || {};
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
  const quotes = configData?.diaryQuotes || DEFAULT_QUOTES;
  const customBgMusic = configData?.bgMusicUrl;
  const tracks = customBgMusic ? [customBgMusic, ...DEFAULT_TRACKS] : DEFAULT_TRACKS;

  const [phase,     setPhase]     = useState('table');   // 'table' | 'reading' | 'favourite'
  const [favourite, setFavourite] = useState(null);
  const [renderScene, setRenderScene] = useState(true);

  useEffect(() => {
    if (phase !== 'table') {
      const t = setTimeout(() => setRenderScene(false), 900); // Wait for fade out
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Audio State & Logic
  const bgAudioRef = useRef(null);
  const tapeAudioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); // Tape starts stopped
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (tapeAudioRef.current) {
      tapeAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (tapeAudioRef.current && isPlaying) {
      tapeAudioRef.current.pause();
      tapeAudioRef.current.load(); // Forces the new song to load
      tapeAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [trackIndex]);

  useEffect(() => {
    if (isPlaying) {
      // Pause Section BG, Play Tape
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (tapeAudioRef.current) tapeAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    } else {
      // Pause Tape, Play Section BG
      if (tapeAudioRef.current) tapeAudioRef.current.pause();
      if (bgAudioRef.current) bgAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [isPlaying]);

  const handleNextTrack = () => setTrackIndex(i => (i + 1) % tracks.length);
  const handlePrevTrack = () => setTrackIndex(i => (i - 1 + tracks.length) % tracks.length);
  const handleTogglePlay = () => setIsPlaying(prev => !prev);
  const handleVolumeUp = () => setVolume(v => Math.min(1, v + 0.1));
  const handleVolumeDown = () => setVolume(v => Math.max(0, v - 0.1));

  return (
    <div className="s8-root">
      {/* Background Audio of the Section */}
      <audio 
        ref={bgAudioRef}
        src="/bg-music-6.mp3" 
        autoPlay 
        loop
        style={{ display: 'none' }} 
      />

      {/* Tape Recorder Audio */}
      <audio 
        ref={tapeAudioRef}
        src={tracks[trackIndex]} 
        onEnded={handleNextTrack}
        style={{ display: 'none' }} 
      />

      {/* ── R3F scene layer — fades when book opens ── */}
      <div className={`s8-scene-layer ${phase !== 'table' ? 's8-faded' : ''}`}>
        {renderScene && (
          <DiaryScene 
            active={phase === 'table'} 
            onOpen={() => setPhase('reading')}
            audioControls={{
              isPlaying,
              onTogglePlay: handleTogglePlay,
              onNextTrack: handleNextTrack,
              onPrevTrack: handlePrevTrack,
              onVolumeUp: handleVolumeUp,
              onVolumeDown: handleVolumeDown
            }}
          />
        )}
      </div>

      {/* ── Book reading phase ── */}
      {phase === 'reading' && (
        <DiaryBook quotes={quotes} onComplete={() => setPhase('favourite')} />
      )}

      {/* ── Favourite quote selection ── */}
      {phase === 'favourite' && (
        <div className="s8-fav-overlay">
          <div className="s8-fav-inner">
            <div className="s8-fav-header">
              <div className="s8-fav-icon">📖</div>
              <h2>Which quote touched your heart?</h2>
              <p>Tap the one that spoke to you most</p>
            </div>

            <div className="s8-fav-grid">
              {quotes.map((q, i) => (
                <div
                  key={i}
                  className={`s8-fav-card ${favourite === i ? 'selected' : ''}`}
                  onClick={() => {
                    trackEvent(giftId, 'Section8', 'favourite_quote', {
                      quoteIndex: i,
                      quoteText: q,
                    });
                    setFavourite(i);
                  }}
                >
                  <span className="s8-fav-num">#{i + 1}</span>
                  <p className="s8-fav-text">"{q}"</p>
                  {favourite === i && <span className="s8-fav-check">{heartEmoji}</span>}
                </div>
              ))}
            </div>

            {favourite !== null && (
              <button className="s8-next-btn" onClick={onNext}>
                Go to next section ✨
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
