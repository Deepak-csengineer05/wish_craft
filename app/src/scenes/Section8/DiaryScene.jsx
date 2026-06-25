import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useGift } from '../../context/GiftContext';

/* ── Upright book on shelf ── */
function Book({ position, rotation = [0, 0, 0], color, w = 0.22, h = 1.4, d = 1.9 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Pages block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.0} />
      </mesh>
      {/* Spine */}
      <mesh position={[w / 2 + 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h + 0.01, d + 0.01]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* Page edge (slightly lighter) */}
      <mesh position={[-(w / 2) - 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h - 0.04, d - 0.04]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ── Flickering candle ── */
function Candle({ position }) {
  const flameRef  = useRef();
  const lightRef  = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameRef.current) {
      flameRef.current.scale.set(
        1 + Math.sin(t * 9.3)  * 0.07,
        1 + Math.sin(t * 13.7) * 0.10,
        1
      );
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + Math.sin(t * 7.1) * 0.3 + Math.sin(t * 11.3) * 0.2;
    }
  });
  return (
    <group position={position}>
      {/* Wax */}
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.095, 0.85, 20]} />
        <meshStandardMaterial color="#fffde4" roughness={0.95} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.94, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshBasicMaterial color="#ffcc22" />
      </mesh>
      {/* Flame tip */}
      <mesh position={[0, 1.01, 0]}>
        <coneGeometry args={[0.025, 0.09, 8]} />
        <meshBasicMaterial color="#ff8800" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.1, 0]} color="#ff9900" intensity={1.8} distance={7} decay={2} />
    </group>
  );
}

