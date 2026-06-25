import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { applyTheme } from '../utils/themeHelper';
import { getDirectDriveUrl } from '../utils/driveHelper';
import { DEFAULT_CONFIG } from '../utils/defaultConfigs';
import './CreatorHub.css';

const DEFAULT_SECTIONS = {
  scene1: true,   // The Moon (Dialogue)
  scene2: true,   // The Countdown
  scene3: true,   // Fireworks
  scene4: true,   // The Envelope
  section1: true, // Intro Video
  section2: true, // Photos Wall
  section3: true, // WhatsApp simulated chat
  section4: true, // 3D Gift boxes
  section5: true, // 3D Cake candle blow
  section6: true, // Star word search
  section7: true, // Scratch Orbit
  section8: true, // Diary + Tape recorder
  section9: true, // Mood card marquee
  section10: true, // Moon Q&A
  section11: true  // Hearts scroll letter
};

const DEFAULT_MOOD_CARDS = [
  { front: "Sad", back: "I will be your shoulder" },
  { front: "Happy", back: "Share with me" },
  { front: "Alone", back: "I am always here with you" },
  { front: "Worrying", back: "We will face it together" },
  { front: "Need to speak", back: "Call me, I'm listening" },
  { front: "Need to cry", back: "Remember me, I will be there to hear" },
  { front: "Need Help", back: "Ask me anything" },
  { front: "Bored", back: "I try to make you feel better!" },
  { front: "Confused", back: "We will figure it out" },
  { front: "Overthinking", back: "Share to me, We both do it together" },
  { front: "Betrayed", back: "I assure you, it won't be me" }
];

