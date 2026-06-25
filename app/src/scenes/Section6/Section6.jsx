import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGift } from '../../context/GiftContext';
import { trackEvent } from '../../analytics';
import './Section6.css';

const GRID_SIZE = 12;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Section6({ onNext }) {
  const { giftId, configData } = useGift();
  const [boardData, setBoardData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null); // {r, c}
  const [currentSelection, setCurrentSelection] = useState([]); // array of {r, c} strings
  const [completed, setCompleted] = useState(false);
  const [hintedCell, setHintedCell] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileQuestionIndex, setMobileQuestionIndex] = useState(0);

  const boardRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate background balloons
  const balloons = useMemo(() => {
    return Array(30).fill(null).map((_, i) => ({
      id: i,
      left: `${-5 + Math.random() * 110}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 15}s`,
      scale: 0.3 + Math.random() * 0.8,
      rotation: `${-20 + Math.random() * 40}deg`
    }));
  }, []);

  // Compute active words data from configuration (filter out empty items like siblings)
  const activeWordsData = useMemo(() => {
    const raw = [];
    for (let i = 1; i <= 7; i++) {
      const q = configData?.[`puzzleQ${i}`];
      const a = configData?.[`puzzleA${i}`];
      if (q && a && a.trim().length > 0) {
        raw.push({ question: q, answer: a.toUpperCase().trim() });
      }
    }
    // Fallback if they configured absolutely nothing
    if (raw.length === 0) {
      return [
        { question: "A shiny object in the night sky?", answer: "STAR" },
        { question: "This website is a birthday...?", answer: "GIFT" },
        { question: "A synonym for happiness?", answer: "JOY" },
        { question: "A feeling of deep affection?", answer: "LOVE" }
      ];
    }
    return raw;
  }, [configData]);

  useEffect(() => {
    if (activeWordsData.length === 0) return;

    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const wordsPlaced = [];

    const canPlaceWord = (word, row, col, dRow, dCol) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
      }
      return true;
    };

    const placeWord = (word, row, col, dRow, dCol) => {
      const coords = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        grid[r][c] = word[i];
        coords.push(`${r},${c}`);
      }
      return coords;
    };

    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]
    ];

    activeWordsData.forEach(wd => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 500) {
        const d = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (canPlaceWord(wd.answer, row, col, d[0], d[1])) {
          const coords = placeWord(wd.answer, row, col, d[0], d[1]);
          wordsPlaced.push({ word: wd.answer, coords });
          placed = true;
        }
        attempts++;
      }
      if (!placed) {
        console.warn("Failed to place word:", wd.answer);
      }
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
      }
    }

    setBoardData({ grid, wordsPlaced });
  }, [activeWordsData]);

  const handlePointerDown = (r, c) => {
    setIsDragging(true);
    setSelectionStart({ r, c });
    setCurrentSelection([`${r},${c}`]);
  };

  const handlePointerEnter = (r, c) => {
    if (!isDragging || !selectionStart) return;

    const dr = r - selectionStart.r;
    const dc = c - selectionStart.c;
    
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = steps === 0 ? 0 : dr / steps;
      const stepC = steps === 0 ? 0 : dc / steps;
      
      const newSelection = [];
      for (let i = 0; i <= steps; i++) {
        newSelection.push(`${selectionStart.r + i * stepR},${selectionStart.c + i * stepC}`);
      }
      setCurrentSelection(newSelection);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentSelection.length > 0 && boardData) {
      const selectedWordStr = currentSelection.map(coord => {
        const [r, c] = coord.split(',').map(Number);
        return boardData.grid[r][c];
      }).join('');
      
      const reverseSelectedWordStr = selectedWordStr.split('').reverse().join('');

      const matchedWord = boardData.wordsPlaced.find(wp => 
        (wp.word === selectedWordStr || wp.word === reverseSelectedWordStr) && 
        !foundWords.includes(wp.word)
      );

      if (matchedWord) {
        const newFound = [...foundWords, matchedWord.word];
        trackEvent(giftId, 'Section6', 'word_found', {
          word: matchedWord.word,
          foundOrder: newFound.length,
        });
        setFoundWords(newFound);
        setHintedCell(null);
        if (newFound.length === activeWordsData.length) {
          trackEvent(giftId, 'Section6', 'puzzle_complete', { totalWords: activeWordsData.length });
          setTimeout(() => setCompleted(true), 1500);
        }
      }
    }

    setCurrentSelection([]);
  };

  const giveHint = () => {
    if (!boardData) return;
    trackEvent(giftId, 'Section6', 'hint_used', { hintsTotal: 'increment' });
    
    const nextUnfoundWordData = activeWordsData.find(wd => !foundWords.includes(wd.answer));
    
    if (nextUnfoundWordData) {
      const targetWord = boardData.wordsPlaced.find(wp => wp.word === nextUnfoundWordData.answer);
      if (targetWord && targetWord.coords.length > 0) {
        setHintedCell(targetWord.coords[0]);
        const index = activeWordsData.findIndex(wd => wd.answer === nextUnfoundWordData.answer);
        if (index !== -1) setMobileQuestionIndex(index);
      }
    }
  };

  if (!boardData) return null;

  return (
    <div className="section6-container" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <audio autoPlay loop src="/bg-music-3.mp3" style={{ display: 'none' }} />

      <div className="s6-balloons-container">
        {balloons.map(b => (
          <img 
            key={b.id}
            src="/section3-balloon-ref.png" 
            className="s6-floating-balloon"
            alt="floating balloon"
            style={{
              left: b.left,
              animationDelay: b.delay,
              animationDuration: b.duration,
              '--scale': b.scale,
              '--rotation': b.rotation
            }}
          />
        ))}
      </div>

      <div className={`success-overlay ${completed ? 'show' : ''}`}>
        <div className="success-content">
          <h2>You found all the Words!</h2>
          <p>Every piece of your life forms a beautiful Memory.</p>
          <button className="next-section-btn s6-next" onClick={onNext}>
           Next Section
          </button>
        </div>
      </div>

      <div className="s6-header">
        <h1>Memories in the Stars</h1>
        <p>Find the answers hidden in the constellation.</p>
      </div>

      <div className="s6-content">
        <div className="s6-board-container">
          <div 
            className="s6-grid" 
            ref={boardRef}
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
            onTouchMove={(e) => {
              if (!isDragging) return;
              const touch = e.touches[0];
              const el = document.elementFromPoint(touch.clientX, touch.clientY);
              if (el && el.hasAttribute('data-r')) {
                const r = parseInt(el.getAttribute('data-r'), 10);
                const c = parseInt(el.getAttribute('data-c'), 10);
                handlePointerEnter(r, c);
              }
            }}
          >
            {boardData.grid.map((row, r) => (
              row.map((char, c) => {
                const coord = `${r},${c}`;
                const isSelected = currentSelection.includes(coord);
                const isFound = boardData.wordsPlaced.some(wp => foundWords.includes(wp.word) && wp.coords.includes(coord));
                const isHinted = hintedCell === coord;

                return (
                  <div 
                    key={coord} 
                    className={`s6-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''} ${isHinted ? 'hinted' : ''}`}
                    data-r={r}
                    data-c={c}
                    onPointerDown={(e) => { e.preventDefault(); handlePointerDown(r, c); }}
                    onPointerEnter={(e) => { e.preventDefault(); handlePointerEnter(r, c); }}
                  >
                    {char}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        <div className="s6-questions">
          {isMobile ? (
            <div className="mobile-question-carousel">
              <button 
                className="carousel-nav-btn" 
                onClick={() => setMobileQuestionIndex((prev) => (prev - 1 + activeWordsData.length) % activeWordsData.length)}
              >
                &#10094;
              </button>
              <div className="carousel-question-wrapper">
                {(() => {
                  const item = activeWordsData[mobileQuestionIndex];
                  if (!item) return null;
                  const isFound = foundWords.includes(item.answer);
                  return (
                    <div className={`s6-question-item ${isFound ? 'completed' : ''} mobile-card`}>
                      <div className="q-number">{mobileQuestionIndex + 1}</div>
                      <div className="q-text">
                        <div className="q-title">{item.question}</div>
                        <div className="q-answer">{isFound ? item.answer : '_ '.repeat(item.answer.length)}</div>
                      </div>
                      {isFound && <div className="q-check">✔</div>}
                    </div>
                  );
                })()}
              </div>
              <button 
                className="carousel-nav-btn" 
                onClick={() => setMobileQuestionIndex((prev) => (prev + 1) % activeWordsData.length)}
              >
                &#10095;
              </button>
            </div>
          ) : (
            activeWordsData.map((item, idx) => {
              const isFound = foundWords.includes(item.answer);
              return (
                <div key={idx} className={`s6-question-item ${isFound ? 'completed' : ''}`}>
                  <div className="q-number">{idx + 1}</div>
                  <div className="q-text">
                    <div className="q-title">{item.question}</div>
                    <div className="q-answer">{isFound ? item.answer : '_ '.repeat(item.answer.length)}</div>
                  </div>
                  {isFound && <div className="q-check">✔</div>}
                </div>
              );
            })
          )}
          
          {!completed && (
            <button className="s6-hint-btn" onClick={giveHint}>
              💡 Need a Hint?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
