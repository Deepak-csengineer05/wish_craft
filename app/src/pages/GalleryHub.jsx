import React from 'react';
import { useGift } from '../context/GiftContext';
import './GalleryHub.css';

const CARDS = [
  { id: 'scene1', typeLabel: 'Scene 01', title: 'The Moon', icon: '🌕', target: 0, type: 'scene', gradient: 'linear-gradient(135deg, rgba(255,154,158,0.5) 0%, rgba(254,207,239,0.5) 100%)', glow: 'rgba(255,154,158,0.6)' },
  { id: 'scene2', typeLabel: 'Scene 02', title: 'The Countdown', icon: '⏳', target: 1, type: 'scene', gradient: 'linear-gradient(135deg, rgba(161,140,209,0.5) 0%, rgba(251,194,235,0.5) 100%)', glow: 'rgba(251,194,235,0.6)' },
  { id: 'scene3', typeLabel: 'Scene 03', title: 'Fireworks', icon: '🎆', target: 2, type: 'scene', gradient: 'linear-gradient(135deg, rgba(255,154,68,0.5) 0%, rgba(252,96,118,0.5) 100%)', glow: 'rgba(255,154,68,0.6)' },
  { id: 'scene4', typeLabel: 'Scene 04', title: 'The Envelope', icon: '💌', target: 4, type: 'scene', gradient: 'linear-gradient(135deg, rgba(253,251,251,0.5) 0%, rgba(235,237,238,0.5) 100%)', glow: 'rgba(255,255,255,0.6)' },
  
  { id: 'sec1', typeLabel: 'Memory 01', title: 'Intro Video', icon: '🎬', target: 1, type: 'section', gradient: 'linear-gradient(135deg, rgba(132,250,176,0.5) 0%, rgba(143,211,244,0.5) 100%)', glow: 'rgba(132,250,176,0.6)' },
  { id: 'sec2', typeLabel: 'Memory 02', title: 'Wall of Memories', icon: '🌿', target: 2, type: 'section', gradient: 'linear-gradient(135deg, rgba(166,192,254,0.5) 0%, rgba(246,128,132,0.5) 100%)', glow: 'rgba(166,192,254,0.6)' },
  { id: 'sec3', typeLabel: 'Memory 03', title: 'WhatsApp Wish', icon: '💬', target: 3, type: 'section', gradient: 'linear-gradient(135deg, rgba(79,172,254,0.5) 0%, rgba(0,242,254,0.5) 100%)', glow: 'rgba(0,242,254,0.6)' },
  { id: 'sec4', typeLabel: 'Memory 04', title: 'The Gifts', icon: '🎁', target: 4, type: 'section', gradient: 'linear-gradient(135deg, rgba(250,112,154,0.5) 0%, rgba(254,225,64,0.5) 100%)', glow: 'rgba(250,112,154,0.6)' },
  { id: 'sec5', typeLabel: 'Memory 05', title: 'The Cake', icon: '🎂', target: 5, type: 'section', gradient: 'linear-gradient(135deg, rgba(252,203,144,0.5) 0%, rgba(213,126,235,0.5) 100%)', glow: 'rgba(213,126,235,0.6)' },
  { id: 'sec6', typeLabel: 'Memory 06', title: 'Star Puzzle', icon: '✨', target: 6, type: 'section', gradient: 'linear-gradient(135deg, rgba(224,195,252,0.5) 0%, rgba(142,197,252,0.5) 100%)', glow: 'rgba(142,197,252,0.6)' },
  { id: 'sec7', typeLabel: 'Memory 07', title: 'Magical Gallery', icon: '🖼️', target: 7, type: 'section', gradient: 'linear-gradient(135deg, rgba(240,147,251,0.5) 0%, rgba(245,87,108,0.5) 100%)', glow: 'rgba(240,147,251,0.6)' },
  { id: 'sec8', typeLabel: 'Memory 08', title: 'Diary for you', icon: '📖', target: 8, type: 'section', gradient: 'linear-gradient(135deg, rgba(94,231,223,0.5) 0%, rgba(180,144,202,0.5) 100%)', glow: 'rgba(180,144,202,0.6)' },
  { id: 'special_mention', type: 'special' },
  { id: 'sec9', typeLabel: 'Memory 09', title: 'Wish Cards ', icon: '💖', target: 9, type: 'section', gradient: 'linear-gradient(135deg, rgba(233,168,166,0.5) 0%, rgba(203,138,155,0.5) 100%)', glow: 'rgba(233,168,166,0.6)' },
  { id: 'sec10', typeLabel: 'Memory 10', title: 'The Questions', icon: '🌙', target: 10, type: 'section', gradient: 'linear-gradient(135deg, rgba(102,126,234,0.5) 0%, rgba(118,75,162,0.5) 100%)', glow: 'rgba(102,126,234,0.6)' },
  { id: 'sec11', typeLabel: 'Memory 11', title: 'Birthday Wish Letter', icon: '📜', target: 11, type: 'section', gradient: 'linear-gradient(135deg, rgba(255,8,68,0.5) 0%, rgba(255,177,153,0.5) 100%)', glow: 'rgba(255,8,68,0.6)' }
];

export default function GalleryHub({ onSelectScene, onSelectSection }) {
  const { isSectionActive, recipientName, configData } = useGift();
  const senderName = configData?.chatSenderName || 'your Best Friend';

  // Filter out disabled sections dynamically
  const activeCards = CARDS.filter(card => {
    if (card.type === 'section') {
      const sectionName = card.id.replace('sec', 'section');
      return isSectionActive(sectionName);
    }
    if (card.type === 'scene') {
      return isSectionActive(card.id);
    }
    return true;
  });

  return (
    <div className="hub-root">
      {/* Immersive ambient star dust */}
      <div className="hub-background-particles" />
      
      <div className="hub-header">
        <h1>{recipientName}'s Memories</h1>
        <p>A collection of moments to revisit anytime</p>
      </div>

      <div className="hub-grid">
        {activeCards.map(card => {
          if (card.type === 'special') {
            return (
              <div key="special" className="hub-card hub-special-mention-card">
                <span className="mention-title">Special Mention</span>
                <span className="mention-quote">"A memorable gift from"</span>
                <span className="mention-names">{senderName}</span>
              </div>
            );
          }

          return (
            <div 
              key={card.id} 
              className="hub-card" 
              style={{ 
                '--bg-gradient': card.gradient,
                '--glow-color': card.glow
              }}
              onClick={() => {
                if (card.type === 'scene') onSelectScene(card.target);
                else onSelectSection(card.target);
              }}
            >
              {/* The giant background watermark emoji */}
              <div className="icon-bg">{card.icon}</div>
              
              <div className="card-content">
                <div className="title">{card.title}</div>
                <button className="enter-btn">Relive</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
