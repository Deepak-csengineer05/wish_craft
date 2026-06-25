import React, { useState, useEffect, useMemo } from 'react';
import { useGift } from '../../context/GiftContext';
import { trackEvent, trackSection10Answer } from '../../analytics';
import './Section10.css';

/* ─── Base Dialogue Data ─────────────────────────── */
const BASE_DIALOGUE = [
  {
    id: 0,
    type: 'options',
    text: "Are you surprised by the gift?",
    options: ["Yes", "No"],
    moonMood: "curious"
  },
  {
    id: 1, 
    type: 'info',
    text: "Sorry for this, next time I assure the gift will be the best to make you smile.",
    btnText: "Next",
    moonMood: "pleading"
  },
  {
    id: 2,
    type: 'options',
    text: "Do you know who done this for you?",
    options: ["someone from your friend list", "A person who cares about you", "A well wisher"],
    moonMood: "teasing"
  },
  {
    id: 3,
    type: 'info',
    text: "Hey pooji, for all the options, I would say only one name that is Deepak...",
    btnText: "Continue",
    moonMood: "happy"
  },
  {
    id: 4,
    type: 'input',
    text: "Who is Deepak to you?",
    moonMood: "curious"
  },
  {
    id: 5,
    type: 'input',
    text: "Are you really happy on this gift, are you expected this from him?",
    moonMood: "happy"
  },
  {
    id: 6,
    type: 'input',
    text: "If you wish to say one thing to Deepak what it would be?",
    moonMood: "happy"
  },
  {
    id: 7,
    type: 'input',
    text: "Are you thinking like why this boy Deepak doing like this to you, what you had done for him?",
    moonMood: "curious"
  },
  {
    id: 8,
    type: 'info',
    text: "I can simply say why he is doing this to you but he gave me the answer before you thought about it and that will be in next section for you.",
    btnText: "Next",
    moonMood: "teasing"
  },
  {
    id: 9,
    type: 'input',
    text: "Will you be his best friend in any situation, and not left him for anyone at any situation? Tell the truth.",
    moonMood: "pleading"
  }
];

