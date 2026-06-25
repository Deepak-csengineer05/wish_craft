import React, { useRef, useEffect, useState } from 'react';
import './Section7.css';
import { useGift } from '../../context/GiftContext';

export default function ScratchCard({ 
  id, 
  isFocused, 
  isInitiallyTransformed,
  onTransformComplete,
  onReturn
}) {
  const { config, configData } = useGift() || {};
  const themeHue = config?.theme_hue ?? 198;
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [isScratched, setIsScratched] = useState(isInitiallyTransformed);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isGhibli, setIsGhibli] = useState(isInitiallyTransformed);

  const customOrigUrl = configData?.scratchUrls?.[id];
  const customGhibliUrl = configData?.scratchGhibliUrls?.[id];
  const normalSrc = customOrigUrl || `/sec7pic${id}.${[4, 5, 7].includes(id) ? 'png' : 'jpeg'}`;
  const ghibliSrc = customGhibliUrl || customOrigUrl || `/sec7pic${id}Ghibli.${id === 6 ? 'png' : 'jpeg'}`;

  // Initialize canvas only if we haven't transformed yet
  useEffect(() => {
    if (isInitiallyTransformed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Fill with pristine stardust texture (matching the dark theme colors)
    ctx.fillStyle = `hsl(${themeHue}, 30%, 15%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add tiny stars to the scratch layer
    for(let i=0; i<120; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? `hsl(${themeHue}, 50%, 75%)` : '#ffffff';
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Text hint baked into canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '22px "Dancing Script", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal memory...', canvas.width / 2, canvas.height / 2);

  }, [isInitiallyTransformed, themeHue]);

  // Particle Emitter Logic
  const emitGlitter = (clientX, clientY) => {
    if (!cardRef.current) return;
    
    const particle = document.createElement('div');
    particle.className = 'glitter-particle';
    
    // Randomize slight offsets
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left + offsetX;
    const y = clientY - rect.top + offsetY;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Randomize colors for magic
    const colors = ['#fff', '#ffb432', `hsl(${themeHue}, 50%, 75%)`];
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Randomize animation variables
    particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
    particle.style.setProperty('--ty', `${Math.random() * 100 + 50}px`);
    particle.style.setProperty('--rot', `${Math.random() * 360}deg`);

    cardRef.current.appendChild(particle);

    // Cleanup after animation (1s)
    setTimeout(() => {
      if (particle && particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  };

  const handlePointerMove = (e) => {
    if (!isFocused || isScratched) return;
    // only scratch if mouse is down or touching
    if (e.buttons !== 1 && e.type !== 'touchmove' && e.type !== 'pointerdown') return;

    if (e.cancelable) {
      e.preventDefault(); // Stop scrolling on phones while scratching
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    // Erase with a slightly thicker brush for the larger card
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 55, 0, Math.PI * 2, false);
    ctx.fill();

    // Spawn 1-2 glitter particles every frame to look dense
    emitGlitter(clientX, clientY);
    if (Math.random() > 0.5) emitGlitter(clientX, clientY);

    checkScratchPercentage();
  };

  // Debounce the percentage check slightly so we don't lag
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentCount = 0;
    
    // Check every 8th pixel to be very fast
    for (let i = 3; i < pixels.length; i += 4 * 8) {
      if (pixels[i] < 50) { // More forgiving alpha threshold
        transparentCount++;
      }
    }

    const totalPixels = pixels.length / (4 * 8);
    // Requires 85% to be cleared to trigger
    if (transparentCount / totalPixels > 0.85) {
      setIsScratched(true);
    }
  };

  const triggerMagicReveal = () => {
    if (isGhibli || isSweeping || !isScratched) return;

    setIsSweeping(true);
    
    setTimeout(() => {
      setIsGhibli(true);
      setTimeout(() => {
        setIsSweeping(false);
        onTransformComplete();
      }, 1500); // Wait for remaining sweep visually
    }, 1500); // 1.5s is exactly halfway through the 3s sweep
  };

  return (
    <div 
      className={`scratch-card-wrapper ${isScratched ? 'is-scratched' : ''} ${isGhibli ? 'is-ghibli' : ''} ${isSweeping ? 'is-sweeping' : ''}`} 
      ref={cardRef}
      onClick={triggerMagicReveal}
    >
      
      {/* 
        USER INSTRUCTION:
        Replace these outer div styles with your actual image sources later.
        Example: <img src="/pic1-normal.jpg" className="photo-layer normal" />
      */}
      <div className="card-images">
        <img 
          src={normalSrc} 
          alt={`Memory ${id}`} 
          className="photo-layer normal-photo" 
        />
        <img 
          src={ghibliSrc} 
          alt={`Magic ${id}`} 
          className="photo-layer ghibli-photo" 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = normalSrc;
          }}
        />
      </div>

      {!isInitiallyTransformed && (
        <canvas
          ref={canvasRef}
          width={450}
          height={620} /* Increased resolution for fidelity */
          className="scratch-layer"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onTouchMove={handlePointerMove}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {isScratched && !isGhibli && !isSweeping && (
        <div className="tap-hint">
          Tap the photo to cast magic ✨
        </div>
      )}

      {isGhibli && !isSweeping && (
         <div className="return-ui">
           <button className="return-orbit-btn" onClick={onReturn}>
             Return to Orbit
           </button>
         </div>
      )}
      
    </div>
  );
}
