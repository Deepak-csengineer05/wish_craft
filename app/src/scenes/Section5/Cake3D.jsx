import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useGift } from '../../context/GiftContext';

export default function Cake3D({ blownCandles, onBlowCandle, showText }) {
  // Cherries around the top edge (doubled to 16)
  const cherryPositions = useMemo(() => {
    const pos = [];
    for(let i=0; i<16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 1.7;
        pos.push([Math.cos(angle)*radius, 1.6, Math.sin(angle)*radius]);
    }
    return pos;
  }, []);

  // Chocolate shavings
  const [shavingPositions] = useState(() => {
    const pos = [];
    for(let i=0; i<100; i++) {
        const radius = Math.random() * 1.35;
        const angle = Math.random() * Math.PI * 2;
        pos.push({
           p: [Math.cos(angle)*radius, 1.49, Math.sin(angle)*radius],
           r: [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI]
        });
    }
    return pos;
  });

  // Candles in a small circle
  const candlePositions = useMemo(() => {
    const pos = [];
    for(let i=0; i<5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.55;
        pos.push([Math.cos(angle)*radius, 1.48, Math.sin(angle)*radius]);
    }
    return pos;
  }, []);

  return (
    <group position={[0, -1.2, 0]}>
        {/* Yellow Base Plate */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2.8, 2.8, 0.1, 64]} />
            <meshStandardMaterial color="#ffd54f" roughness={0.6} />
        </mesh>

        {/* Double Layer Cake */}
        {/* Sponge Layer 1 (Bottom) */}
        <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2, 2, 0.6, 64]} />
            <meshStandardMaterial color="#2b140d" roughness={0.9} />
        </mesh>
        
        {/* Icing Filling Layer */}
        <mesh position={[0, 0.7, 0]} receiveShadow>
            <cylinderGeometry args={[2.02, 2.02, 0.1, 64]} />
            <meshStandardMaterial color="#fcf8f2" roughness={0.5} />
        </mesh>

        {/* Sponge Layer 2 (Top) */}
        <mesh position={[0, 1.05, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2, 2, 0.6, 64]} />
            <meshStandardMaterial color="#2b140d" roughness={0.9} />
        </mesh>

        {/* Top Frosting */}
        <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2.05, 2.05, 0.15, 64]} />
            <meshStandardMaterial color="#fcf8f2" roughness={0.4} />
        </mesh>

        {/* Cherries */}
        {cherryPositions.map((p, i) => (
            <group key={`cherry-${i}`} position={p}>
                {/* cream base */}
                <mesh position={[0, -0.1, 0]} castShadow>
                   <sphereGeometry args={[0.22, 16, 16]} />
                   <meshStandardMaterial color="#fcf8f2" roughness={0.6} />
                </mesh>
                {/* cherry */}
                <mesh position={[0, 0.05, 0]} castShadow>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial color="#7a0115" roughness={0.1} metalness={0.4} />
                </mesh>
            </group>
        ))}

        {/* Shavings */}
        {shavingPositions.map((s, i) => (
            <mesh key={`shave-${i}`} position={s.p} rotation={s.r} castShadow>
                <boxGeometry args={[0.06, 0.015, 0.03]} />
                <meshStandardMaterial color="#2d140e" roughness={0.8} />
            </mesh>
        ))}

        {/* Candles */}
        {candlePositions.map((p, i) => (
            <Candle 
               key={`candle-${i}`} 
               position={p} 
               isBlown={blownCandles.includes(i)} 
               onClick={() => onBlowCandle(i)}
            />
        ))}

        {/* Icing Text written directly on the cake */}
        <IcingText showText={showText} />
    </group>
  );
}

function Candle({ position, isBlown, onClick }) {
    const flameRef = useRef();

    const { flameScale, flameLocalY } = useSpring({
        flameScale: isBlown ? 0 : 1,
        flameLocalY: isBlown ? 0.72 : 0.82,
        config: { tension: 120, friction: 14 }
    });

    useFrame((state) => {
        if (!isBlown && flameRef.current) {
            // Flicker effect
            const t = state.clock.getElapsedTime() * 15 + position[0]*10;
            // Wobbling effect for the whole teardrop shape
            flameRef.current.scale.x = 1.0 + Math.sin(t) * 0.05;
            flameRef.current.scale.z = 1.0 + Math.sin(t+1) * 0.05;
            flameRef.current.scale.y = 1.0 + Math.sin(t*0.5) * 0.1;
            flameRef.current.rotation.z = Math.sin(t*0.5) * 0.05;
            flameRef.current.rotation.x = Math.sin(t*0.7) * 0.05;
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (isBlown) return;
        onClick();
    };

    return (
        <group onClick={handleClick} position={[position[0], position[1], position[2]]}>
           {/* Original Pink Candle Body */}
           <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
               <cylinderGeometry args={[0.04, 0.04, 0.7, 16]} />
               <meshStandardMaterial color="#ffc4d9" roughness={0.2} />
           </mesh>
           
           {/* Wick */}
           <mesh position={[0, 0.72, 0]}>
               <cylinderGeometry args={[0.006, 0.006, 0.08, 8]} />
               <meshStandardMaterial color="#222" />
           </mesh>

           {/* Perfect 2D-style Teardrop Flame! */}
           <a.group position-y={flameLocalY} scale={flameScale} ref={flameRef}>
               {/* Outer Flame (Orange) */}
               <group>
                   <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                       <sphereGeometry args={[0.07, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                       <meshBasicMaterial color="#ff7b00" />
                   </mesh>
                   <mesh position={[0, 0.1, 0]}>
                       <coneGeometry args={[0.07, 0.2, 16]} />
                       <meshBasicMaterial color="#ff7b00" />
                   </mesh>
               </group>

               {/* Inner Flame (Yellow) offset slightly to not z-fight */}
               <group position={[0, 0.02, 0.005]}> 
                   <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                       <sphereGeometry args={[0.04, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                       <meshBasicMaterial color="#ffcc00" />
                   </mesh>
                   <mesh position={[0, 0.06, 0]}>
                       <coneGeometry args={[0.04, 0.12, 16]} />
                       <meshBasicMaterial color="#ffcc00" />
                   </mesh>
               </group>
               
               <pointLight color="#ffae00" intensity={1.5} distance={5} />
           </a.group>
        </group>
    );
}

function IcingText({ showText }) {
    const { recipientName, configData, birthday, config } = useGift();
    const themeHue = config?.theme_hue ?? 198;
    const targetAge = useMemo(() => {
        if (configData?.targetAge) return configData.targetAge;
        if (birthday) {
            const parts = birthday.split('-');
            if (parts.length === 3) {
                const birthYear = parseInt(parts[2], 10);
                if (birthYear) {
                    return String(new Date().getFullYear() - birthYear);
                }
            }
        }
        return '20';
    }, [birthday, configData]);
    const { opacity } = useSpring({
        opacity: showText ? 1 : 0,
        config: { duration: 1500 }
    });

    return (
        <group position={[0, 1.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <Text 
                font="/GreatVibes-Regular.ttf"
                fontSize={0.45}
                anchorX="center"
                anchorY="middle"
                textAlign="center"
                lineHeight={1.3}
                outlineWidth={0.015}
                outlineColor={`hsl(${themeHue}, 80%, 15%)`}
            >
                Happy{'\n'}{targetAge}th Birthday{'\n'}{recipientName}
                <a.meshStandardMaterial transparent opacity={opacity} color={`hsl(${themeHue}, 75%, 32%)`} roughness={0.4} />
            </Text>
        </group>
    );
}