/* ── Moonlit window on back wall ── */
function StudyWindow() {
  return (
    <group position={[0, 3.5, -5.8]}>
      {/* Window frame outer */}
      <mesh>
        <boxGeometry args={[3.8, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.9} />
      </mesh>
      {/* Window glass pane — bright moonlight */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshBasicMaterial color="#c8e8ff" transparent opacity={0.18} />
      </mesh>
      {/* Moon glow behind window */}
      <mesh position={[0.5, 0.4, -0.5]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#fffde0" />
      </mesh>
      <pointLight position={[0, 0, 0.5]} color="#c0d8ff" intensity={6} distance={14} />
    </group>
  );
}

/* ── Camera Controller for Focusing ── */
function CameraController({ focusData, defaultCamPos }) {
  const controls = useRef();
  const isAnimating = useRef(false);
  const currentFocusId = useRef(null);
  
  useFrame((state, delta) => {
    if (focusData?.id !== currentFocusId.current) {
      currentFocusId.current = focusData?.id;
      isAnimating.current = true;
    }

    if (isAnimating.current && controls.current) {
      const targetPos = focusData?.targetPos || new THREE.Vector3(0, 1, 0);
      const camPos = focusData?.camPos || defaultCamPos;
      
      state.camera.position.lerp(camPos, delta * 5);
      controls.current.target.lerp(targetPos, delta * 5);
      
      const distCam = state.camera.position.distanceTo(camPos);
      const distTarget = controls.current.target.distanceTo(targetPos);

      if (distCam < 0.05 && distTarget < 0.05) {
        state.camera.position.copy(camPos);
        controls.current.target.copy(targetPos);
        isAnimating.current = false;
      }
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      target={[0, 1, 0]}
      enablePan={false}
      minDistance={4}
      maxDistance={18}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
}

/* ── Fairytale Vintage Tape Recorder ── */
function TapeButton({ pos, color, onClick, label, isPlayingButton, size = [0.18, 0.06, 0.14] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group 
      position={pos} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh position={[0, hovered ? -0.02 : 0, 0]} castShadow>
        {/* Chunky rectangular retro buttons */}
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : color} 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
      {/* Icon text carved into the button */}
      <Text 
        position={[0, 0.035, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.05} 
        color="#111111" 
        anchorX="center" 
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function VintageTapeRecorder({ position, rotation, controls, onClick, onPointerOver, onPointerOut }) {
  const { isPlaying, onTogglePlay, onNextTrack, onPrevTrack, onVolumeUp, onVolumeDown } = controls;
  const leftReel = useRef();
  const rightReel = useRef();

  useFrame(({ clock }) => {
    if (isPlaying) {
      if (leftReel.current) leftReel.current.rotation.z -= 0.03;
      if (rightReel.current) rightReel.current.rotation.z -= 0.03;
    }
  });

  return (
    <group position={position} rotation={rotation} castShadow onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* ── Main Body: Classic Matte Charcoal Metallic Box ── */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.4]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* ── Front Face Plate: Brushed Silver Aluminum ── */}
      <mesh position={[0, 0.45, 0.205]} receiveShadow>
        <boxGeometry args={[2.1, 0.8, 0.02]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* ── Left Speaker ── */}
      <group position={[-0.65, 0.45, 0.21]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
        </mesh>
        {/* Speaker Grill Dots */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`ls-${i}`} position={[Math.cos(i*Math.PI/4)*0.2, Math.sin(i*Math.PI/4)*0.2, 0.015]}>
            <circleGeometry args={[0.015, 8]} />
            <meshBasicMaterial color="#b8b8b8" />
          </mesh>
        ))}
      </group>

      {/* ── Right Speaker ── */}
      <group position={[0.65, 0.45, 0.21]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
        </mesh>
        {/* Speaker Grill Dots */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`rs-${i}`} position={[Math.cos(i*Math.PI/4)*0.2, Math.sin(i*Math.PI/4)*0.2, 0.015]}>
            <circleGeometry args={[0.015, 8]} />
            <meshBasicMaterial color="#b8b8b8" />
          </mesh>
        ))}
      </group>

      {/* ── Central Cassette Deck Window ── */}
      <group position={[0, 0.45, 0.22]}>
        {/* Inner Dark Area (where the tape sits) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.36, 0.01]} />
          <meshStandardMaterial color="#151515" />
        </mesh>
        
        {/* The Cassette Tape Itself */}
        <mesh position={[0, -0.02, 0.005]}>
          <boxGeometry args={[0.5, 0.3, 0.01]} />
          <meshStandardMaterial color="#333333" roughness={0.6} /> {/* Smoke plastic */}
        </mesh>
        {/* Tape label block */}
        <mesh position={[0, -0.02, 0.01]}>
          <boxGeometry args={[0.38, 0.15, 0.01]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        {/* Reels */}
        <group ref={leftReel} position={[-0.12, -0.02, 0.02]}>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} /> {/* Gold reels */}
          </mesh>
          <mesh position={[0, 0, 0.006]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        </group>

        <group ref={rightReel} position={[0.12, -0.02, 0.02]}>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} /> {/* Gold reels */}
          </mesh>
          <mesh position={[0, 0, 0.006]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        </group>

        {/* Glass Cover */}
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[0.6, 0.36, 0.01]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent opacity={0.4} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Metal Handle ── */}
      <group position={[0, 0.95, 0]}>
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 0.15]} />
          <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 0.15]} />
          <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[1.66, 0.06, 0.15]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.7} /> {/* Black grip */}
        </mesh>
      </group>

      {/* ── Top Chunky Controls ── */}
      <group position={[0, 0.93, 0]}>
        {/* Recessed button tray */}
        <mesh position={[0, -0.02, 0.0]}>
          <boxGeometry args={[1.6, 0.02, 0.25]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.5} />
        </mesh>

        <TapeButton pos={[-0.6, 0.01, 0]} color="#b0b0b0" onClick={onPrevTrack} label="⏮" />
        <TapeButton 
          pos={[-0.3, 0.01, 0]} 
          color={isPlaying ? "#00ff66" : "#b0b0b0"} 
          onClick={onTogglePlay} 
          label={isPlaying ? "⏸" : "▶"} 
        />
        <TapeButton pos={[ 0.0, 0.01, 0]} color="#b0b0b0" onClick={onNextTrack} label="⏭" />
        
        {/* Smaller Volume Buttons */}
        <TapeButton pos={[ 0.4, 0.01, 0]} size={[0.16, 0.05, 0.12]} color="#b8b8b8" onClick={onVolumeUp} label="Vol +" />
        <TapeButton pos={[ 0.65, 0.01, 0]} size={[0.16, 0.05, 0.12]} color="#b8b8b8" onClick={onVolumeDown} label="Vol -" />
      </group>
      
      {/* ── Brand Label ── */}
      <Text 
         font="/GreatVibes-Regular.ttf"
         position={[0, 0.15, 0.22]} 
         fontSize={0.12} 
         color="#444444" 
         anchorX="center" 
         anchorY="middle"
      >
        Melody Mix
      </Text>
    </group>
  );
}