/* ─── Moon SVG ───────────────────────────────────── */
function MoonFace({ mood }) {
  const isCurious  = mood === 'curious';
  const isTeasing  = mood === 'teasing';
  const isExcited  = mood === 'excited';
  const isPleading = mood === 'pleading';

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="s10-moon-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="hsla(var(--theme-hue, 198), 40%, 75%, 0.08)" />
      <circle cx="100" cy="100" r="80" fill="hsl(var(--theme-hue, 198), 25%, 93%)" />
      <circle cx="70"  cy="75"  r="13" fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.7"/>
      <circle cx="130" cy="68"  r="9"  fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.6"/>
      <circle cx="55"  cy="120" r="8"  fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.5"/>
      <circle cx="140" cy="115" r="11" fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.55"/>
      <circle cx="105" cy="145" r="7"  fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.5"/>
      <circle cx="85"  cy="55"  r="5"  fill="hsl(var(--theme-hue, 198), 30%, 83%)" opacity="0.4"/>

      <ellipse cx="80" cy="97"
        rx={isPleading ? 10 : isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 11 : 10}
        fill="#1a1a2e"/>
      <ellipse cx="120" cy={isCurious ? 94 : 97}
        rx={isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 8 : 10}
        fill="#1a1a2e"/>
      <circle cx="83" cy="94" r="3" fill="white"/>
      <circle cx="123" cy={isCurious ? 91 : 94} r="3" fill="white"/>

      <ellipse cx="65"  cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>
      <ellipse cx="135" cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>

      {isPleading ? (
        <path d="M 88 122 Q 100 118 112 122" stroke="var(--violet-mid, #7b52c8)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : isTeasing ? (
        <path d="M 88 120 Q 100 132 112 120" stroke="var(--violet-mid, #7b52c8)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M 86 120 Q 100 133 114 120" stroke="var(--violet-mid, #7b52c8)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      )}
    </svg>
  );
}

export default function Section10({ onNext }) {
  const { giftId, configData, recipientName } = useGift();
  const [stepIdx, setStepIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [fadeState, setFadeState] = useState("in");

  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3}px`,
      height: `${Math.random() * 3}px`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  // Format conversational dialogue steps dynamically using customization
  const dialogueList = useMemo(() => {
    const creator = configData?.creatorName || configData?.chatSenderName || 'your friend';
    const recipient = recipientName || 'Pooji';
    const list = [...BASE_DIALOGUE];
    
    list[3] = {
      ...list[3],
      text: `Hey ${recipient.toLowerCase()}, for all the options, I would say only one name that is ${creator}. See how lucky you are to have such a thoughtful friend! Before moving on to the final section, I have some queries to ask you about ${creator}...`
    };
    list[4] = {
      ...list[4],
      text: configData?.qaQ4 || `Who is ${creator} to you?`
    };
    list[5] = {
      ...list[5],
      text: configData?.qaQ5 || `Are you really happy with this gift? Did you expect this from ${creator}?`
    };
    list[6] = {
      ...list[6],
      text: configData?.qaQ6 || `If you could say one thing to ${creator}, what would it be?`
    };
    list[7] = {
      ...list[7],
      text: configData?.qaQ7 || `Are you wondering why ${creator} made this for you, and what you did to inspire it?`
    };
    list[8] = {
      ...list[8],
      text: `I can simply say why ${creator} is doing this for you, but they gave me the answer before you even thought about it, and that will be in the next section for you.`
    };
    list[9] = {
      ...list[9],
      text: configData?.qaQ9 || `Will you be ${creator}'s best friend in any situation, and never leave them? Tell the truth.`
    };
    return list;
  }, [configData, recipientName]);

  const step = dialogueList[stepIdx];

  const goToNextStep = (targetIdx = null) => {
    const isTargetNum = typeof targetIdx === 'number';

    if (stepIdx >= dialogueList.length - 1 && !isTargetNum) {
      setFadeState("out");
      setTimeout(() => {
        onNext();
      }, 1000);
      return;
    }

    setFadeState("out");
    setTimeout(() => {
      setInputValue("");
      setStepIdx(i => isTargetNum ? targetIdx : i + 1);
      setFadeState("in");
    }, 400); 
  };

  const handleOptionClick = (opt) => {
    trackEvent(giftId, 'Section10', 'option_click', {
      questionId: step.id,
      questionText: step.text,
      selectedOption: opt,
    });
    if (stepIdx === 0 && opt === "Yes") {
      goToNextStep(2); 
    } else {
      goToNextStep();
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    trackSection10Answer(giftId, step.id, step.text, inputValue.trim());
    goToNextStep();
  };

  return (
    <div className="s10-root">
      <audio src="/bg-music-3.mp3" autoPlay loop style={{ display: 'none' }} />

      <div className="s7-nebula s7-nebula-1" />
      <div className="s7-nebula s7-nebula-2" />
      <div className="s7-nebula s7-nebula-3" />
      <div className="s7-nebula s7-nebula-4" />

      <div className="s7-starfield-container">
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="s7-star"
            style={{
              top: star.top,
              left: star.left,
              width: star.width,
              height: star.height,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration
            }}
          />
        ))}
      </div>

      <div className={`s10-container ${fadeState === 'out' ? 's10-faded' : ''}`}>
        
        <div className="s10-moon-wrapper">
          <MoonFace mood={step?.moonMood || 'happy'} />
          <div className="s10-moon-glow" />
        </div>

        <div className="s10-dialogue-box">
          <p className="s10-text">{step?.text}</p>
        </div>

        <div className="s10-interaction-area">
          {step?.type === 'options' && (
            <div className="s10-options-grid">
              {step.options.map((opt, i) => {
                let btnClass = "s10-btn-option";
                if (opt === "Yes") btnClass += " s10-btn-yes";
                if (opt === "No") btnClass += " s10-btn-no";

                return (
                  <button key={i} className={`s10-btn ${btnClass}`} onClick={() => handleOptionClick(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {step?.type === 'info' && (
            <button className="s10-btn s10-btn-primary" onClick={goToNextStep}>
              {step.btnText}
            </button>
          )}

          {step?.type === 'input' && (
            <form className="s10-input-form" onSubmit={handleInputSubmit}>
              <textarea 
                className="s10-textarea"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                autoFocus
              />
              <button 
                type="submit" 
                className="s10-btn s10-btn-primary" 
                disabled={!inputValue.trim()}
              >
                Send
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
