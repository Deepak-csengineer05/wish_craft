import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGift } from '../../context/GiftContext';
import './Section3.css';

const INITIAL_MESSAGES = [
  { id: 1, type: 'his', text: 'Are you still awake?', time: '11:58 PM', date: 'Today' },
  { id: 2, type: 'her', text: 'Yeah, just reading.', time: '11:58 PM', date: 'Today' },
  { id: 3, type: 'his', text: 'Okay, cool.', time: '11:59 PM', date: 'Today' },
  { id: 4, type: 'her', text: 'Are you going to sleep?', time: '11:59 PM', date: 'Today' },
  { id: 5, type: 'his', text: 'Yeah, going to bed soon, goodnight!', time: '11:59 PM', date: 'Today' },
  { id: 6, type: 'her', text: 'Goodnight!', time: '11:59 PM', date: 'Today' },
];

const BALLOON_CONFIGS = [
  { id: 1, x: 20, size: 1.18, delay: 0.0, duration: 24.8, drift: 12, sway: 6.1, string: 0.94 },
  { id: 2, x: 75, size: 1.3, delay: 0.7, duration: 25.4, drift: 16, sway: 6.4, string: 0.99 },
  { id: 3, x: 35, size: 1.24, delay: 1.4, duration: 24.2, drift: 14, sway: 6.2, string: 0.96 },
  { id: 4, x: 70, size: 1.14, delay: 2.1, duration: 23.8, drift: 12, sway: 6.6, string: 0.92 },
  { id: 5, x: 32, size: 1.36, delay: 2.8, duration: 26.0, drift: 18, sway: 5.9, string: 1.02 },
  { id: 6, x: 46, size: 1.16, delay: 3.5, duration: 24.5, drift: 12, sway: 8.3, string: 0.95 },
  { id: 7, x: 70, size: 1.08, delay: 4.2, duration: 23.5, drift: 11, sway: 6.5, string: 0.9 },
  { id: 8, x: 58, size: 1.28, delay: 4.9, duration: 25.1, drift: 15, sway: 6.0, string: 0.98 },
  { id: 9, x: 68, size: 1.34, delay: 5.6, duration: 25.7, drift: 16, sway: 5.8, string: 1.0 },
  { id: 10, x: 32, size: 1.12, delay: 6.3, duration: 24.0, drift: 11, sway: 6.4, string: 0.93 },
  { id: 11, x: 64, size: 1.04, delay: 7.0, duration: 23.6, drift: 10, sway: 6.7, string: 0.89 },
  { id: 12, x: 76, size: 1.22, delay: 7.7, duration: 24.9, drift: 14, sway: 6.1, string: 0.96 },
  { id: 13, x: 90, size: 1.38, delay: 8.4, duration: 25.8, drift: 17, sway: 5.9, string: 1.02 },
  { id: 14, x: 58, size: 1.14, delay: 9.1, duration: 24.2, drift: 12, sway: 6.3, string: 0.92 },
  { id: 15, x: 20, size: 1.2, delay: 9.8, duration: 24.7, drift: 13, sway: 6.2, string: 0.95 },
  { id: 16, x: 52, size: 1.3, delay: 10.5, duration: 25.3, drift: 15, sway: 6.0, string: 0.99 },
  { id: 17, x: 60, size: 1.16, delay: 11.2, duration: 24.0, drift: 12, sway: 6.5, string: 0.91 },
];

function LavenderFlower() {
  return (
    <div className="s3-flower-art">
      <div className="s3-flower-reveal">
        <img className="s3-flower-image" src="/section3-flower-ref.png" alt="" />
      </div>
    </div>
  );
}

function HeartBalloon({ config }) {
  return (
    <div
      className="heart-balloon-wrapper"
      style={{
        '--balloon-x': `${config.x}%`,
        '--balloon-size': config.size,
        '--float-delay': `${config.delay}s`,
        '--float-duration': `${config.duration}s`,
        '--float-drift': `${config.drift}px`,
        '--float-sway': `${config.sway}s`,
        '--string-scale': config.string,
      }}
    >
      <img className="heart-balloon" src="/section3-balloon-ref.png" alt="" />
    </div>
  );
}