/* ── The Interactive Diary on Desk ── */
function Diary({ onOpen, themeHue }) {
  const [hovered, setHovered] = useState(false);
  const scale = hovered ? 1.05 : 1;

  // We animate the scale & hover effect subtly
  const { s } = useSpring({
    s: scale,
    config: { tension: 350, friction: 20 }
  });

  // Create a canvas-based texture for the true OS-rendered emoji
  const moonEmojiTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = '160px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌙', 128, 140); // slightly vertically adjusted
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <a.group 
      position={[0, 0.05, 0.5]} 
      scale={s.to(v => [v, v, v])}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Diary Cover */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.15, 2.45]} />
        <meshPhysicalMaterial 
          color={`hsl(${themeHue}, 65%, 12%)`}
          roughness={0.6}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Gold Corner Protectors */}
      {[ [0.9, 1.22], [0.9, -1.22], [-0.9, 1.22], [-0.9, -1.22] ].map(([x, z], i) => (
        <mesh key={`corner-${i}`} position={[x > 0 ? x-0.03 : x+0.03, 0, z > 0 ? z-0.03 : z+0.03]} castShadow>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* Ribbon Bookmark draped down on right */}
      <group position={[0.85, -0.06, 0.9]} rotation={[0, -0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.005, 0.06]} />
          <meshStandardMaterial color="#a61c3a" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.02, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
          <boxGeometry args={[0.1, 0.005, 0.06]} />
          <meshStandardMaterial color="#a61c3a" roughness={0.7} />
        </mesh>
      </group>

      {/* Pages Edge (Right side) */}
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[1.78, 0.12, 2.38]} />
        <meshStandardMaterial color="#f8eedc" roughness={1.0} />
      </mesh>

      {/* Diary Spine (Left side) */}
      <mesh position={[-0.91, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 2.45, 32]} />
        <meshPhysicalMaterial color={`hsl(${themeHue}, 73%, 9%)`} roughness={0.5} metalness={0.2} clearcoat={0.2} />
      </mesh>

      {/* Real OS Emoji Moon Symbol on Cover */}
      <mesh position={[0, 0.08, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshBasicMaterial map={moonEmojiTexture} transparent={true} />
      </mesh>

      {/* Text on Cover */}
      <Text 
        position={[0, 0.08, -0.3]} 
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.26}
        color="#efc964"
        font="/GreatVibes-Regular.ttf"
      >
        Quotes for You 💝
      </Text>
    </a.group>
  );
}

