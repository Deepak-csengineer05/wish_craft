import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import Cake3D from './Cake3D';
import './Section5.css';
import { trackEvent } from '../../analytics';

const ConfettiItem = ({ style }) => <div className="confetti-item" style={style} />;

const ConfettiContainer = () => {
    // Generate static stable array so they don't rerender randomly
    const [pieces] = useState(() => Array.from({ length: 80 }).map((_, i) => {
        const left = Math.random() * 100;
        const width = 6 + Math.random() * 8;
        const height = 10 + Math.random() * 12;
        const color = ['#ff7b00', '#ffd54f', '#8352db', '#ff3366', '#a1c4fd'][Math.floor(Math.random() * 5)];
        const animationDelay = Math.random() * 5 + 's';
        const animationDuration = 3 + Math.random() * 4 + 's';
        
        return (
            <ConfettiItem 
                key={i} 
                style={{ 
                    left: `${left}%`, 
                    width: `${width}px`, 
                    height: `${height}px`, 
                    backgroundColor: color,
                    animationDelay,
                    animationDuration
                }} 
            />
        );
    }), []);

    return <div className="confetti-container">{pieces}</div>;
};

export default function Section5({ onNext }) {
  const [blownCandles, setBlownCandles] = useState([]);
  const [isTopView, setIsTopView] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const sectionAudioRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Countdown timer logic for mic start
  useEffect(() => {
    if (countdown === null || countdown === 0) return;
    
    if (countdown > 0) {
        const timer = setTimeout(() => {
            if (countdown === 1) {
                setCountdown(0);
                setShowConfetti(true);
                if (sectionAudioRef.current) {
                    sectionAudioRef.current.volume = 0.7;
                    sectionAudioRef.current.play().catch(e => console.log('Section 5 audio play error:', e));
                }
            } else {
                setCountdown(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if all blown
  useEffect(() => {
    if (blownCandles.length === 5) {
        // Trigger cinematic POV Shift
        setTimeout(() => setIsTopView(true), 1200); // Wait bit after last candle blows
    }
  }, [blownCandles]);

  // Once top view is reached, show text
  useEffect(() => {
    if (isTopView) {
        setTimeout(() => setShowText(true), 1500); // Camera shift takes ~1.5s
    }
  }, [isTopView]);

  return (
    <div className="section5-container">
        <audio ref={sectionAudioRef} src="/section5-music.mp3" loop />
        {showConfetti && <ConfettiContainer />}
        
        {/* UI Overlay */}
        <div className={`mic-ui ${isTopView ? 'hidden' : ''}`}>
           {countdown !== null && countdown > 0 && (
               <div className="countdown-text">
                   {countdown}
               </div>
           )}
           {blownCandles.length < 5 && countdown === null && (
             <button className="mic-btn" onClick={() => setCountdown(3)}>
                Blow the candles! ✨
             </button>
           )}
           {countdown === 0 && blownCandles.length < 5 && (
             <div className="mic-active-text" style={{ fontSize: '1.4rem', color: 'var(--violet-light)', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                 Tap each candle to blow it out! 
             </div>
           )}
        </div>

        <Canvas 
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [0, 4, 8], fov: isMobile ? 65 : 45 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
        >
            <CameraRig isTopView={isTopView} />
            <ambientLight intensity={0.9} />
            <directionalLight 
               position={[5, 12, 5]} 
               intensity={1.0} 
               castShadow 
               shadow-mapSize={[1024, 1024]}
               shadow-camera-near={1}
               shadow-camera-far={20}
               shadow-camera-left={-5}
               shadow-camera-right={5}
               shadow-camera-top={5}
               shadow-camera-bottom={-5}
               shadow-bias={-0.0005}
            />
            <directionalLight position={[-4, 5, -8]} intensity={0.4} />
            <Environment preset="studio" />
            
            <Cake3D 
               blownCandles={blownCandles} 
               showText={showText}
                onBlowCandle={(index) => {
                    if (!blownCandles.includes(index)) {
                        trackEvent('Section5', 'candle_blown', {
                          candleIndex: index,
                          blownOrder: blownCandles.length + 1,
                        });
                        setBlownCandles(prev => [...prev, index]);
                    }
                }} 
            />
        </Canvas>

        {showText && (
            <div className="cake-message-overlay">
                <button className="next-btn" onClick={onNext}>
                    Continue
                </button>
            </div>
        )}
    </div>
  );
}

function CameraRig({ isTopView }) {
    const { pos } = useSpring({
        pos: isTopView ? [0, 9, 0] : [0, 4, 8],
        config: { mass: 2, tension: 50, friction: 25 }
    });

    useFrame(({ camera }) => {
        camera.position.set(pos.get()[0], pos.get()[1], pos.get()[2]);
        // Slight offset for lookAt so camera rotation isn't perfectly 0, producing a more natural angle
        camera.lookAt(0, 0, isTopView ? -0.1 : 0);
    });

    return null;
}
