import React, { useState } from 'react';
import { useGift } from '../../context/GiftContext';
import { trackReply } from '../../analytics';
import './LetterScroll.css';

export default function LetterScroll({ show, onFold }) {
  const { giftId, configData } = useGift();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingState, setSendingState] = useState('idle'); // 'idle', 'folding', 'stamping', 'addressing', 'flying', 'sent'

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingState('folding');
    try {
      // Send reply directly via Supabase helper
      await trackReply(giftId, replyText);
      
      // Step 1: Fold (1.2s)
      setTimeout(() => {
        setSendingState('stamping');
      }, 1200);

      // Step 2: Stamp animation (1.5s)
      setTimeout(() => {
        setSendingState('addressing');
      }, 2700);

      // Step 3: Typewriter addressing (4s)
      setTimeout(() => {
        setSendingState('flying');
      }, 6700);

      // Step 4: Fly away (1.5s)
      setTimeout(() => {
        setSendingState('sent');
      }, 8200);
    } catch (e) {
      console.error("Failed to send reply:", e);
      setSendingState('idle'); 
    }
  };

  if (!show) return null;

  const hasCustomLetter = configData?.letterText && configData.letterText.trim().length > 0;
  const creatorName = configData?.creatorName || configData?.chatSenderName || 'your friend';

  return (
    <div className={`s11-letter-overlay ${show ? 'show' : ''}`}>
      {sendingState === 'sent' ? (
        <div className="s11-sent-message-container" style={{ zIndex: 200 }}>
          <div className="s11-magical-seal" style={{ position: 'relative', width: '100px', height: '100px', fontSize: '3rem', margin: '0 auto 20px auto', boxShadow: 'none', animation: 'none', opacity: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>🌙</div>
          <div className="s11-sent-text">Your message is safely sealed<br/>and flying its way to {creatorName}...</div>
          <button className="s11-fold-btn mt-20" onClick={onFold}>
            Close & Continue
          </button>
        </div>
      ) : (
        <div className={`s11-paper-container ${sendingState !== 'idle' ? 's11-folded-state' : ''} ${sendingState === 'flying' ? 's11-fly-away' : ''}`}>
          {isReplying ? (
            <div className={`s11-letter-content s11-reply-view`}>
              <div className={`s11-reply-inner-content ${sendingState !== 'idle' ? 's11-fade-out-fast' : ''}`}>
                <div className="s11-letter-greeting" style={{ textAlign: 'center', marginBottom: '20px' }}>Your Reply</div>
                <textarea 
                  className="s11-reply-textarea"
                  placeholder="Write your thoughts here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sendingState !== 'idle'}
                />
                <div className="s11-fold-btn-container" style={{ marginTop: 'auto', zIndex: 100 }}>
                  <button className="s11-fold-btn mr-15" style={{ background: 'transparent', color: '#a05030', border: '1px solid #a05030', boxShadow: 'none' }} onClick={() => setIsReplying(false)}>
                    Cancel
                  </button>
                  <button className="s11-fold-btn s11-send-btn" onClick={handleSendReply}>
                    Seal & Send
                  </button>
                </div>
              </div>
              
              {sendingState !== 'idle' && (
                <div className="s11-folded-cover">
                  {(sendingState === 'stamping' || sendingState === 'addressing' || sendingState === 'flying') && (
                    <div className="s11-magical-seal-container">
                      <div className="s11-magical-seal">🌙</div>
                      {sendingState === 'stamping' && <div className="s11-seal-sparks"></div>}
                    </div>
                  )}

                  {(sendingState === 'addressing' || sendingState === 'flying') && (
                    <div className="s11-address-text">
                      <div className="s11-typewriter-line1">To,</div>
                      <div className="s11-typewriter-line2">{creatorName}'s Bestfriend</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
          <div className="s11-letter-content">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {configData?.letterText || 'Happy Birthday! 🎉\n\nWishing you a beautiful day ahead filled with joy and laughter.'}
            </div>

            <div className="s11-fold-btn-container">
              <button className="s11-fold-btn mr-15" onClick={() => setIsReplying(true)}>
                Write a Reply
              </button>
              <button className="s11-fold-btn" style={{ background: 'transparent', color: '#a05030', border: '1px solid #a05030', boxShadow: 'none' }} onClick={onFold}>
                Return Letter
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