/* ════════════════════════
   Main exported Scene
════════════════════════ */
export default function DiaryScene({ onOpen, active, audioControls }) {
  const { config } = useGift() || {};
  const themeHue = config?.theme_hue ?? 198;
  const [focusData, setFocusData] = useState(null);
  const [playerClicks, setPlayerClicks] = useState(0);

  // Dynamic camera calculations for mobile portrait viewports
  const isMobilePortrait = window.innerWidth < window.innerHeight && window.innerWidth <= 768;
  const defaultCamPosArray = isMobilePortrait ? [2.8, 5.0, 13.5] : [2, 3.8, 10.5];
  const defaultCamPos = useMemo(() => new THREE.Vector3(...defaultCamPosArray), [isMobilePortrait]);

  const handlePlayerClick = (e) => {
    e.stopPropagation();
    const newCount = (playerClicks + 1) % 2;
    setPlayerClicks(newCount);
    
    if (newCount === 1) {
      // First tap: Beautiful angled side/front view of the player
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(4.8, 1.8, 3.5),
        targetPos: new THREE.Vector3(4.6, 0.4, 1.2)
      });
    } else {
      // Second tap: Looking down at the golden reels spinning
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(4.6, 3.2, 1.3),
        targetPos: new THREE.Vector3(4.6, 0.4, 1.2)
      });
    }
  };

  const handleMissed = () => {
    setPlayerClicks(0);
    setFocusData({ id: Date.now() }); // Resets to default cam
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Unconstrained interactive canvas */}
      <Canvas 
        camera={{ position: defaultCamPosArray, fov: 46 }} 
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={handleMissed}
      >
        <color attach="background" args={['#0d0704']} />
        <fog attach="fog" args={['#120906', 18, 35]} />
        <Environment preset="apartment" background={false} />

        {/* ── Lighting ── */}
        <ambientLight intensity={0.22} color="#ffd8a0" />

        {/* Moonlight from window — cool blue */}
        <directionalLight position={[0, 6, -6]} intensity={1.4} color="#b8d8ff" castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-10} shadow-camera-right={10}
          shadow-camera-top={8}   shadow-camera-bottom={-4}
        />

        {/* Warm desk-lamp glow from upper right */}
        <pointLight position={[5, 7, 3]} color="#ffbb44" intensity={8} distance={16} decay={2} />
        {/* Left side fill */}
        <pointLight position={[-6, 5, 1]} color={`hsl(${themeHue}, 60%, 33%)`} intensity={4} distance={14} decay={2} />

        {/* ── Back wall (wood panel) ── */}
        <mesh position={[0, 2, -6]} receiveShadow>
          <boxGeometry args={[22, 8, 0.18]} />
          <meshStandardMaterial color="#1c0c04" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Wall baseboards */}
        <mesh position={[0, -0.8, -5.9]}>
          <boxGeometry args={[22, 0.4, 0.06]} />
          <meshStandardMaterial color="#2a1208" roughness={0.8} />
        </mesh>

        {/* ── Moonlit window ── */}
        <StudyWindow />

        {/* ── Mahogany Desk ── */}
        <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
          <boxGeometry args={[14, 0.28, 7]} />
        <meshStandardMaterial color="#2c1304" roughness={0.78} metalness={0.06} />
        </mesh>
        {/* Polished top surface */}
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <boxGeometry args={[14, 0.025, 7]} />
          <meshStandardMaterial color="#3e1905" roughness={0.22} metalness={0.28} />
        </mesh>
        {/* Desk legs */}
        {[[-6, -1.8, -3], [6, -1.8, -3], [-6, -1.8, 3], [6, -1.8, 3]].map(([x,y,z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.25, 3.2, 0.25]} />
            <meshStandardMaterial color="#251003" roughness={0.85} />
          </mesh>
        ))}

        {/* ── Books standing upright on LEFT ── */}
        <group position={[-4.5, 0.01, -1.8]}>
          <Book position={[0,    0.72, 0]} color="#1a3a6e" h={1.44} w={0.24} d={1.9} />
          <Book position={[0.28, 0.62, 0]} color="#5c1500" h={1.24} w={0.22} d={1.85} />
          <Book position={[0.54, 0.78, 0]} color="#1b4e25" h={1.56} w={0.26} d={1.9}  />
          <Book position={[0.84, 0.58, 0]} color="#4e3a00" h={1.16} w={0.20} d={1.8}  />
          <Book position={[1.08, 0.70, 0]} color="#3a005a" h={1.40} w={0.22} d={1.88} />
        </group>

        {/* Books on RIGHT */}
        <group position={[3.8, 0.01, -1.8]}>
          <Book position={[0,    0.68, 0]} color="#1a4a4a" h={1.36} w={0.20} d={1.85} />
          <Book position={[0.25, 0.75, 0]} color="#5a0058" h={1.50} w={0.24} d={1.9}  />
          <Book position={[0.53, 0.60, 0]} color="#3a3a12" h={1.20} w={0.22} d={1.88} />
        </group>

        {/* Flat book lying on desk (near diary) */}
        <mesh position={[-2.5, 0.05, 0.5]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.6, 0.08, 2.2]} />
          <meshStandardMaterial color="#1a2a4a" roughness={0.75} />
        </mesh>

        {/* ── Candles ── */}
        <Candle position={[ 3.8, 0.01, -0.5]} />
        <Candle position={[-3.2, 0.01, -1.0]} />

        {/* ── Realistic Fountain Pen ── */}
        <group position={[1.8, 0.02, 1.0]} rotation={[0, -0.6, 0]}>
          {/* Main Body (Barrel) - tapers elegantly towards the back */}
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.035, 0.5, 32]} />
            <meshStandardMaterial color={`hsl(${themeHue}, 76%, 8%)`} roughness={0.15} metalness={0.6} />
          </mesh>
          {/* Back Gold Tip */}
          <mesh position={[0.41, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.03, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Gold Center Band */}
          <mesh position={[-0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.036, 0.036, 0.04, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Grip Section - tapers towards the nib */}
          <mesh position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.035, 0.22, 32]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Gold Nib Base */}
          <mesh position={[-0.37, -0.002, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.02, 0.04, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Gold Nib Tip (Flattened to look like real metal nib) */}
          <mesh position={[-0.44, -0.005, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.3]} castShadow>
            <coneGeometry args={[0.018, 0.12, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={1.0} />
          </mesh>
        </group>

        {/* ── The Realistic Vintage Tape Recorder ── */}
        <VintageTapeRecorder 
          position={[4.6, 0.01, 1.2]} 
          rotation={[0, -0.6, 0]} 
          controls={audioControls}
          onClick={handlePlayerClick}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        />

        <CameraController focusData={focusData} defaultCamPos={defaultCamPos} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.8} blur={2.5} scale={18} />

        {/* ── The Diary ── */}
        <Diary onOpen={onOpen} themeHue={themeHue} />
      </Canvas>

      {/* Hint text */}
      {active && (
        <div style={{
          position: 'absolute', bottom: '52px',
          width: '100%', textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{
            color: `hsla(${themeHue}, 100%, 85%, 0.9)`,
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            letterSpacing: '2px',
            textShadow: `0 0 16px hsla(${themeHue}, 100%, 60%, 0.7)`,
            animation: 'pulse 2s ease-in-out infinite alternate',
          }}>
            ✦ Click the diary to open it ✦
          </p>
        </div>
      )}
    </div>
  );
}
