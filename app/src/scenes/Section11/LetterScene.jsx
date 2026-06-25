import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, Environment, ContactShadows, OrbitControls, CubicBezierLine } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import Cake3D from '../Section5/Cake3D';
import { useGift } from '../../context/GiftContext';

/* ── Reused Environment Helpers ── */
function Book({ position, rotation = [0, 0, 0], color, w = 0.22, h = 1.4, d = 1.9 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.0} />
      </mesh>
      <mesh position={[w / 2 + 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h + 0.01, d + 0.01]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[-(w / 2) - 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h - 0.04, d - 0.04]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Candle({ position }) {
  const flameRef = useRef();
  const lightRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameRef.current) flameRef.current.scale.set(1 + Math.sin(t * 9.3) * 0.07, 1 + Math.sin(t * 13.7) * 0.10, 1);
    if (lightRef.current) lightRef.current.intensity = 1.6 + Math.sin(t * 7.1) * 0.3 + Math.sin(t * 11.3) * 0.2;
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.095, 0.85, 20]} />
        <meshStandardMaterial color="#fffde4" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.94, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshBasicMaterial color="#ffcc22" />
      </mesh>
      <mesh position={[0, 1.01, 0]}>
        <coneGeometry args={[0.025, 0.09, 8]} />
        <meshBasicMaterial color="#ff8800" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.1, 0]} color="#ff9900" intensity={1.8} distance={7} decay={2} />
    </group>
  );
}

function StudyWindow() {
  return (
    <group position={[0, 3.5, -5.8]}>
      <mesh>
        <boxGeometry args={[3.8, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshBasicMaterial color="#c8e8ff" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0.5, 0.4, -0.5]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#fffde0" />
      </mesh>
      <pointLight position={[0, 0, 0.5]} color="#c0d8ff" intensity={6} distance={14} />
    </group>
  );
}

/* ── The Beautiful Feather Pen ── */
function FeatherPen({ position, rotation }) {
  const featherShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.1, 0.2, 0.2, 0.5, 0.05, 1.2); 
    s.bezierCurveTo(0.0, 1.3, 0.0, 1.3, 0, 1.35); 
    s.bezierCurveTo(0.0, 1.3, 0.0, 1.3, -0.05, 1.2); 
    s.bezierCurveTo(-0.2, 0.5, -0.1, 0.2, 0, 0); 
    return new THREE.ShapeGeometry(s);
  }, []);

  return (
    <group position={position} rotation={rotation} castShadow>
      {/* Golden Nib */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <coneGeometry args={[0.025, 0.2, 6]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={1.0} />
      </mesh>
      {/* Quill stick */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.008, 1.0, 12]} />
        <meshStandardMaterial color="#3a2518" roughness={0.7} />
      </mesh>
      {/* Voluminous Feather Body */}
      <mesh position={[0, 0.2, 0]} geometry={featherShape} rotation={[0, -0.2, 0]} castShadow>
        <meshStandardMaterial color="#fdfcf0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Atmospheric Objects ── */
function PocketWatch({ position, rotation }) {
  return (
    <group position={position} rotation={rotation} castShadow scale={[1.8, 1.8, 1.8]}>
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
        <meshStandardMaterial color="#ffc800" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.056, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.01, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <mesh position={[0.04, 0.062, 0]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.12, 0.002, 0.01]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.062, 0.07]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.002, 0.15]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.03, -0.24]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16]} />
        <meshStandardMaterial color="#ffc800" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

function CoffeeMug({ position }) {
  const steamRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if(steamRef.current) {
      steamRef.current.position.y = 0.6 + (t % 2) * 0.4;
      steamRef.current.material.opacity = 0.4 - (t % 2) * 0.2;
    }
  });

  return (
    <group position={position} castShadow scale={[1.6, 1.6, 1.6]}>
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.04, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.45, 32]} />
        <meshStandardMaterial color="#fafafa" roughness={0.1} metalness={0.0} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 32]} />
        <meshStandardMaterial color="#301b0a" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.13, 0.03, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#fafafa" roughness={0.1} />
      </mesh>
      <mesh ref={steamRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false}/>
      </mesh>
    </group>
  );
}

function Inkwell({ position, rotation }) {
  return (
    <group position={position} rotation={rotation} castShadow scale={[1.5, 1.5, 1.5]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.2, 8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.05, 12]} />
        <meshStandardMaterial color="#c0a040" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
        <meshStandardMaterial color="#1a0b36" roughness={0.4} />
      </mesh>
    </group>
  );
}