export default function CreatorHub() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [creatorId, setCreatorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successGiftId, setSuccessGiftId] = useState(null);

  // Configuration form fields
  const [recipientName, setRecipientName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthday, setBirthday] = useState(''); // YYYY-MM-DD
  const [userPassword, setUserPassword] = useState('');
  const [yourPassword, setyourPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [themeHue, setThemeHue] = useState(198); // 0 - 360
  const [formErrors, setFormErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedLinkType, setCopiedLinkType] = useState(''); // 'gift' | 'your' | ''

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Modular sections
  const [activeSections, setActiveSections] = useState(DEFAULT_SECTIONS);

  // Custom texts
  const [introText1, setIntroText1] = useState('');
  const [introText2, setIntroText2] = useState('');
  const [introOpt1, setIntroOpt1] = useState('');
  const [introOpt2, setIntroOpt2] = useState('');

  const [moonLine2, setMoonLine2] = useState('');
  const [moonOpt2_1, setMoonOpt2_1] = useState('');
  const [moonOpt2_2, setMoonOpt2_2] = useState('');
  const [moonLine3, setMoonLine3] = useState('');

  const [moonLine4, setMoonLine4] = useState('');
  const [moonOpt4_1, setMoonOpt4_1] = useState('');
  const [moonOpt4_2, setMoonOpt4_2] = useState('');
  const [moonLine5, setMoonLine5] = useState('');

  // Section 6 Star Puzzle Custom Questions & Answers
  const [puzzleQ1, setPuzzleQ1] = useState('');
  const [puzzleA1, setPuzzleA1] = useState('');
  const [puzzleQ2, setPuzzleQ2] = useState('');
  const [puzzleA2, setPuzzleA2] = useState('');
  const [puzzleQ3, setPuzzleQ3] = useState('');
  const [puzzleA3, setPuzzleA3] = useState('');
  const [puzzleQ4, setPuzzleQ4] = useState('');
  const [puzzleA4, setPuzzleA4] = useState('');
  const [puzzleQ5, setPuzzleQ5] = useState('');
  const [puzzleA5, setPuzzleA5] = useState('');
  const [puzzleQ6, setPuzzleQ6] = useState('');
  const [puzzleA6, setPuzzleA6] = useState('');
  const [puzzleQ7, setPuzzleQ7] = useState('');
  const [puzzleA7, setPuzzleA7] = useState('');

  // Section 3: WhatsApp Custom Dialogues
  const [chatSenderName, setChatSenderName] = useState('');
  const [chatMsgHis1, setChatMsgHis1] = useState('');
  const [chatMsgHis2, setChatMsgHis2] = useState('');
  const [chatMsgHis3, setChatMsgHis3] = useState('');
  const [chatMsgHis4, setChatMsgHis4] = useState('');
  const [chatMsgHer1, setChatMsgHer1] = useState('');
  const [chatMsgHer2, setChatMsgHer2] = useState('');

  // Section 4: 3D Gift Box text & images
  const [giftBoxText1, setGiftBoxText1] = useState('');
  const [giftBoxText2, setGiftBoxText2] = useState('');
  const [giftBoxText3, setGiftBoxText3] = useState('');
  const [giftBoxText4, setGiftBoxText4] = useState('');
  const [giftBoxText5, setGiftBoxText5] = useState('');

  // Section 11 hearts scroll letter text
  const [letterText, setLetterText] = useState('');

  // Section 10 Q&A Custom Questions
  const [qaQ4, setQaQ4] = useState('');
  const [qaQ5, setQaQ5] = useState('');
  const [qaQ6, setQaQ6] = useState('');
  const [qaQ7, setQaQ7] = useState('');
  const [qaQ9, setQaQ9] = useState('');

  // Media Asset URL links
  const [video1Url, setVideo1Url] = useState(''); // Desktop intro video.mp4
  const [video2Url, setVideo2Url] = useState(''); // Section 1 video.mp4

  // Storage files
  const [profileFile, setProfileFile] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');

  const [polaroidFiles, setPolaroidFiles] = useState({}); // { 1: File, 2: File, ... }
  const [polaroidUrls, setPolaroidUrls] = useState({});   // { 1: URL, 2: URL, ... }
  const [polaroidCount, setPolaroidCount] = useState(0);  // 0 = not chosen yet

  const [giftBoxFiles, setGiftBoxFiles] = useState({});   // { 1: File, 2: File, ... }
  const [giftBoxUrls, setGiftBoxUrls] = useState({});     // { 1: URL, 2: URL, ... }
  const [giftBoxCount, setGiftBoxCount] = useState(0);    // 0 = not chosen yet

  const [scratchFiles, setScratchFiles] = useState({});       // { 1: File, 2: File, ... } - original photo
  const [scratchUrls, setScratchUrls] = useState({});         // { 1: URL, 2: URL, ... }  - original photo
  const [scratchGhibliFiles, setScratchGhibliFiles] = useState({});  // { 1: File, ... } - ghibli art
  const [scratchGhibliUrls, setScratchGhibliUrls] = useState({});    // { 1: URL, ... }  - ghibli art
  const [scratchCount, setScratchCount] = useState(0);         // 0 = not chosen yet

  const [bgMusicFile, setBgMusicFile] = useState(null);
  const [bgMusicUrl, setBgMusicUrl] = useState('');

  const [moodCards, setMoodCards] = useState({});
  const [moodCardsCount, setMoodCardsCount] = useState(0); // 0 = not chosen yet

  const hasMediaSections = !!(activeSections.section1 || activeSections.section2 || activeSections.section3 || activeSections.section4 || activeSections.section7 || activeSections.section8);
  const maxStep = hasMediaSections ? 5 : 4;

  useEffect(() => {
    if (step > 5) return;
    if (step > maxStep) {
      setStep(maxStep);
    }
  }, [activeSections, step, maxStep]);

  // Initial Authentication check & Load for edit
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
      } else {
        setCreatorId(user.id);
        const loggedInName = user.user_metadata?.name || (user.email && user.email.endsWith('@wish-craft.local') ? user.email.split('@')[0] : user.email) || '';
        if (editId) {
          setLoading(true);
          await loadGiftData(editId, user.id, loggedInName);
        } else {
          setCreatorName(loggedInName);
        }
      }
    });
  }, [editId, navigate]);

  // Load configuration to edit
  const loadGiftData = async (giftId, userId, loggedInName = '') => {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', giftId)
        .eq('creator_id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setRecipientName(data.recipient_name || '');
        setBirthday(data.birthday || '');
        setUserPassword(data.user_password || '');
        setyourPassword(data.your_password || '');
        setPasscode(data.passcode || '');
        setThemeHue(data.theme_hue ?? 198);
        setActiveSections({
          ...DEFAULT_SECTIONS,
          ...(data.active_sections || {})
        });
        applyTheme(data.theme_hue ?? 198); // set preview theme

        const cfg = data.config_data || {};
        setNickname(cfg.nickname || '');
        setIntroText1(cfg.introText1 || '');
        setIntroText2(cfg.introText2 || '');
        setIntroOpt1(cfg.introOpt1 || '');
        setIntroOpt2(cfg.introOpt2 || '');
        setMoonLine2(cfg.moonLine2 || '');
        setMoonOpt2_1(cfg.moonOpt2_1 || '');
        setMoonOpt2_2(cfg.moonOpt2_2 || '');
        setMoonLine3(cfg.moonLine3 || '');
        setMoonLine4(cfg.moonLine4 || '');
        setMoonOpt4_1(cfg.moonOpt4_1 || '');
        setMoonOpt4_2(cfg.moonOpt4_2 || '');
        setMoonLine5(cfg.moonLine5 || '');
        setPuzzleQ1(cfg.puzzleQ1 || '');
        setPuzzleA1(cfg.puzzleA1 || '');
        setPuzzleQ2(cfg.puzzleQ2 || '');
        setPuzzleA2(cfg.puzzleA2 || '');
        setPuzzleQ3(cfg.puzzleQ3 || '');
        setPuzzleA3(cfg.puzzleA3 || '');
        setPuzzleQ4(cfg.puzzleQ4 || '');
        setPuzzleA4(cfg.puzzleA4 || '');
        setPuzzleQ5(cfg.puzzleQ5 || '');
        setPuzzleA5(cfg.puzzleA5 || '');
        setPuzzleQ6(cfg.puzzleQ6 || '');
        setPuzzleA6(cfg.puzzleA6 || '');
        setPuzzleQ7(cfg.puzzleQ7 || '');
        setPuzzleA7(cfg.puzzleA7 || '');

        setChatSenderName(cfg.chatSenderName || '');
        setChatMsgHis1(cfg.chatMsgHis1 || '');
        setChatMsgHis2(cfg.chatMsgHis2 || '');
        setChatMsgHis3(cfg.chatMsgHis3 || '');
        setChatMsgHis4(cfg.chatMsgHis4 || '');
        setChatMsgHer1(cfg.chatMsgHer1 || '');
        setChatMsgHer2(cfg.chatMsgHer2 || '');

        setGiftBoxText1(cfg.giftBoxText1 || '');
        setGiftBoxText2(cfg.giftBoxText2 || '');
        setGiftBoxText3(cfg.giftBoxText3 || '');
        setGiftBoxText4(cfg.giftBoxText4 || '');
        setGiftBoxText5(cfg.giftBoxText5 || '');
        setGiftBoxUrls(cfg.giftBoxUrls || {});

        setCreatorName(cfg.creatorName || loggedInName || '');
        setQaQ4(cfg.qaQ4 || '');
        setQaQ5(cfg.qaQ5 || '');
        setQaQ6(cfg.qaQ6 || '');
        setQaQ7(cfg.qaQ7 || '');
        setQaQ9(cfg.qaQ9 || '');

        setLetterText(cfg.letterText || '');
        setVideo1Url(cfg.video1Url || '');
        setVideo2Url(cfg.video2Url || '');
        setProfileUrl(cfg.profileUrl || '');
        setPolaroidUrls(cfg.polaroidUrls || {});
        setPolaroidCount(cfg.polaroidCount || Object.keys(cfg.polaroidUrls || {}).length || 0);
        setScratchUrls(cfg.scratchUrls || {});
        setScratchGhibliUrls(cfg.scratchGhibliUrls || {});
        setScratchCount(cfg.scratchCount || Object.keys(cfg.scratchUrls || {}).length || 0);
        setGiftBoxUrls(cfg.giftBoxUrls || {});
        setGiftBoxCount(cfg.giftBoxCount || Object.keys(cfg.giftBoxUrls || {}).length || 0);
        setBgMusicUrl(cfg.bgMusicUrl || '');
        setMoodCards(cfg.moodCards || {});
        setMoodCardsCount(cfg.moodCardsCount || 0);
      }
    } catch (err) {
      setErrorMessage('Error loading gift data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preset Hue click
  const handlePresetHue = (hue) => {
    setThemeHue(hue);
    applyTheme(hue);
  };

  // Slider theme change
  const handleHueSlider = (e) => {
    const val = parseInt(e.target.value, 10);
    setThemeHue(val);
    applyTheme(val);
  };

  // Validate Core security details
  const validateCore = () => {
    const errs = {};
    if (!recipientName.trim()) {
      errs.recipientName = "Recipient's First Name is required.";
    }
    if (!birthday.trim()) {
      errs.birthday = "Birthday is required.";
    } else {
      const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      const match = birthday.match(dateRegex);
      if (!match) {
        errs.birthday = "Birthday must be in DD-MM-YYYY format (e.g., 01-01-2000).";
      } else {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        if (month < 1 || month > 12) {
          errs.birthday = "Month must be between 01 and 12.";
        } else if (day < 1 || day > 31) {
          errs.birthday = "Day must be between 01 and 31.";
        } else {
          const dateObj = new Date(year, month - 1, day);
          if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
            errs.birthday = "Please enter a valid calendar date.";
          }
        }
      }
    }

    if (!userPassword) {
      errs.userPassword = "Friend's Unlock Password is required.";
    } else if (userPassword.length < 8) {
      errs.userPassword = "Friend's Unlock Password must be at least 8 characters long.";
    } else if (!/[A-Za-z]/.test(userPassword) || !/[0-9]/.test(userPassword)) {
      errs.userPassword = "Friend's Unlock Password must contain both letters and numbers.";
    }

    if (!yourPassword) {
      errs.yourPassword = "your Control Password is required.";
    } else if (yourPassword.length < 10) {
      errs.yourPassword = "your Control Password must be at least 10 characters long.";
    } else if (!/[a-z]/.test(yourPassword) || !/[A-Z]/.test(yourPassword) || !/[0-9]/.test(yourPassword) || !/[^A-Za-z0-9]/.test(yourPassword)) {
      errs.yourPassword = "your Control Password must contain at least one uppercase, lowercase, number, and special character.";
    }

    setFormErrors(prev => {
      const next = { ...prev };
      delete next.recipientName;
      delete next.birthday;
      delete next.userPassword;
      delete next.yourPassword;
      return { ...next, ...errs };
    });

    const isValid = Object.keys(errs).length === 0;
    if (!isValid) {
      setErrorMessage("Please correct the validation errors in the Core Details section.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(null);
    }
    return isValid;
  };

  // Validate custom puzzle configurations (Memory 06 Star Word Search)
  const validatePuzzle = () => {
    if (!activeSections.section6) {
      setErrorMessage(null);
      return true;
    }

    const qaPairs = [];
    if (puzzleQ1.trim() && puzzleA1.trim()) qaPairs.push({ q: puzzleQ1, a: puzzleA1 });
    if (puzzleQ2.trim() && puzzleA2.trim()) qaPairs.push({ q: puzzleQ2, a: puzzleA2 });
    if (puzzleQ3.trim() && puzzleA3.trim()) qaPairs.push({ q: puzzleQ3, a: puzzleA3 });
    if (puzzleQ4.trim() && puzzleA4.trim()) qaPairs.push({ q: puzzleQ4, a: puzzleA4 });
    if (puzzleQ5.trim() && puzzleA5.trim()) qaPairs.push({ q: puzzleQ5, a: puzzleA5 });
    if (puzzleQ6.trim() && puzzleA6.trim()) qaPairs.push({ q: puzzleQ6, a: puzzleA6 });
    if (puzzleQ7.trim() && puzzleA7.trim()) qaPairs.push({ q: puzzleQ7, a: puzzleA7 });

    if (qaPairs.length < 3) {
      const msg = "Please provide at least 3 custom questions and answers for the Star Word Search puzzle (Memory 06), or go back to Step 3 (Sections) and disable it.";
      setFormErrors(prev => ({
        ...prev,
        puzzle: msg
      }));
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const invalidAnswer = qaPairs.find(pair => !/^[A-Za-z]+$/.test(pair.a.trim()));
    if (invalidAnswer) {
      const msg = `The word search answer "${invalidAnswer.a}" contains spaces, numbers, or special characters. Please use only letters (A-Z) with no spaces.`;
      setFormErrors(prev => ({
        ...prev,
        puzzle: msg
      }));
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setFormErrors(prev => {
      const next = { ...prev };
      delete next.puzzle;
      return next;
    });
    setErrorMessage(null);
    return true;
  };

  // Step Node click navigation protector
  const handleStepNodeClick = (sNum) => {
    if (sNum > maxStep) return;
    if (sNum > 2 && !validateCore()) {
      return;
    }
    if (sNum > 4 && !validatePuzzle()) {
      return;
    }
    setStep(sNum);
  };

  // Next button click handler
  const handleNext = () => {
    if (step === 2 && !validateCore()) {
      return;
    }
    if (step === 4 && !validatePuzzle()) {
      return;
    }
    setStep(step + 1);
  };

  // Toggle dynamic sections
  const handleSectionToggle = (secKey) => {
    setActiveSections(prev => ({
      ...prev,
      [secKey]: !prev[secKey]
    }));
  };

  // Handle files upload to Supabase Storage
  const uploadToStorage = async (file, pathName) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `gifts/${creatorId}/${pathName}_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gift-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Supabase Storage Upload Error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gift-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload to storage failed:', err);
      throw err;
    }
  };

  // Process all uploads and Save config to Supabase DB
  const handleGenerate = async () => {
    if (!validateCore()) return;
    if (!validatePuzzle()) return;
    setSaving(true);
    try {
      // 1. Process files uploads if any
      let finalProfileUrl = profileUrl;
      if (profileFile) {
        finalProfileUrl = await uploadToStorage(profileFile, 'profile');
      }

      let finalBgMusicUrl = bgMusicUrl;
      if (bgMusicFile) {
        finalBgMusicUrl = await uploadToStorage(bgMusicFile, 'bg_music');
      }

      const finalPolaroidUrls = { ...polaroidUrls };
      for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
        if (polaroidFiles[id]) {
          finalPolaroidUrls[id] = await uploadToStorage(polaroidFiles[id], `polaroid_${id}`);
        }
      }

      const finalGiftBoxUrls = { ...giftBoxUrls };
      for (const id of [1, 2, 3, 4, 5]) {
        if (giftBoxFiles[id]) {
          finalGiftBoxUrls[id] = await uploadToStorage(giftBoxFiles[id], `giftbox_${id}`);
        }
      }

      const finalScratchUrls = { ...scratchUrls };
      const finalScratchGhibliUrls = { ...scratchGhibliUrls };
      for (const id of [1, 2, 3, 4, 5, 6, 7]) {
        if (scratchFiles[id]) {
          finalScratchUrls[id] = await uploadToStorage(scratchFiles[id], `scratch_orig_${id}`);
        }
        if (scratchGhibliFiles[id]) {
          finalScratchGhibliUrls[id] = await uploadToStorage(scratchGhibliFiles[id], `scratch_ghibli_${id}`);
        }
      }

      // 2. Assemble config JSON
      const configData = {
        introText1,
        introText2,
        introOpt1,
        introOpt2,
        moonLine2,
        moonOpt2_1,
        moonOpt2_2,
        moonLine3,
        moonLine4,
        moonOpt4_1,
        moonOpt4_2,
        moonLine5,
        nickname,
        creatorName,
        puzzleQ1,
        puzzleA1,
        puzzleQ2,
        puzzleA2,
        puzzleQ3,
        puzzleA3,
        puzzleQ4,
        puzzleA4,
        puzzleQ5,
        puzzleA5,
        puzzleQ6,
        puzzleA6,
        puzzleQ7,
        puzzleA7,
        chatSenderName,
        chatMsgHis1,
        chatMsgHis2,
        chatMsgHis3,
        chatMsgHis4,
        chatMsgHer1,
        chatMsgHer2,
        giftBoxText1,
        giftBoxText2,
        giftBoxText3,
        giftBoxText4,
        giftBoxText5,
        letterText,
        qaQ4,
        qaQ5,
        qaQ6,
        qaQ7,
        qaQ9,
        moodCards,
        moodCardsCount,
        video1Url: getDirectDriveUrl(video1Url), // parse Google Drive links
        video2Url: getDirectDriveUrl(video2Url),
        profileUrl: finalProfileUrl,
        polaroidUrls: finalPolaroidUrls,
        polaroidCount,
        giftBoxUrls: finalGiftBoxUrls,
        giftBoxCount,
        scratchUrls: finalScratchUrls,
        scratchGhibliUrls: finalScratchGhibliUrls,
        scratchCount,
        bgMusicUrl: finalBgMusicUrl
      };

      let finalPasscode = passcode.trim().toUpperCase();
      if (!finalPasscode) {
        const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const cleanName = recipientName.replace(/[^A-Za-z]/g, '').toUpperCase() || 'FRIEND';
        finalPasscode = `WISH-${cleanName}-${randStr}`;
      }

      const giftRecord = {
        creator_id: creatorId,
        recipient_name: recipientName,
        birthday: birthday,
        theme_hue: themeHue,
        user_password: userPassword,
        your_password: yourPassword,
        active_sections: activeSections,
        config_data: configData,
        passcode: finalPasscode
      };

      let finalId = editId;

      if (editId) {
        // Update existing gift configuration
        const { error } = await supabase
          .from('gifts')
          .update(giftRecord)
          .eq('id', editId)
          .eq('creator_id', creatorId);

        if (error) throw error;
      } else {
        // Insert new gift configuration
        const { data, error } = await supabase
          .from('gifts')
          .insert(giftRecord)
          .select('id')
          .single();

        if (error) throw error;
        finalId = data.id;
      }

      setPasscode(finalPasscode);
      setSuccessGiftId(finalId);
      setStep(6); // Go to final wizard links display step
    } catch (err) {
      console.error('Error in handleGenerate:', err);
      const errMsg = err?.message || err?.error_description || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Unknown error';
      setErrorMessage('Failed to save configuration: ' + errMsg + '. Make sure a public bucket named "gift-assets" exists in your Supabase Storage dashboard.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (text, type, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkType(type);
    setInfoMessage(`${label} copied to clipboard!`);
    setTimeout(() => {
      setInfoMessage(null);
      setCopiedLinkType('');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="ch-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#x39ddd' }}>Loading wizard portal...</div>
      </div>
    );
  }

  // Pre-configured Presets for Hue themes
  const PRESET_THEMES = [
    { label: 'Water Blue', hue: 198, color: 'hsl(198, 70%, 55%)' },
    { label: 'Crimson Red', hue: 350, color: 'hsl(350, 70%, 55%)' },
    { label: 'Emerald Green', hue: 140, color: 'hsl(140, 70%, 55%)' },
    { label: 'Sapphire Blue', hue: 210, color: 'hsl(210, 70%, 55%)' },
    { label: 'Amber Orange', hue: 35, color: 'hsl(35, 70%, 55%)' },
    { label: 'Violet', hue: 270, color: 'hsl(270, 70%, 55%)' },
    { label: 'Pink', hue: 330, color: 'hsl(330, 75%, 60%)' },
    { label: 'Navy Blue', hue: 230, color: 'hsl(230, 70%, 45%)' },
    { label: 'Brown', hue: 25, color: 'hsl(25, 60%, 45%)' }
  ];

  return (
    <div className="ch-root">
      <div className="ch-container">

        {errorMessage && (
          <div className="ch-error-banner" style={{
            background: 'rgba(255, 85, 85, 0.1)',
            border: '1px solid rgba(255, 85, 85, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ff5555',
            fontSize: '0.95rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚠️</span>
              <div>{errorMessage}</div>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
            >
              ×
            </button>
          </div>
        )}

        {infoMessage && (
          <div className="ch-info-banner" style={{
            background: 'rgba(179, 157, 219, 0.1)',
            border: '1px solid rgba(179, 157, 219, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#b39ddb',
            fontSize: '0.95rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>✨</span>
              <div>{infoMessage}</div>
            </div>
            <button 
              onClick={() => setInfoMessage(null)} 
              style={{ background: 'none', border: 'none', color: '#b39ddb', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Hub Header */}
        <header className="ch-header">
          <h1 className="ch-title">{editId ? 'Edit Birthday Vault' : 'New Birthday Vault'}</h1>
          <button className="ch-btn-close" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </header>

        {/* Multi-step progress node bar */}
        {step < 6 && (
          <div className="ch-steps">
            <div className="ch-steps-line" />
            <div className="ch-steps-progress" style={{ width: `${((step - 1) / (maxStep - 1)) * 100}%` }} />

            {Array.from({ length: maxStep }, (_, i) => i + 1).map(sNum => (
              <div
                key={sNum}
                className={`ch-step-node ${step === sNum ? 'active' : ''} ${step > sNum ? 'completed' : ''}`}
                onClick={() => handleStepNodeClick(sNum)}
              >
                {sNum}
                <span className="ch-step-node-label">
                  {sNum === 1 && 'Theme'}
                  {sNum === 2 && 'Core'}
                  {sNum === 3 && 'Sections'}
                  {sNum === 4 && 'Story'}
                  {sNum === 5 && 'Media'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Color Theming */}
        {step === 1 && (
          <div className="ch-form-step">
            <h2 className="ch-section-title">🎨 Custom Hue Theme Color</h2>

            <div className="ch-hue-preview-box">
              <div
                className="ch-hue-circle"
                style={{
                  backgroundColor: `hsl(${themeHue}, 60%, 45%)`,
                  '--preview-glow': `hsla(${themeHue}, 60%, 45%, 0.6)`
                }}
              />
              <div className="ch-hue-slider-wrap">
                <span className="ch-label">Adjust Color Range (Hue: {themeHue}°)</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={themeHue}
                  onChange={handleHueSlider}
                  className="ch-slider"
                />
              </div>
            </div>

            <div className="ch-group">
              <label className="ch-label">Or Select Preset Themes</label>
              <div className="ch-theme-presets">
                {PRESET_THEMES.map(preset => (
                  <button
                    key={preset.label}
                    className="ch-preset-btn"
                    style={{
                      borderColor: themeHue === preset.hue ? preset.color : 'rgba(255,255,255,0.1)',
                      background: themeHue === preset.hue ? 'rgba(255,255,255,0.05)' : 'none',
                      color: preset.color
                    }}
                    onClick={() => handlePresetHue(preset.hue)}
                  >
                    <span className="ch-preset-dot" style={{ backgroundColor: preset.color }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Core Details */}
        {step === 2 && (
          <div className="ch-form-step">
            <h2 className="ch-section-title">🔑 Recipient Security & Core Details</h2>
            <div className="ch-grid-2">
              <div className="ch-group">
                <label className="ch-label">Your Name (Creator)</label>
                <input
                  type="text"
                  className="ch-input"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Alex"
                  required
                />
              </div>
              <div className="ch-group">
                <label className="ch-label">Recipient's First Name</label>
                <input
                  type="text"
                  className="ch-input"
                  style={formErrors.recipientName ? { borderColor: '#ff5555', boxShadow: '0 0 5px rgba(255, 85, 85, 0.2)' } : {}}
                  value={recipientName}
                  onChange={(e) => handleFieldChange('recipientName', e.target.value, setRecipientName)}
                  placeholder="e.g. Sophia"
                  required
                />
                {formErrors.recipientName && (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#ff5555', marginTop: '4px' }}>
                    {formErrors.recipientName}
                  </span>
                )}
              </div>
              <div className="ch-group">
                <label className="ch-label">Recipient's Nickname (Optional)</label>
                <input
                  type="text"
                  className="ch-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Bestie"
                />
              </div>
            </div>
            <div className="ch-grid-2" style={{ marginTop: '15px' }}>
              <div className="ch-group" style={{ gridColumn: 'span 2' }}>
                <label className="ch-label">Birthday (DD-MM-YYYY)</label>
                <input
                  type="text"
                  className="ch-input"
                  style={formErrors.birthday ? { borderColor: '#ff5555', boxShadow: '0 0 5px rgba(255, 85, 85, 0.2)' } : {}}
                  value={birthday}
                  onChange={(e) => handleFieldChange('birthday', e.target.value, setBirthday)}
                  placeholder="e.g. 01-01-2000"
                  required
                />
                {formErrors.birthday ? (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#ff5555', marginTop: '4px' }}>
                    {formErrors.birthday}
                  </span>
                ) : (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    Please enter the recipient's date of birth in day-month-year format.
                  </span>
                )}
              </div>
            </div>

            <div className="ch-grid-2" style={{ marginTop: '15px' }}>
              <div className="ch-group" style={{ gridColumn: 'span 2' }}>
                <label className="ch-label">Custom Memorable Passcode (Optional)</label>
                <input
                  type="text"
                  className="ch-input"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  placeholder="e.g. HAPPY-BIRTHDAY-AMIT"
                />
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  A short, easy-to-remember code for the URL (e.g., `HAPPY-AMIT`). Only letters, numbers, and hyphens are allowed. Left blank to auto-generate.
                </span>
              </div>
            </div>
            <div className="ch-grid-2">
              <div className="ch-group">
                <label className="ch-label">Friend's Unlock Password</label>
                <input
                  type="text"
                  className="ch-input"
                  style={formErrors.userPassword ? { borderColor: '#ff5555', boxShadow: '0 0 5px rgba(255, 85, 85, 0.2)' } : {}}
                  value={userPassword}
                  onChange={(e) => handleFieldChange('userPassword', e.target.value, setUserPassword)}
                  placeholder="e.g. Wish@17"
                  required
                />
                {formErrors.userPassword ? (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#ff5555', marginTop: '4px' }}>
                    {formErrors.userPassword}
                  </span>
                ) : (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    Must be at least 8 characters with letters and numbers.
                  </span>
                )}
              </div>
              <div className="ch-group">
                <label className="ch-label">your Control Password</label>
                <input
                  type="text"
                  className="ch-input"
                  style={formErrors.yourPassword ? { borderColor: '#ff5555', boxShadow: '0 0 5px rgba(255, 85, 85, 0.2)' } : {}}
                  value={yourPassword}
                  onChange={(e) => handleFieldChange('yourPassword', e.target.value, setyourPassword)}
                  placeholder="e.g. your@17"
                  required
                />
                {formErrors.yourPassword ? (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#ff5555', marginTop: '4px' }}>
                    {formErrors.yourPassword}
                  </span>
                ) : (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    Must be at least 10 characters, with uppercase, lowercase, numbers, and special characters.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Modular Sections Toggles */}
        {step === 3 && (
          <div className="ch-form-step">
            <h2 className="ch-section-title">🧩 Select Memory Sections</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '25px' }}>
              Toggle on or off any experience page depending on your preference. Disabled sections are skipped automatically in the path and gallery hub.
            </p>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '10px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>🎬 Introductory Onboarding Scenes</h3>
            <div className="ch-sections-grid" style={{ marginBottom: '25px' }}>
              <div className={`ch-section-toggle ${activeSections.scene1 ? 'active' : ''}`} onClick={() => handleSectionToggle('scene1')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Scene 01: The Moon</span>
                  <span className="ch-section-sub">Initial dialogue and choices</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.scene2 ? 'active' : ''}`} onClick={() => handleSectionToggle('scene2')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Scene 02: Countdown</span>
                  <span className="ch-section-sub">Birthday timer countdown</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.scene3 ? 'active' : ''}`} onClick={() => handleSectionToggle('scene3')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Scene 03: Fireworks</span>
                  <span className="ch-section-sub">Sparkler / cast magic game</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.scene4 ? 'active' : ''}`} onClick={() => handleSectionToggle('scene4')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Scene 04: The Envelope</span>
                  <span className="ch-section-sub">Magic seal unsealing page</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', color: '#f0c878', marginBottom: '10px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>🧩 Interactive Memory Pages</h3>
            <div className="ch-sections-grid">
              <div className={`ch-section-toggle ${activeSections.section1 ? 'active' : ''}`} onClick={() => handleSectionToggle('section1')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 01: Intro Video</span>
                  <span className="ch-section-sub">Personalized streaming clip</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section2 ? 'active' : ''}`} onClick={() => handleSectionToggle('section2')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 02: Polaroid Wall</span>
                  <span className="ch-section-sub">8 photos and captions</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section3 ? 'active' : ''}`} onClick={() => handleSectionToggle('section3')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 03: Simulated Chat</span>
                  <span className="ch-section-sub">Retro WhatsApp dialogue</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section4 ? 'active' : ''}`} onClick={() => handleSectionToggle('section4')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 04: 3D Gift Boxes</span>
                  <span className="ch-section-sub">Clickable boxes containing items</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section5 ? 'active' : ''}`} onClick={() => handleSectionToggle('section5')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 05: 3D Cake</span>
                  <span className="ch-section-sub">Candle blowout mechanism</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section6 ? 'active' : ''}`} onClick={() => handleSectionToggle('section6')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 06: Star Puzzle</span>
                  <span className="ch-section-sub">12x12 word search board</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section7 ? 'active' : ''}`} onClick={() => handleSectionToggle('section7')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 07: Scratch Gallery</span>
                  <span className="ch-section-sub">Orbiting canvas scratch stars</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section8 ? 'active' : ''}`} onClick={() => handleSectionToggle('section8')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 08: Interactive Room</span>
                  <span className="ch-section-sub">3D table with music & diary</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section9 ? 'active' : ''}`} onClick={() => handleSectionToggle('section9')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 09: Emotional Cards</span>
                  <span className="ch-section-sub">Infinite horizontal support messages</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section10 ? 'active' : ''}`} onClick={() => handleSectionToggle('section10')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 10: Q&A</span>
                  <span className="ch-section-sub">Interactive logs for reactions</span>
                </div>
              </div>
              <div className={`ch-section-toggle ${activeSections.section11 ? 'active' : ''}`} onClick={() => handleSectionToggle('section11')}>
                <div className="ch-checkbox">✓</div>
                <div>
                  <span className="ch-section-lbl">Memory 11: Heartfelt Scroll</span>
                  <span className="ch-section-sub">Interactive vintage wish scroll</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Dialogue, Puzzle Answers & Story Texts */}
        {step === 4 && (
          <div className="ch-form-step">
            <h2 className="ch-section-title">✍️ Story Dialogues & Text Configuration</h2>

            <div className="ch-alert-box">
              <span>✍️</span>
              <div>
                <strong>Customizing Experience Text</strong>
                Adapt the introductory Moon chats, Star search puzzle keywords, and final handwritten letter text to match your bond.
              </div>
            </div>
            {activeSections.scene1 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '20px 0' }}>🌕 Moon Dialogue (Scene 1)</h3>
                
                {/* Stage 1 Intro */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--violet-light)' }}>Stage 1: Introduction</h4>
                  <div className="ch-grid-2">
                    <div className="ch-group">
                      <label className="ch-label">Intro Message Line 1</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={introText1}
                        onChange={(e) => setIntroText1(e.target.value)}
                        placeholder="e.g. Hi! I am Moon 🌕"
                      />
                    </div>
                    <div className="ch-group">
                      <label className="ch-label">Intro Message Line 2</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={introText2}
                        onChange={(e) => setIntroText2(e.target.value)}
                        placeholder="e.g. Is today a special day?"
                      />
                    </div>
                  </div>
                  <div className="ch-grid-2">
                    <div className="ch-group">
                      <label className="ch-label">Choice Option 1</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={introOpt1}
                        onChange={(e) => setIntroOpt1(e.target.value)}
                        placeholder="e.g. Of course ✦"
                      />
                    </div>
                    <div className="ch-group">
                      <label className="ch-label">Choice Option 2</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={introOpt2}
                        onChange={(e) => setIntroOpt2(e.target.value)}
                        placeholder="e.g. Yes, for sure ✨"
                      />
                    </div>
                  </div>
                </div>

                {/* Stage 2 Shining */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--violet-light)' }}>Stage 2: Compliment Dialogue</h4>
                  <div className="ch-group">
                    <label className="ch-label">Moon Question (Brighter than me?)</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={moonLine2}
                      onChange={(e) => setMoonLine2(e.target.value)}
                      placeholder="e.g. I heard that you are even brighter than me, is that true?"
                    />
                  </div>
                  <div className="ch-grid-2">
                    <div className="ch-group">
                      <label className="ch-label">Positive Response Option (Yes)</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={moonOpt2_1}
                        onChange={(e) => setMoonOpt2_1(e.target.value)}
                        placeholder="e.g. Yes ✨"
                      />
                    </div>
                    <div className="ch-group">
                      <label className="ch-label">Negative Response Option (No)</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={moonOpt2_2}
                        onChange={(e) => setMoonOpt2_2(e.target.value)}
                        placeholder="e.g. Not really"
                      />
                    </div>
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Nudge Message (If they select No)</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={moonLine3}
                      onChange={(e) => setMoonLine3(e.target.value)}
                      placeholder="e.g. Don't be shy, you look absolutely wonderful today! 💜"
                    />
                  </div>
                </div>

                {/* Stage 3 Surprise */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--violet-light)' }}>Stage 3: Surprise Consent</h4>
                  <div className="ch-group">
                    <label className="ch-label">Consent Question (Can I show surprise?)</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={moonLine4}
                      onChange={(e) => setMoonLine4(e.target.value)}
                      placeholder="e.g. So... my friend wanted to give you a surprise, can I show you?"
                    />
                  </div>
                  <div className="ch-grid-2">
                    <div className="ch-group">
                      <label className="ch-label">Accept Option (Yes)</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={moonOpt4_1}
                        onChange={(e) => setMoonOpt4_1(e.target.value)}
                        placeholder="e.g. Yes, please! ✦"
                      />
                    </div>
                    <div className="ch-group">
                      <label className="ch-label">Decline Option (No - floats away)</label>
                      <input
                        type="text"
                        className="ch-input"
                        value={moonOpt4_2}
                        onChange={(e) => setMoonOpt4_2(e.target.value)}
                        placeholder="e.g. No, thanks"
                      />
                    </div>
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Pleading Message (If they hover/select No)</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={moonLine5}
                      onChange={(e) => setMoonLine5(e.target.value)}
                      placeholder="e.g. Are you sure? I think you'll love it! 💜"
                    />
                  </div>
                </div>
              </>
            )}

            {activeSections.section3 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '20px 0' }}>💬 Simulated Chat Dialogues (Memory 03)</h3>
                <div className="ch-group">
                  <label className="ch-label">Chat Sender Name</label>
                  <input type="text" className="ch-input" value={chatSenderName} onChange={(e) => setChatSenderName(e.target.value)} placeholder="e.g. Best Friend" />
                </div>
                <div className="ch-grid-2" style={{ marginTop: '10px' }}>
                  <div className="ch-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ch-label">Message 1 (Midnight Wish)</label>
                    <textarea className="ch-input" style={{ height: '70px', padding: '10px', width: '100%' }} value={chatMsgHis1} onChange={(e) => setChatMsgHis1(e.target.value)} placeholder="e.g. Wishing you a Very Happy Birthday! 🎂💐🎁" />
                  </div>
                  <div className="ch-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ch-label">Message 2 (Blessings)</label>
                    <textarea className="ch-input" style={{ height: '70px', padding: '10px', width: '100%' }} value={chatMsgHis2} onChange={(e) => setChatMsgHis2(e.target.value)} placeholder="e.g. May all your dreams come true, you are the best..." />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Their Response 1 (Thank you)</label>
                    <input type="text" className="ch-input" value={chatMsgHer1} onChange={(e) => setChatMsgHer1(e.target.value)} placeholder="e.g. Thank you so much 😊" />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Message 3 (Surprise query)</label>
                    <input type="text" className="ch-input" value={chatMsgHis3} onChange={(e) => setChatMsgHis3(e.target.value)} placeholder="e.g. Did you expect a wish at midnight?" />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Their Response 2 (Surprised answer)</label>
                    <input type="text" className="ch-input" value={chatMsgHer2} onChange={(e) => setChatMsgHer2(e.target.value)} placeholder="e.g. Honestly no, no one has wished me like this before!" />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Message 4 (Ready to explore?)</label>
                    <input type="text" className="ch-input" value={chatMsgHis4} onChange={(e) => setChatMsgHis4(e.target.value)} placeholder="e.g. I have a few surprises waiting for you, ready to explore?" />
                  </div>
                </div>
              </>
            )}

            {activeSections.section4 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '20px 0' }}>🎁 3D Gift Box Inner Messages (Memory 04)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ch-group">
                    <label className="ch-label">Box 1 Text</label>
                    <textarea className="ch-textarea" style={{ height: '60px' }} value={giftBoxText1} onChange={(e) => setGiftBoxText1(e.target.value)} placeholder="e.g. A beautiful memory... Every day spent with you is a gift." />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Box 2 Text</label>
                    <textarea className="ch-textarea" style={{ height: '60px' }} value={giftBoxText2} onChange={(e) => setGiftBoxText2(e.target.value)} placeholder="e.g. Your unique vibe... You bring so much color into my world." />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Box 3 Text</label>
                    <textarea className="ch-textarea" style={{ height: '60px' }} value={giftBoxText3} onChange={(e) => setGiftBoxText3(e.target.value)} placeholder="e.g. Special moments... Thank you for always making me smile." />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Box 4 Text</label>
                    <textarea className="ch-textarea" style={{ height: '60px' }} value={giftBoxText4} onChange={(e) => setGiftBoxText4(e.target.value)} placeholder="e.g. A bright future... May all your dreams and wishes come true." />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Box 5 Text</label>
                    <textarea className="ch-textarea" style={{ height: '60px' }} value={giftBoxText5} onChange={(e) => setGiftBoxText5(e.target.value)} placeholder="e.g. A token of appreciation... Because you deserve the best." />
                  </div>
                </div>
              </>
            )}

            {activeSections.section6 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '20px 0' }}>Star Search Puzzle Keywords (Memory 06)</h3>
                {formErrors.puzzle && (
                  <div style={{ color: '#ff5555', fontSize: '0.9rem', marginBottom: '15px', padding: '10px 15px', background: 'rgba(255, 85, 85, 0.1)', border: '1px solid rgba(255, 85, 85, 0.3)', borderRadius: '8px' }}>
                    ⚠️ {formErrors.puzzle}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const getQ = () => {
                      if (num === 1) return { val: puzzleQ1, set: setPuzzleQ1, placeholder: "e.g. What is your nickname?" };
                      if (num === 2) return { val: puzzleQ2, set: setPuzzleQ2, placeholder: "e.g. What color do you like?" };
                      if (num === 3) return { val: puzzleQ3, set: setPuzzleQ3, placeholder: "e.g. What is your zodiac sign?" };
                      if (num === 4) return { val: puzzleQ4, set: setPuzzleQ4, placeholder: "e.g. What chocolate do you like?" };
                      if (num === 5) return { val: puzzleQ5, set: setPuzzleQ5, placeholder: "e.g. Your little brother's name?" };
                      if (num === 6) return { val: puzzleQ6, set: setPuzzleQ6, placeholder: "e.g. Your little sister's name?" };
                      return { val: puzzleQ7, set: setPuzzleQ7, placeholder: "e.g. You are from where?" };
                    };

                    const getA = () => {
                      if (num === 1) return { val: puzzleA1, set: setPuzzleA1, placeholder: "WISH" };
                      if (num === 2) return { val: puzzleA2, set: setPuzzleA2, placeholder: "GREEN" };
                      if (num === 3) return { val: puzzleA3, set: setPuzzleA3, placeholder: "ARIES" };
                      if (num === 4) return { val: puzzleA4, set: setPuzzleA4, placeholder: "SNICKERS" };
                      if (num === 5) return { val: puzzleA5, set: setPuzzleA5, placeholder: "ALEX" };
                      if (num === 6) return { val: puzzleA6, set: setPuzzleA6, placeholder: "SOPHIA" };
                      return { val: puzzleA7, set: setPuzzleA7, placeholder: "LONDON" };
                    };

                    const q = getQ();
                    const a = getA();

                    return (
                      <div key={num} className="ch-grid-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '15px' }}>
                        <div className="ch-group">
                          <label className="ch-label">Word Search Question #{num}</label>
                          <input
                            type="text"
                            className="ch-input"
                            value={q.val}
                            onChange={(e) => q.set(e.target.value)}
                            placeholder={q.placeholder}
                          />
                        </div>
                        <div className="ch-group">
                          <label className="ch-label">Hidden Answer (Uppercase Only)</label>
                          <input
                            type="text"
                            className="ch-input"
                            value={a.val}
                            onChange={(e) => a.set(e.target.value.toUpperCase())}
                            placeholder={a.placeholder}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {activeSections.section9 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '30px 0 15px 0', color: '#b39ddb' }}>💖 Wish Cards Configuration (Memory 09)</h3>
                
                {/* Step 1: Count picker */}
                {moodCardsCount === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>How many mood cards do you want? (min 3, max 10)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button key={n} type="button" onClick={() => {
                          setMoodCardsCount(n);
                          setMoodCards(prev => {
                            const next = { ...prev };
                            for (let i = 1; i <= n; i++) {
                              if (!next[i]) {
                                const def = DEFAULT_MOOD_CARDS[i - 1] || { front: '', back: '' };
                                next[i] = { front: def.front, back: def.back };
                              }
                            }
                            return next;
                          });
                        }}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(179,157,219,0.3)', background: 'rgba(179,157,219,0.08)', color: '#b39ddb', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(179,157,219,0.25)'; e.target.style.borderColor = '#b39ddb'; }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(179,157,219,0.08)'; e.target.style.borderColor = 'rgba(179,157,219,0.3)'; }}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{moodCardsCount} cards selected</span>
                      <button type="button" onClick={() => setMoodCardsCount(0)} style={{ fontSize: '0.75rem', color: '#b39ddb', background: 'none', border: '1px solid rgba(179,157,219,0.3)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>✎ Change count</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                      {Array.from({ length: moodCardsCount }, (_, i) => i + 1).map(id => (
                        <div key={`mood-card-${id}`} className="ch-grid-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '15px' }}>
                          <div className="ch-group">
                            <label className="ch-label">Card #{id} Front (e.g. Sad, Happy)</label>
                            <input
                              type="text"
                              className="ch-input"
                              value={moodCards[id]?.front || ''}
                              onChange={(e) => setMoodCards(prev => ({
                                ...prev,
                                [id]: { ...(prev[id] || {}), front: e.target.value }
                              }))}
                              placeholder="e.g. Sad"
                              required
                            />
                          </div>
                          <div className="ch-group">
                            <label className="ch-label">Card #{id} Back (Comfort Message)</label>
                            <input
                              type="text"
                              className="ch-input"
                              value={moodCards[id]?.back || ''}
                              onChange={(e) => setMoodCards(prev => ({
                                ...prev,
                                [id]: { ...(prev[id] || {}), back: e.target.value }
                              }))}
                              placeholder="e.g. I will be your shoulder"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {activeSections.section10 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '30px 0 15px 0', color: '#b39ddb' }}>🌙 Moon Q&A Configuration (Memory 10)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ch-group">
                    <label className="ch-label">Question 1: Who is the creator to them?</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={qaQ4}
                      onChange={(e) => setQaQ4(e.target.value)}
                      placeholder="e.g. Who is your friend to you?"
                    />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Question 2: Gift feedback query</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={qaQ5}
                      onChange={(e) => setQaQ5(e.target.value)}
                      placeholder="e.g. Are you really happy with this gift? Did you expect this from them?"
                    />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Question 3: Heartfelt query</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={qaQ6}
                      onChange={(e) => setQaQ6(e.target.value)}
                      placeholder="e.g. If you could say one thing to them, what would it be?"
                    />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Question 4: Intent/Curiosity query</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={qaQ7}
                      onChange={(e) => setQaQ7(e.target.value)}
                      placeholder="e.g. Are you wondering why they made this for you, and what you did to inspire it?"
                    />
                  </div>
                  <div className="ch-group">
                    <label className="ch-label">Question 5: Commitment query</label>
                    <input
                      type="text"
                      className="ch-input"
                      value={qaQ9}
                      onChange={(e) => setQaQ9(e.target.value)}
                      placeholder="e.g. Will you be their best friend in any situation, and never leave them? Tell the truth."
                    />
                  </div>
                </div>
              </>
            )}

            {activeSections.section11 && (
              <div className="ch-group" style={{ marginTop: '20px' }}>
                <label className="ch-label">Heartfelt Scroll Letter (Memory 11)</label>
                <textarea
                  className="ch-textarea"
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  placeholder="Write your long heartfelt message here..."
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Media & Direct Assets Uploads */}
        {step === 5 && (
          <div className="ch-form-step">
            <h2 className="ch-section-title">🎬 Video Streams & Polaroid Uploads</h2>

            {activeSections.section1 && (
              <>
                <div className="ch-alert-box">
                  <span>📂</span>
                  <div>
                    <strong>Google Drive Streaming Instructions</strong>
                    <p>Upload your videos to <strong>Google Drive</strong> and paste the link below:</p>
                    <ol>
                      <li>Set sharing to <strong>"Anyone with the link can view"</strong>.</li>
                      <li>Copy and paste the standard Drive link below.</li>
                    </ol>
                  </div>
                </div>

                <div className="ch-group">
                  <label className="ch-label">Intro Envelope Fall Video URL (Google Drive Link)</label>
                  <input
                    type="text"
                    className="ch-input"
                    value={video1Url}
                    onChange={(e) => setVideo1Url(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  />
                </div>

                <div className="ch-group">
                  <label className="ch-label">Memory Section 1 Video URL (Google Drive Link)</label>
                  <input
                    type="text"
                    className="ch-input"
                    value={video2Url}
                    onChange={(e) => setVideo2Url(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  />
                </div>
              </>
            )}

            {(activeSections.section3 || activeSections.section8) && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px 0' }}>Upload Profile & Background Music</h3>

                {activeSections.section3 && (() => {
                    const profilePreview = profileFile ? URL.createObjectURL(profileFile) : profileUrl;
                    return (
                      <div className="ch-file-row">
                        <div className="ch-file-info">
                          <span className="ch-file-name">Recipient Profile Pfp Picture</span>
                          <span className="ch-file-help">Shows in simulated chat. Left empty to use default placeholder.</span>
                        </div>
                        {profilePreview && <img className="ch-upload-preview" src={profilePreview} alt="Preview" />}
                        <input key={profileFile ? 'profile-has' : 'profile-no'} type="file" id="profile" accept="image/*" className="ch-file-input" onChange={(e) => setProfileFile(e.target.files[0])} />
                        <div style={{ display: 'flex', gap: '8px', alignSelf: 'center' }}>
                          <label htmlFor="profile" className="ch-btn-upload">{profileFile ? '✓ File Selected' : profileUrl ? '✎ Replace' : 'Choose File'}</label>
                          {profilePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileFile(null);
                                setProfileUrl('');
                              }}
                              style={{
                                fontSize: '0.75rem',
                                color: '#ff7070',
                                background: 'rgba(255, 112, 112, 0.1)',
                                border: '1px solid rgba(255, 112, 112, 0.3)',
                                borderRadius: '8px',
                                padding: '5px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                              onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                }

                {activeSections.section8 && (() => {
                    const bgmPreviewUrl = bgMusicFile ? URL.createObjectURL(bgMusicFile) : bgMusicUrl;
                    const bgmFileName = bgMusicFile ? bgMusicFile.name : bgMusicUrl ? bgMusicUrl.split('/').pop() : null;
                    const bgmFileSize = bgMusicFile ? `${(bgMusicFile.size / (1024 * 1024)).toFixed(2)} MB` : null;
                    return (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: bgmPreviewUrl ? '1px solid rgba(179,157,219,0.3)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span className="ch-file-name" style={{ display: 'block', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>🎵 Custom Background Music (BGM MP3)</span>
                            <span className="ch-file-help" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Upload audio MP3 for tape deck. Max 8MB.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input key={bgMusicFile ? 'bgm-has' : 'bgm-no'} type="file" id="bg-music" accept="audio/mpeg" className="ch-file-input" onChange={(e) => setBgMusicFile(e.target.files[0])} />
                            <label htmlFor="bg-music" className="ch-btn-upload" style={{ whiteSpace: 'nowrap' }}>
                              {bgMusicFile ? '✎ Replace' : bgMusicUrl ? '✎ Replace' : '+ Choose MP3'}
                            </label>
                            {bgmPreviewUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBgMusicFile(null);
                                  setBgMusicUrl('');
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#ff7070',
                                  background: 'rgba(255, 112, 112, 0.1)',
                                  border: '1px solid rgba(255, 112, 112, 0.3)',
                                  borderRadius: '8px',
                                  padding: '5px 12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                                onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                              >
                                ✕ Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Selected file info */}
                        {bgmFileName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(179,157,219,0.08)', borderRadius: '8px', border: '1px solid rgba(179,157,219,0.15)' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎶</span>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <span style={{ display: 'block', fontSize: '0.85rem', color: '#b39ddb', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bgmFileName}</span>
                              {bgmFileSize && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{bgmFileSize}</span>}
                            </div>
                            {bgMusicFile && <span style={{ fontSize: '0.75rem', color: '#7dca8c', flexShrink: 0 }}>✓ New file ready</span>}
                          </div>
                        )}

                        {/* Audio preview player */}
                        {bgmPreviewUrl && (
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px' }}>Preview:</span>
                            <audio
                              controls
                              src={bgmPreviewUrl}
                              style={{ width: '100%', height: '36px', borderRadius: '8px', accentColor: '#b39ddb' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()
                }
              </>
            )}

            {activeSections.section2 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '30px 0 15px 0', color: '#b39ddb' }}>📷 Polaroid Photos (Memory 02)</h3>

                {/* Step 1: Count picker */}
                {polaroidCount === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>How many polaroid photos do you want to add? (Minimum of 7 photos required for the best visual output, max 8)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                      {[7, 8].map(n => (
                        <button key={n} onClick={() => setPolaroidCount(n)}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(179,157,219,0.3)', background: 'rgba(179,157,219,0.08)', color: '#b39ddb', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(179,157,219,0.25)'; e.target.style.borderColor = '#b39ddb'; }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(179,157,219,0.08)'; e.target.style.borderColor = 'rgba(179,157,219,0.3)'; }}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{polaroidCount} photo{polaroidCount > 1 ? 's' : ''} selected</span>
                      <button onClick={() => setPolaroidCount(0)} style={{ fontSize: '0.75rem', color: '#b39ddb', background: 'none', border: '1px solid rgba(179,157,219,0.3)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>✎ Change count</button>
                    </div>
                    <div className="ch-assets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                      {Array.from({ length: polaroidCount }, (_, i) => i + 1).map(id => {
                        const previewSrc = polaroidFiles[id] ? URL.createObjectURL(polaroidFiles[id]) : polaroidUrls[id];
                        return (
                          <div key={`pol-${id}`} style={{ background: 'rgba(255,255,255,0.02)', border: previewSrc ? '1px solid rgba(179,157,219,0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Photo #{id}</span>
                            {previewSrc
                              ? <img style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} src={previewSrc} alt={`Polaroid ${id}`} />
                              : <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🖼️</div>
                            }
                            <input key={polaroidFiles[id] ? `pol-has-${id}` : `pol-no-${id}`} type="file" id={`polaroid-${id}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => setPolaroidFiles(prev => ({ ...prev, [id]: e.target.files[0] }))} />
                            <label htmlFor={`polaroid-${id}`} className="ch-btn-upload" style={{ fontSize: '0.75rem', padding: '5px 10px', width: '100%' }}>
                              {polaroidFiles[id] ? '✓ Changed' : polaroidUrls[id] ? '✎ Replace' : '+ Choose'}
                            </label>
                            {previewSrc && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPolaroidFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
                                  setPolaroidUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#ff7070',
                                  background: 'rgba(255, 112, 112, 0.1)',
                                  border: '1px solid rgba(255, 112, 112, 0.3)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  width: '100%',
                                  marginTop: '2px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                                onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                              >
                                ✕ Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {activeSections.section4 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '30px 0 15px 0', color: '#b39ddb' }}>🎁 3D Gift Box Photos (Memory 04)</h3>

                {/* Step 1: Count picker */}
                {giftBoxCount === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>How many gift box photos do you want to add?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setGiftBoxCount(n)}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(240,200,120,0.3)', background: 'rgba(240,200,120,0.08)', color: '#f0c878', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(240,200,120,0.25)'; e.target.style.borderColor = '#f0c878'; }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(240,200,120,0.08)'; e.target.style.borderColor = 'rgba(240,200,120,0.3)'; }}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{giftBoxCount} box photo{giftBoxCount > 1 ? 's' : ''} selected</span>
                      <button onClick={() => setGiftBoxCount(0)} style={{ fontSize: '0.75rem', color: '#f0c878', background: 'none', border: '1px solid rgba(240,200,120,0.3)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>✎ Change count</button>
                    </div>
                    <div className="ch-assets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                      {Array.from({ length: giftBoxCount }, (_, i) => i + 1).map(id => {
                        const previewSrc = giftBoxFiles[id] ? URL.createObjectURL(giftBoxFiles[id]) : giftBoxUrls[id];
                        return (
                          <div key={`gift-${id}`} style={{ background: 'rgba(255,255,255,0.02)', border: previewSrc ? '1px solid rgba(179,157,219,0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Gift Box #{id}</span>
                            {previewSrc
                              ? <img style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} src={previewSrc} alt={`Gift ${id}`} />
                              : <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🎁</div>
                            }
                            <input key={giftBoxFiles[id] ? `gift-has-${id}` : `gift-no-${id}`} type="file" id={`giftbox-${id}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => setGiftBoxFiles(prev => ({ ...prev, [id]: e.target.files[0] }))} />
                            <label htmlFor={`giftbox-${id}`} className="ch-btn-upload" style={{ fontSize: '0.75rem', padding: '5px 10px', width: '100%' }}>
                              {giftBoxFiles[id] ? '✓ Changed' : giftBoxUrls[id] ? '✎ Replace' : '+ Choose'}
                            </label>
                            {previewSrc && (
                              <button
                                type="button"
                                onClick={() => {
                                  setGiftBoxFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
                                  setGiftBoxUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#ff7070',
                                  background: 'rgba(255, 112, 112, 0.1)',
                                  border: '1px solid rgba(255, 112, 112, 0.3)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  width: '100%',
                                  marginTop: '2px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                                onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                              >
                                ✕ Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {activeSections.section7 && (
              <>
                <h3 className="ch-label" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '30px 0 10px 0', color: '#b39ddb' }}>⭐ Scratch Card Photos (Memory 07)</h3>
                <div className="ch-alert-box" style={{ marginBottom: '20px' }}>
                  <span>✨</span>
                  <div>
                    <strong>How the Scratch Cards work</strong>
                    <p>Each card has <strong>2 images</strong>: the <strong>Original Photo</strong> shown under the scratch surface, and the <strong>Ghibli Art</strong> version revealed after the user taps to cast magic. Upload both for each card.</p>
                  </div>
                </div>

                {/* Step 1: Count picker */}
                {scratchCount === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>How many scratch cards do you want? (min 1, max 7)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <button key={n} onClick={() => setScratchCount(n)}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(240,200,120,0.3)', background: 'rgba(240,200,120,0.06)', color: '#f0c878', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(240,200,120,0.25)'; e.target.style.borderColor = '#f0c878'; }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(240,200,120,0.06)'; e.target.style.borderColor = 'rgba(240,200,120,0.3)'; }}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{scratchCount} card{scratchCount > 1 ? 's' : ''} → {scratchCount * 2} photo slots</span>
                      <button onClick={() => setScratchCount(0)} style={{ fontSize: '0.75rem', color: '#f0c878', background: 'none', border: '1px solid rgba(240,200,120,0.3)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>✎ Change count</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {Array.from({ length: scratchCount }, (_, i) => i + 1).map(id => {
                        const origPreview = scratchFiles[id] ? URL.createObjectURL(scratchFiles[id]) : scratchUrls[id];
                        const ghibliPreview = scratchGhibliFiles[id] ? URL.createObjectURL(scratchGhibliFiles[id]) : scratchGhibliUrls[id];
                        const bothUploaded = !!(origPreview && ghibliPreview);
                        return (
                          <div key={`scr-pair-${id}`} style={{ background: 'rgba(255,255,255,0.02)', border: bothUploaded ? '1px solid rgba(179,157,219,0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                              <span style={{ fontSize: '1rem' }}>⭐</span>
                              <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>Card #{id}</span>
                              {bothUploaded && <span style={{ fontSize: '0.75rem', color: '#7dca8c', marginLeft: 'auto' }}>✓ Both photos ready</span>}
                              {origPreview && !ghibliPreview && <span style={{ fontSize: '0.75rem', color: '#f0c878', marginLeft: 'auto' }}>⚠ Ghibli art missing</span>}
                              {!origPreview && ghibliPreview && <span style={{ fontSize: '0.75rem', color: '#f0c878', marginLeft: 'auto' }}>⚠ Original photo missing</span>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#b39ddb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📷 Original Photo</span>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Shown under scratch surface</span>
                                {origPreview
                                  ? <img style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(179,157,219,0.3)' }} src={origPreview} alt={`Card ${id} original`} />
                                  : <div style={{ width: '110px', height: '110px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📷</div>
                                }
                                <input key={scratchFiles[id] ? `scr-orig-has-${id}` : `scr-orig-no-${id}`} type="file" id={`scratch-orig-${id}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => setScratchFiles(prev => ({ ...prev, [id]: e.target.files[0] }))} />
                                <label htmlFor={`scratch-orig-${id}`} className="ch-btn-upload" style={{ fontSize: '0.75rem', padding: '5px 10px', width: '100%' }}>
                                  {scratchFiles[id] ? '✓ Changed' : scratchUrls[id] ? '✎ Replace' : '+ Choose'}
                                </label>
                                {origPreview && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScratchFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
                                      setScratchUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
                                    }}
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#ff7070',
                                      background: 'rgba(255, 112, 112, 0.1)',
                                      border: '1px solid rgba(255, 112, 112, 0.3)',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      width: '100%',
                                      marginTop: '2px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                                    onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                                  >
                                    ✕ Remove
                                  </button>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#f0c878', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Ghibli Art</span>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Revealed after magic tap</span>
                                {ghibliPreview
                                  ? <img style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(240,200,120,0.3)' }} src={ghibliPreview} alt={`Card ${id} ghibli`} />
                                  : <div style={{ width: '110px', height: '110px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(240,200,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎨</div>
                                }
                                <input key={scratchGhibliFiles[id] ? `scr-ghib-has-${id}` : `scr-ghib-no-${id}`} type="file" id={`scratch-ghibli-${id}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => setScratchGhibliFiles(prev => ({ ...prev, [id]: e.target.files[0] }))} />
                                <label htmlFor={`scratch-ghibli-${id}`} className="ch-btn-upload" style={{ fontSize: '0.75rem', padding: '5px 10px', width: '100%', borderColor: 'rgba(240,200,120,0.3)' }}>
                                  {scratchGhibliFiles[id] ? '✓ Changed' : scratchGhibliUrls[id] ? '✎ Replace' : '+ Choose'}
                                </label>
                                {ghibliPreview && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScratchGhibliFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
                                      setScratchGhibliUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
                                    }}
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#ff7070',
                                      background: 'rgba(255, 112, 112, 0.1)',
                                      border: '1px solid rgba(255, 112, 112, 0.3)',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      width: '100%',
                                      marginTop: '2px',
                                      borderColor: 'rgba(255, 112, 112, 0.3)',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.2)'; }}
                                    onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 112, 112, 0.1)'; }}
                                  >
                                    ✕ Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        )}

        {/* STEP 6: Completion Page & Links */}
        {step === 6 && successGiftId && (() => {
          const giftShortUrl = `${window.location.origin}/gift/${passcode || successGiftId}`;
          const monitoringUrl = `${window.location.origin}/gift/${successGiftId}/your`;
          return (
            <div className="ch-success-box">
              <div className="ch-success-icon">🎉</div>
              <h2 className="ch-success-title">Your Memory Vault is Ready!</h2>
              <p className="ch-success-desc">
                The configurations have been stored successfully. Copy the shareable experience URL for your friend, and keep the your link safe to track their activity.
              </p>

              <div className="ch-success-links">
                <div className="ch-success-link-item">
                  <span className="ch-success-link-lbl">🎁 Gift URL (Send to friend)</span>
                  <div className="ch-success-link-row">
                    <span className="ch-success-link-val">{giftShortUrl}</span>
                    <button className="db-copy-btn" onClick={() => handleCopyLink(giftShortUrl, 'gift', 'Gift Link')}>
                      {copiedLinkType === 'gift' ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  {passcode && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px', textAlign: 'left' }}>
                      🔑 Gift Code / Passcode: <strong style={{ color: '#38bdf8' }}>{passcode}</strong>
                    </div>
                  )}
                </div>
                <div className="ch-success-link-item">
                  <span className="ch-success-link-lbl">📊 your Dashboard (Real-time logs)</span>
                  <div className="ch-success-link-row">
                    <span className="ch-success-link-val">{monitoringUrl}</span>
                    <button className="db-copy-btn" onClick={() => handleCopyLink(monitoringUrl, 'your', 'your Link')}>
                      {copiedLinkType === 'your' ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <button className="ch-btn-finish" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          );
        })()}

        {/* Navigation Actions Footer */}
        {step < 6 && (
          <footer className="ch-form-footer">
            {step > 1 ? (
              <button className="ch-btn-prev" onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : (
              <button className="ch-btn-prev" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            )}

            {step < maxStep ? (
              <button className="ch-btn-next" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="ch-btn-next" onClick={handleGenerate} disabled={saving}>
                {saving ? 'Sealing & Generating...' : editId ? 'Save Changes ✦' : 'Create Vault ✦'}
              </button>
            )}
          </footer>
        )}

      </div>
    </div>
  );
}
