import React, { useState, useEffect, useRef } from 'react';
import { useGift } from '../context/GiftContext';
import './BirthdayExperience.css';

import Scene1Twin from '../scenes/Scene1Twin/Scene1Twin';
import Scene2Countdown from '../scenes/Scene2Countdown/Scene2Countdown';
import Scene3Fireworks from '../scenes/Scene3Fireworks/Scene3Fireworks';
import Scene4Envelope from '../scenes/Scene4Envelope/Scene4Envelope';
import SceneVideo from '../scenes/SceneVideo/SceneVideo';
import MainSections from '../scenes/MainSections/MainSections';
import GalleryHub from './GalleryHub';

export default function BirthdayExperience({ isRevisit = false }) {
  const { configData, isSectionActive } = useGift();

  const getIntroScenes = () => {
    const list = [];
    if (isSectionActive('scene1')) list.push(0);
    if (isSectionActive('scene2')) list.push(1);
    if (isSectionActive('scene3')) list.push(2);
    if (isSectionActive('section1')) list.push(3);
    if (isSectionActive('scene4')) list.push(4);
    list.push('hub');
    return list;
  };

  const introScenes = getIntroScenes();
  const initialScene = isRevisit ? 'hub' : (introScenes[0] !== undefined ? introScenes[0] : 'hub');

  const [sceneIndex, setSceneIndex] = useState(initialScene); 
  const [isHubMode, setIsHubMode] = useState(isRevisit || initialScene === 'hub');
  const [mainSectionToLoad, setMainSectionToLoad] = useState(1);
  const audioRef = useRef(null);
  const audio2Ref = useRef(null);
  
  const preloadVid1 = useRef(null);
  const preloadVid2 = useRef(null);

  const next = () => {
    if (isHubMode) {
      setSceneIndex('hub');
    } else {
      const activeScenesList = getIntroScenes();
      const currentPos = activeScenesList.indexOf(sceneIndex);
      if (currentPos !== -1 && currentPos < activeScenesList.length - 1) {
        const nextScene = activeScenesList[currentPos + 1];
        if (nextScene === 'hub') {
          setIsHubMode(true);
        }
        setSceneIndex(nextScene);
      } else {
        setIsHubMode(true);
        setSceneIndex('hub');
      }
    }
  };

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
    }
  };

  const startBgMusic2 = () => {
    if (audio2Ref.current) {
      audio2Ref.current.currentTime = 0;
      audio2Ref.current.volume = 0.6;
      audio2Ref.current.play().catch(e => console.log('Audio 2 play error:', e));
    }
  };

  const stopBgMusic2 = () => {
    if (audio2Ref.current && audio2Ref.current.volume > 0) {
      const audio = audio2Ref.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 150);
    }
  };

  useEffect(() => {
    // Force browser to start buffering heavy videos immediately upon entering experience
    if (preloadVid1.current) preloadVid1.current.load();
    if (preloadVid2.current) preloadVid2.current.load();

    // Preload important images dynamically with user configuration fallback support
    const imagesToPreload = [
      configData?.profileUrl || '/profile.jpeg',
      configData?.polaroidUrls?.[1] || '/pic1.jpeg',
      configData?.polaroidUrls?.[2] || '/pic2.jpeg',
      configData?.polaroidUrls?.[3] || '/pic3.jpeg',
      configData?.polaroidUrls?.[4] || '/pic4.jpeg',
      '/section3-flower-ref.png', 
      '/section3-balloon-ref.png'
    ];
    imagesToPreload.forEach(src => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });

    const audiosToPreload = ['/bg-music-3.mp3', '/firework.mp3', '/crack.mp3'];
    audiosToPreload.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'audio';
      document.head.appendChild(link);
    });
  }, [configData]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (sceneIndex >= 4 || sceneIndex === 'hub') {
      const audio = audioRef.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 150);

      return () => clearInterval(fadeInterval);
    }
  }, [sceneIndex]);

  useEffect(() => {
    if (sceneIndex === 'hub') {
      stopBgMusic2();
    }
  }, [sceneIndex]);

  // Load custom media assets
  const video1 = configData?.video1Url || '/video.mp4';
  const video2 = configData?.video2Url || '/section1.mp4';
  const bgMusicMain = configData?.bgMusicUrl || '/bg-music.mp3';

  return (
    <div className="experience-wrapper">
      {/* ── Preload Heavy Video Assets early ── */}
      <video ref={preloadVid1} style={{ display: 'none' }} preload="auto" playsInline src={video1} />
      <video ref={preloadVid2} style={{ display: 'none' }} preload="auto" playsInline src={video2} />

      <audio ref={audioRef} src={bgMusicMain} loop />
      <audio ref={audio2Ref} src="/bg-music-2.mp3" loop />

      {sceneIndex === 0 && <Scene1Twin onProceed={next} onAudioStart={startAudio} />}
      {sceneIndex === 1 && <Scene2Countdown onProceed={next} />}
      {sceneIndex === 2 && <Scene3Fireworks onProceed={next} />}
      {sceneIndex === 3 && <SceneVideo onProceed={next} />}
      {sceneIndex === 4 && <Scene4Envelope onProceed={next} />}
      {sceneIndex === 5 && (
        <MainSections 
          onProceed={next} 
          onVideoStart={startBgMusic2} 
          onSection5Start={stopBgMusic2} 
          initialSection={mainSectionToLoad}
          isHubMode={isHubMode}
        />
      )}
      {sceneIndex === 'hub' && (
        <GalleryHub 
          onSelectScene={(idx) => {
            setIsHubMode(true);
            setSceneIndex(idx);
          }}
          onSelectSection={(sectionNum) => {
            setIsHubMode(true);
            setMainSectionToLoad(sectionNum);
            setSceneIndex(5);
          }}
        />
      )}

      {/* Floating Back to Hub Button */}
      {isHubMode && sceneIndex !== 'hub' && (
        <button 
          className="back-to-hub-btn"
          onClick={() => setSceneIndex('hub')}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            letterSpacing: '1px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>←</span> Back to Hub
        </button>
      )}
    </div>
  );
}