function ScatteredPapers() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[-2.8, 0.005, 1.2]} rotation={[-Math.PI/2, 0, 0.3]} receiveShadow>
        <planeGeometry args={[1.5, 2.2]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.9} />
      </mesh>
      <mesh position={[-2.6, 0.01, 0.9]} rotation={[-Math.PI/2, 0, -0.15]} receiveShadow>
        <planeGeometry args={[1.5, 2.2]} />
        <meshStandardMaterial color="#f4ebd8" roughness={0.9} />
      </mesh>
      <mesh position={[0.8, 0.005, 0.1]} rotation={[-Math.PI/2, 0, 0.45]} receiveShadow>
        <planeGeometry args={[2.5, 1.5]} />
        <meshStandardMaterial color="#dcd0b8" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Realistic Hanging Polaroids ── */
function HangingPolaroid({ position, rotation, url, caption, stringCurve, themeHue = 198, onClick }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <group 
      position={position} 
      onClick={onClick} 
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} 
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* S-Curved Hanging String dropping from the dark ceiling out of view */}
      <CubicBezierLine
        start={[0, 12.0, 0.02]} 
        end={[0, 1.15, 0.02]} 
        midA={[stringCurve, 8.0, 0.02]} 
        midB={[-stringCurve, 3.5, 0.02]} 
        color={`hsl(${themeHue}, 50%, 75%)`}
        lineWidth={1.5}
        transparent
        opacity={0.5}
      />

      <group rotation={rotation}>
        {/* Thick Photograph Paper */}
        <mesh castShadow receiveShadow position={[0, 0, 0.01]}>
          <boxGeometry args={[1.7, 2.5, 0.05]} />
          <meshStandardMaterial color="#fcf8f0" roughness={0.9} />
        </mesh>
        
        {/* Photo Image (BasicMaterial ignores lighting so it's beautifully bright!) */}
        <mesh position={[0, 0.2, 0.04]}>
          <planeGeometry args={[1.5, 1.9]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        
        {/* Caption Text */}
        <Text
          font="/GreatVibes-Regular.ttf"
          position={[0, -0.9, 0.04]}
          fontSize={0.24}
          color={`hsl(${themeHue}, 60%, 25%)`}
          anchorX="center"
          anchorY="middle"
        >
          {caption}
        </Text>

        {/* Shiny Pearl Pushpin */}
        <mesh position={[0, 1.0, 0.05]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={`hsl(${themeHue}, 100%, 90%)`} roughness={0.2} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ── The Static Elegant Envelope ── */
function Envelope({ onOpen, themeHue = 198 }) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = Math.max(0.2, 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.3);
    }
  });

  const handleClick = () => {
    document.body.style.cursor = 'auto';
    onOpen(); // Trigger instantly, no clunky animations
  };

  return (
    <group
      position={[0.3, 0.03, 0.3]} // Perfectly flat on table
      rotation={[-Math.PI / 2, 0, -0.05]} // Laid naturally
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Thick Envelope Base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 1.5, 0.06]} />
        <meshStandardMaterial color="#fcf6ec" roughness={0.9} />
      </mesh>

      {/* Flap Outline Details (Drawn immaculately) */}
      <group position={[0, 0, 0.031]}>
        <mesh position={[-0.7, 0, 0]} rotation={[0, 0, -0.48]}>
          <planeGeometry args={[1.65, 0.015]} />
          <meshBasicMaterial color="#e0d4be" />
        </mesh>
        <mesh position={[0.7, 0, 0]} rotation={[0, 0, 0.48]}>
          <planeGeometry args={[1.65, 0.015]} />
          <meshBasicMaterial color="#e0d4be" />
        </mesh>
        <mesh position={[0, -0.72, 0]}>
          <planeGeometry args={[2.75, 0.02]} />
          <meshBasicMaterial color="#e0d4be" />
        </mesh>
      </group>

      {/* Text Stamp using locally hosted beautifully cursive GreatVibes font */}
      <Text
        font="/GreatVibes-Regular.ttf"
        position={[0, -0.25, 0.05]}
        fontSize={0.34}
        color={`hsl(${themeHue}, 70%, 40%)`}
        anchorX="center"
        anchorY="middle"
      >
        Birthday Wish Letter
      </Text>

      {/* Interactive Glow */}
      <pointLight ref={glowRef} color={`hsl(${themeHue}, 70%, 75%)`} intensity={hovered ? 0.9 : 0.5} distance={3} position={[0, 0, 0.4]} />
    </group>
  );
}