export default function Section3({ onNext }) {
  const { configData, recipientName } = useGift();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [status, setStatus] = useState('last seen today at 11:59 PM');
  const [clock, setClock] = useState('11:59 PM');
  const [inputText, setInputText] = useState('');
  const [sendPulse, setSendPulse] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const balloons = useMemo(() => {
    return Array(20).fill(null).map((_, i) => ({
      id: i,
      left: `${-5 + Math.random() * 110}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${12 + Math.random() * 15}s`,
      scale: 0.3 + Math.random() * 0.7,
      rotation: `${-20 + Math.random() * 40}deg`
    }));
  }, []);

  const scrollRef = useRef(null);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, inputText]);

  useEffect(() => {
    let active = true;

    const runSequence = async () => {
      await sleep(3000);
      if (!active) return;

      setClock('12:00 AM');
      setMessages((prev) => prev.map((message) => ({ ...message, date: 'Yesterday' })));
      await sleep(1500);

      if (!active) return;
      setStatus('online');
      await sleep(2000);

      if (!active) return;
      setStatus('typing...');
      await sleep(3000);

      if (!active) return;
      const defaultWish1 = `Wishing you a Very Happy Birthday ${recipientName}! 🎂💐🎁💜🌕✨`;
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'his', text: configData?.chatMsgHis1 || defaultWish1, time: '12:00 AM', date: 'Today' },
      ]);
      setStatus('online');
      await sleep(2000);

      if (!active) return;
      setStatus('typing...');
      await sleep(2500);

      if (!active) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'his',
          text: configData?.chatMsgHis2 || 'May all your dreams come true, you are the best in all ways, once again... Happy Birthday! 💜☺️💐🌕♾️',
          time: '12:00 AM',
          date: 'Today',
        },
      ]);
      setStatus('online');
      await sleep(2500);

      const typeText = async (text) => {
        for (let index = 0; index <= text.length; index += 1) {
          if (!active) return;
          setInputText(text.slice(0, index));
          await sleep(50 + Math.random() * 80);
        }
      };

      if (!active) return;
      const herReply1 = configData?.chatMsgHer1 || 'Thank you so much 😊';
      await typeText(herReply1);
      await sleep(800);

      if (!active) return;
      setInputText('');
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, type: 'her', text: herReply1, time: '12:01 AM', date: 'Today' },
      ]);
      setClock('12:01 AM');
      await sleep(1500);

      if (!active) return;
      setStatus('typing...');
      await sleep(2000);

      if (!active) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          type: 'his',
          text: configData?.chatMsgHis3 || 'Did you expect a wish at midnight?',
          time: '12:01 AM',
          date: 'Today',
        },
      ]);
      setStatus('online');
      await sleep(2000);

      if (!active) return;
      const herReply2 = configData?.chatMsgHer2 || 'Honestly no, no one has wished me like this before!';
      await typeText(herReply2);
      await sleep(600);

      if (!active) return;
      setInputText('');
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 4, type: 'her', text: herReply2, time: '12:01 AM', date: 'Today' },
      ]);
      await sleep(1500);

      if (!active) return;
      setStatus('typing...');
      await sleep(2500);

      if (!active) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 5,
          type: 'his',
          text: configData?.chatMsgHis4 || 'I have a few surprises waiting for you, ready to explore?',
          time: '12:02 AM',
          date: 'Today',
        },
      ]);
      setClock('12:02 AM');
      setStatus('online');
      await sleep(2500);

      if (!active) return;
      const herReply3 = configData?.chatMsgHer3 || 'What is it?';
      await typeText(herReply3);
      setSendPulse(true);
    };

    runSequence();

    return () => {
      active = false;
    };
  }, [recipientName, configData]);

  const handleFinalSend = () => {
    if (!sendPulse) return;

    setSendPulse(false);
    setMessages((prev) => [...prev, { id: Date.now() + 6, type: 'her', text: inputText, time: clock, date: 'Today' }]);
    setInputText('');

    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onNext();
      }, 1000);
    }, 1500);
  };

  const senderName = configData?.chatSenderName || configData?.creatorName || 'Best Friend';
  const profilePic = configData?.profileUrl || '/profile.jpeg';

  return (
    <div className={`s3-container ${isExiting ? 'fade-out' : 'fade-in'}`}>
      <div className="s3-balloons-container">
        {balloons.map(b => (
          <img 
            key={b.id}
            src="/section3-balloon-ref.png" 
            className="s3-floating-balloon"
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

      <div className="wa-app">
        <div className="wa-status-bar">
          <div className="wa-time">{clock}</div>
          <div className="wa-system-icons">
            <span className="sc-icon">📶</span>
            <span className="sc-icon">LTE</span>
            <span className="sc-icon">🔋</span>
          </div>
        </div>

        <header className="wa-header">
          <div className="wa-header-left">
            <span className="wa-back">←</span>
            <div className="wa-pfp">
              <img src={profilePic} alt="Profile" />
            </div>
            <div className="wa-user-info">
              <div className="wa-name">{senderName}</div>
              <div className="wa-status-text">{status}</div>
            </div>
          </div>
          <div className="wa-header-right">
            <span>🎥</span>
            <span>📞</span>
            <span>⋮</span>
          </div>
        </header>

        <div className="wa-chat-area" ref={scrollRef}>
          {messages.map((message, index) => {
            const showDatePill = index === 0 || messages[index - 1].date !== message.date;

            return (
              <React.Fragment key={message.id}>
                {showDatePill && <div className="wa-date-pill">{message.date}</div>}
                <div className={`wa-bubble-wrapper ${message.type === 'his' ? 'his' : 'her'}`}>
                  <div className="wa-bubble">
                    <span className="wa-msg-text">{message.text}</span>
                    <span className="wa-msg-meta">
                      {message.time} {message.type === 'her' && <span className="wa-read-receipt">✓✓</span>}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <footer className="wa-footer">
          <div className="wa-input-box">
            <span className="wa-icon-smile">😊</span>
            <div className={`wa-input-text ${!inputText ? 'placeholder' : ''}`}>
              {inputText || 'Message'}
            </div>
            <span className="wa-icon-attach">📎</span>
            <span className="wa-icon-camera">📷</span>
          </div>
          <div className={`wa-send-btn ${sendPulse ? 'pulse' : ''} ${inputText ? 'active' : ''}`} onClick={handleFinalSend}>
            {inputText ? '➤' : '🎤'}
          </div>
        </footer>
      </div>
    </div>
  );
}
