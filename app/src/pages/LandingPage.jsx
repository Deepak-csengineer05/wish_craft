import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import './LandingPage.css';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    setPasscodeError('');
    const code = enteredPasscode.trim().toUpperCase();
    if (!code) {
      setPasscodeError('Please enter a passcode.');
      return;
    }

    setPasscodeLoading(true);
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('id, passcode')
        .eq('passcode', code)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        navigate(`/gift/${code}`);
      } else {
        setPasscodeError('We could not find a memory vault matching this code. Please double-check.');
      }
    } catch (err) {
      console.error('Error checking passcode:', err);
      setPasscodeError('Connection error. Please try again.');
    } finally {
      setPasscodeLoading(false);
    }
  };

  // Scroll animation template
  const cardScrollVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
    }
  };

  const headerScrollVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  return (
    <div className="lp-root">
      {/* Visual background elements */}
      <div className="lp-glow-1" />
      <div className="lp-glow-2" />

      <div className="lp-hero-screen">
        {/* Navigation header */}
        <nav className="lp-nav">
          <motion.div 
            className="lp-logo" 
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Wish Craft
          </motion.div>
          <motion.div 
            className="lp-nav-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {user ? (
              <button className="lp-btn-secondary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            ) : (
              <button className="lp-btn-secondary" onClick={() => navigate('/auth')}>
                Sign In
              </button>
            )}
          </motion.div>
        </nav>

        {/* Hero section */}
        <main className="lp-hero">
          <motion.h1 
            className="lp-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Turn your memories into 
            <strong>A Magical Journey.</strong>
          </motion.h1>
          <motion.p 
            className="lp-desc"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Craft a premium, fully customized 3D experience for your best friend's birthday. Customize sections, select any color theme, upload photos, and track their reactions in real-time.
          </motion.p>

          <motion.div 
            className="lp-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <button className="lp-btn-primary" onClick={handleCTA}>
              {user ? 'Go to Dashboard' : 'Get Started — It\'s Free'} <span>✦</span>
            </button>
            <button className="lp-btn-secondary" onClick={() => {
              const section = document.getElementById('features-section');
              section?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Features
            </button>
          </motion.div>

          <motion.div 
            className="lp-passcode-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="lp-passcode-divider">
              <span>OR</span>
            </div>
            <div className="lp-passcode-card">
              <h3 className="lp-passcode-title">🌙 Unseal a Memory Vault</h3>
              <p className="lp-passcode-subtitle">Received a secret code? Enter it below to begin the magical journey.</p>
              <form onSubmit={handlePasscodeSubmit} className="lp-passcode-form">
                <input
                  type="text"
                  placeholder="ENTER GIFT CODE"
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  className="lp-passcode-input"
                />
                <button type="submit" className="lp-passcode-btn" disabled={passcodeLoading}>
                  {passcodeLoading ? 'Casting Magic...' : '✦ Cast Magic'}
                </button>
              </form>
              {passcodeError && <div className="lp-passcode-error">⚠️ {passcodeError}</div>}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Features Header */}
      <motion.div
        className="lp-features-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={headerScrollVariant}
      >
        <h2 className="lp-section-title">11 Memory Chapters</h2>
        <p className="lp-section-desc">Fully customizable interactive stages built for your best friend</p>
      </motion.div>

      {/* Features Grid */}
      <section id="features-section" className="lp-features">
        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">🔑</div>
          <h3 className="lp-feat-title">01. Password Gate</h3>
          <p className="lp-feat-desc">
            A secure greeting screen requiring a personalized secret passcode to unlock the experience.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">⏳</div>
          <h3 className="lp-feat-title">02. Birthday Countdown</h3>
          <p className="lp-feat-desc">
            A gorgeous live countdown display ticking down to the millisecond, building anticipation.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">💬</div>
          <h3 className="lp-feat-title">03. Chat Simulator</h3>
          <p className="lp-feat-desc">
            A simulated text conversation detailing midnight wishes, custom responses, and warm logs.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">🎁</div>
          <h3 className="lp-feat-title">04. 3D Gift Boxes</h3>
          <p className="lp-feat-desc">
            Five interactive 3D boxes that open on click to reveal personalized wishes, secrets, and surprises.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">🎂</div>
          <h3 className="lp-feat-title">05. 3D Cake & Candles</h3>
          <p className="lp-feat-desc">
            An interactive 3D birthday cake where they tap to blow out glowing candles one by one.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">🧩</div>
          <h3 className="lp-feat-title">06. Friend Word Search</h3>
          <p className="lp-feat-desc">
            A custom word puzzle built around inside jokes, locations, and traits unique to your friendship.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">🖼️</div>
          <h3 className="lp-feat-title">07. Magical Scratch Orbit</h3>
          <p className="lp-feat-desc">
            A rotating 3D galaxy orbit of star cards. Tapping them enters scratch mode to reveal custom photos.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">📖</div>
          <h3 className="lp-feat-title">08. Flip Book Diary</h3>
          <p className="lp-feat-desc">
            A 3D cassette mixtape playing music alongside a realistic turning-page diary filled with memories.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">💖</div>
          <h3 className="lp-feat-title">09. Polaroid Wish Grid</h3>
          <p className="lp-feat-desc">
            A gallery of beautifully styled polaroid cards that flip over to show custom letters and memory details.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">❓</div>
          <h3 className="lp-feat-title">10. Fun Q&A Feed</h3>
          <p className="lp-feat-desc">
            A custom question-and-answer session capturing their choices and logging responses for you in real-time.
          </p>
        </motion.div>

        <motion.div 
          className="lp-feat-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={cardScrollVariant}
        >
          <div className="lp-feat-icon">✉️</div>
          <h3 className="lp-feat-title">11. Heartfelt Envelope Letter</h3>
          <p className="lp-feat-desc">
            An elegant final seal-breaking animation revealing a fully custom, scrollable birthday wish letter.
          </p>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="lp-how-it-works">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={headerScrollVariant}
        >
          <h2 className="lp-section-title">How It Works</h2>
          <p className="lp-section-desc">Create a customized, premium 3D experience in 4 simple steps</p>
        </motion.div>

        <div className="lp-steps-grid">
          <motion.div 
            className="lp-step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={cardScrollVariant}
          >
            <div className="lp-step-number">01</div>
            <div className="lp-step-icon">🔑</div>
            <h3 className="lp-step-title">Sign Up & Create</h3>
            <p className="lp-step-desc">
              Register a creator account in seconds and initialize a private gift container for your friend.
            </p>
          </motion.div>

          <motion.div 
            className="lp-step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={cardScrollVariant}
          >
            <div className="lp-step-number">02</div>
            <div className="lp-step-icon">🎨</div>
            <h3 className="lp-step-title">Choose Theme & Color</h3>
            <p className="lp-step-desc">
              Toggle any of the 11 memories on/off and select their favorite color using our auto-harmonizing HSL slider.
            </p>
          </motion.div>

          <motion.div 
            className="lp-step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={cardScrollVariant}
          >
            <div className="lp-step-number">03</div>
            <div className="lp-step-icon">🖼️</div>
            <h3 className="lp-step-title">Personalize & Upload</h3>
            <p className="lp-step-desc">
              Write custom messages, configure chat dialogs, and upload drag-and-drop polaroid memory images.
            </p>
          </motion.div>

          <motion.div 
            className="lp-step-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={cardScrollVariant}
          >
            <div className="lp-step-number">04</div>
            <div className="lp-step-icon">📈</div>
            <h3 className="lp-step-title">Share & Log Reactions</h3>
            <p className="lp-step-desc">
              Send them the secure password link and watch their failed entries, puzzle timestamps, and replies in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div>© 2026 Wish Craft. Made with 💜 for memorable bonds.</div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/auth')}>Auth Portal</span>
          <span>·</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
        </div>
      </footer>
    </div>
  );
}