/* ── Camera Controller for Focusing ── */
function CameraController({ focusData }) {
  const controls = useRef();
  const isAnimating = useRef(false);
  const currentFocusId = useRef(null);
  
  useFrame((state, delta) => {
    if (focusData?.id !== currentFocusId.current) {
      currentFocusId.current = focusData?.id;
      isAnimating.current = true;
    }

    if (isAnimating.current && controls.current) {
      const targetPos = focusData?.targetPos || new THREE.Vector3(0, 2, -2);
      const camPos = focusData?.camPos || new THREE.Vector3(0, 5.5, 9.5);
      
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
      target={[0, 2, -2]} 
      enablePan={true}
      minDistance={2}
      maxDistance={30}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 1.8}
    />
  );
}

export default function LetterScene({ onOpen, active, isFoldingBack }) {
  const { configData } = useGift();
  const themeHue = configData?.themeHue ?? 198;
  const [focusData, setFocusData] = useState(null);
  const [cakeClicks, setCakeClicks] = useState(0);

  const handleCakeClick = (e) => {
    e.stopPropagation();
    const newCount = (cakeClicks + 1) % 2;
    setCakeClicks(newCount);
    
    if (newCount === 1) {
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(-5.6, 2.0, 3.5),
        targetPos: new THREE.Vector3(-5.6, 0.38, 0.0)
      });
    } else {
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(-5.6, 4.0, 0.1),
        targetPos: new THREE.Vector3(-5.6, 0.38, 0.0)
      });
    }
  };

  const handlePolaroidClick = (e, pos) => {
    e.stopPropagation();
    setFocusData({
      id: Date.now(),
      camPos: new THREE.Vector3(pos[0], pos[1] + 0.2, pos[2] + 5.0),
      targetPos: new THREE.Vector3(pos[0], pos[1] + 0.2, pos[2])
    });
  };

  const handleMissed = () => {
    setCakeClicks(0);
    setFocusData({ id: Date.now() }); 
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Deep Telephoto Zoom Camera for absolute realism! */}
      <Canvas 
        camera={{ position: [0, 5.5, 9.5], fov: 42 }} 
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        onPointerMissed={handleMissed}
      >
        <color attach="background" args={['#090503']} />
        <fog attach="fog" args={['#0e0704', 12, 35]} />
        <Environment preset="apartment" background={false} />

        <ambientLight intensity={0.35} color="#ffd8a0" />
        <directionalLight position={[0, 8, 4]} intensity={1.4} color="#b8d8ff" castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12} shadow-camera-right={12}
          shadow-camera-top={10} shadow-camera-bottom={-6}
        />
        <pointLight position={[5, 10, 3]} color="#ffcd70" intensity={9} distance={20} decay={2} castShadow />
        <pointLight position={[-6, 7, 1]} color={`hsl(${themeHue}, 60%, 30%)`} intensity={5} distance={16} decay={2} />
        
        {/* Dedicated spotlight for the polaroid wall to ensure the wall is bright */}
        <pointLight position={[0, 4, -2]} color="#ffffff" intensity={7} distance={15} decay={2} />

        {/* ── Room Walls Extended High to Form a Ceiling Bound ── */}
        <mesh position={[0, 6, -6]} receiveShadow>
          <boxGeometry args={[26, 24, 0.18]} />
          <meshStandardMaterial color="#160803" roughness={0.9} />
        </mesh>
        <mesh position={[-12, 6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[16, 24, 0.18]} />
          <meshStandardMaterial color="#120602" roughness={0.9} />
        </mesh>
        <mesh position={[12, 6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[16, 24, 0.18]} />
          <meshStandardMaterial color="#120602" roughness={0.9} />
        </mesh>
        <mesh position={[0, -3.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial color="#0a0502" roughness={0.9} />
        </mesh>

        {/* ── Magnificent Hanging Memory Array ── */}
        <Suspense fallback={null}>
          {configData?.polaroidUrls?.[1] && (
            <HangingPolaroid position={[-6.8, 3.8, -5.8]} rotation={[0, 0, 0.06]} stringCurve={-0.8} themeHue={themeHue} url={configData.polaroidUrls[1]} caption={configData?.polaroidCaptions?.[1] || ""} onClick={(e) => handlePolaroidClick(e, [-6.8, 3.8, -5.8])} />
          )}
          {configData?.polaroidUrls?.[2] && (
            <HangingPolaroid position={[-4.5, 2.6, -5.8]} rotation={[0, 0, -0.05]} stringCurve={1.0} themeHue={themeHue} url={configData.polaroidUrls[2]} caption={configData?.polaroidCaptions?.[2] || ""} onClick={(e) => handlePolaroidClick(e, [-4.5, 2.6, -5.8])} />
          )}
          {configData?.polaroidUrls?.[3] && (
            <HangingPolaroid position={[-2.4, 4.0, -5.8]} rotation={[0, 0, 0.08]} stringCurve={-1.2} themeHue={themeHue} url={configData.polaroidUrls[3]} caption={configData?.polaroidCaptions?.[3] || ""} onClick={(e) => handlePolaroidClick(e, [-2.4, 4.0, -5.8])} />
          )}
          {configData?.polaroidUrls?.[4] && (
            <HangingPolaroid position={[0.0, 2.5, -5.8]} rotation={[0, 0, -0.04]} stringCurve={0.8} themeHue={themeHue} url={configData.polaroidUrls[4]} caption={configData?.polaroidCaptions?.[4] || ""} onClick={(e) => handlePolaroidClick(e, [0.0, 2.5, -5.8])} />
          )}
          {configData?.polaroidUrls?.[5] && (
            <HangingPolaroid position={[2.5, 3.9, -5.8]} rotation={[0, 0, 0.05]} stringCurve={-1.0} themeHue={themeHue} url={configData.polaroidUrls[5]} caption={configData?.polaroidCaptions?.[5] || ""} onClick={(e) => handlePolaroidClick(e, [2.5, 3.9, -5.8])} />
          )}
          {configData?.polaroidUrls?.[6] && (
            <HangingPolaroid position={[4.8, 3.0, -5.8]} rotation={[0, 0, -0.07]} stringCurve={0.9} themeHue={themeHue} url={configData.polaroidUrls[6]} caption={configData?.polaroidCaptions?.[6] || ""} onClick={(e) => handlePolaroidClick(e, [4.8, 3.0, -5.8])} />
          )}
          {configData?.polaroidUrls?.[7] && (
            <HangingPolaroid position={[7.1, 4.3, -5.8]} rotation={[0, 0, 0.09]} stringCurve={-0.6} themeHue={themeHue} url={configData.polaroidUrls[7]} caption={configData?.polaroidCaptions?.[7] || ""} onClick={(e) => handlePolaroidClick(e, [7.1, 4.3, -5.8])} />
          )}
        </Suspense>

        {/* ── Mahogany Desk & Legs ── */}
        <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
          <boxGeometry args={[15, 0.28, 7.5]} />
          <meshStandardMaterial color="#230d02" roughness={0.78} metalness={0.06} />
        </mesh>
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <boxGeometry args={[15, 0.025, 7.5]} />
          <meshStandardMaterial color="#351403" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* 4 Desk Legs */}
        {[[-6.5, -1.8, -3], [6.5, -1.8, -3], [-6.5, -1.8, 3.2], [6.5, -1.8, 3.2]].map(([x,y,z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#1a0902" roughness={0.88} />
          </mesh>
        ))}

        <group position={[-4.5, 0.01, -1.8]}>
          <Book position={[0, 0.72, 0]} color="#1a3a6e" h={1.44} w={0.24} />
          <Book position={[0.28, 0.62, 0]} color="#5c1500" h={1.24} w={0.22} />
          <Book position={[0.54, 0.78, 0]} color="#1b4e25" h={1.56} w={0.26} />
        </group>

        <group position={[3.8, 0.01, -1.8]}>
          <Book position={[0, 0.68, 0]} color="#1a4a4a" h={1.36} w={0.20} />
          <Book position={[0.25, 0.75, 0]} color="#5a0058" h={1.50} w={0.24} />
          <Book position={[0.53, 0.60, 0]} color="#3a3a12" h={1.20} w={0.22} />
        </group>

        {/* Flat book lying on desk (near diary) */}
        <mesh position={[-2.5, 0.05, 0.5]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.6, 0.08, 2.2]} />
          <meshStandardMaterial color="#1a2a4a" roughness={0.75} />
        </mesh>

        {/* Added rich details around the desk */}
        <ScatteredPapers />
        <PocketWatch position={[-3.6, 0.02, 1.8]} rotation={[0, 0.6, 0]} />
        <CoffeeMug position={[5.2, 0, 1.2]} />
        <Inkwell position={[3.5, 0.0, 0.2]} rotation={[0, 0.5, 0]} />

        {/* The beautiful Feather Pen */}
        <FeatherPen position={[2.8, 0.02, 0.6]} rotation={[Math.PI / 2, 0, -1.0]} />

        {/* ── Miniature Birthday Cake (from Section 5) ── */}
        <group 
          position={[-5.6, 0.38, 0.0]} 
          scale={[0.35, 0.35, 0.35]}
          onClick={handleCakeClick}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} 
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <Cake3D blownCandles={[]} onBlowCandle={() => {}} showText={true} />
        </group>

        {/* The Envelope */}
        <Envelope onOpen={onOpen} themeHue={themeHue} />

        {/* Unconstrained Camera Controls */}
        <CameraController focusData={focusData} />
        <ContactShadows frames={1} resolution={512} position={[0, 0.01, 0]} opacity={0.8} blur={2.5} scale={18} />
      </Canvas>

      {!isFoldingBack && active && (
        <div style={{
          position: 'absolute', bottom: '52px',
          width: '100%', textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{
            color: 'rgba(255, 230, 200, 0.9)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            letterSpacing: '2px',
            textShadow: '0 0 16px rgba(255, 180, 100, 0.8)',
            animation: 'pulse 2s ease-in-out infinite alternate',
          }}>
            ✦ Click the envelope to open it ✦
          </p>
        </div>
      )}
    </div>
  );
}
