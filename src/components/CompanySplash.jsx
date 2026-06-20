import React, { useState, useEffect, useCallback } from 'react';

/* ══════════════════════════════════════════
   ✏️  EDIT ONLY THESE TWO LINES
══════════════════════════════════════════ */
const COMPANY_NAME = "TCS";
const COMPANY_LOGO = "https://vectorseek.com/wp-content/uploads/2023/08/TCS-Tata-Consultancy-Services-Logo-Vector.svg-.png";



/* ══════════════════════════════════════════
   COMPANY SPLASH SCREEN
   - Black & Gold theme (matches your portfolio)
   - Big centered logo + company name
   - No animations — clean, bold, still
   - Click anywhere on splash → goes fullscreen
   - Displays for 5 seconds then calls onDone()
   - DO NOT edit anything below this line
══════════════════════════════════════════ */
const CompanySplash = ({ onDone }) => {
  const [phase,      setPhase]      = useState(0);
  const [logoStatus, setLogoStatus] = useState('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Splash phases ──
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 100000);
    const t3 = setTimeout(() => onDone(),    6000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  // ── Pre-load logo image ──
  useEffect(() => {
    if (!COMPANY_LOGO) { setLogoStatus('error'); return; }
    const img = new Image();
    img.onload  = () => setLogoStatus(img.naturalWidth > 0 ? 'ok' : 'error');
    img.onerror = () => setLogoStatus('error');
    img.src = COMPANY_LOGO;
  }, []);

  // ── Track fullscreen state ──
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Fullscreen must be called directly from a user click ──
  const handleClick = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        const el = document.documentElement;
        if      (el.requestFullscreen)            await el.requestFullscreen();
        else if (el.webkitRequestFullscreen)       await el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen)          await el.mozRequestFullScreen();
        else if (el.msRequestFullscreen)           await el.msRequestFullscreen();
      } catch (err) {
        console.warn('[CompanySplash] Fullscreen error:', err.message);
      }
    }
  }, []);

  // ── Also try on first keydown (for desktop) ──
  useEffect(() => {
    const onKey = async (e) => {
      if (!document.fullscreenElement) {
        try {
          const el = document.documentElement;
          if (el.requestFullscreen) await el.requestFullscreen();
        } catch (_) {}
      }
    };
    window.addEventListener('keydown', onKey, { once: true });
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showImage = COMPANY_LOGO && logoStatus === 'ok';

  return (
    <div
      onClick={handleClick}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer
                  transition-opacity duration-[1200ms]
                  ${phase === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#000000' }}
    >

      {/* ── Subtle gold grid ── */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(234,179,8,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(234,179,8,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Top gold line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

      {/* ── Bottom gold line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

      {/* ── "Click for fullscreen" hint — disappears once fullscreen ── */}
      {!isFullscreen && phase >= 1 && (
        <div
          className="absolute bottom-10 flex items-center gap-2"
          style={{ animation: 'pulseFade 2s ease-in-out infinite' }}
        >
          <div className="w-1 h-1 rounded-full bg-yellow-600" />
          <p className="text-yellow-900 text-[10px] tracking-[0.4em] uppercase">
            Click anywhere for fullscreen
          </p>
          <div className="w-1 h-1 rounded-full bg-yellow-600" />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        className={`relative z-10 flex flex-col items-center gap-8
                    transition-all duration-700
                    ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >

        {/* Greeting label */}
        <p className="text-[11px] font-bold tracking-[0.6em] uppercase"
          style={{ color: '#d97706' }}>
          Welcome 
        </p>

        {/* ── Logo spinner while loading ── */}
        {logoStatus === 'loading' && COMPANY_LOGO && (
          <div style={{ height: '90px', width: '280px' }} className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-yellow-400 animate-spin" />
          </div>
        )}

        {/* ── Logo image ── */}
        {showImage && (
          <div className="flex items-center justify-center"
            style={{ minHeight: '90px', minWidth: '280px' }}>
            <img
              src={COMPANY_LOGO}
              alt={COMPANY_NAME}
              style={{
                height: '80px',
                maxWidth: '300px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* ── Company Name — always shown ── */}
        <h1
          className="font-black text-white text-center"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            letterSpacing: '-0.02em',
            textShadow: '0 0 60px rgba(234,179,8,0.25)',
          }}
        >
          {COMPANY_NAME}
        </h1>

        {/* Gold divider */}
        <div className="w-48 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

        {/* Subtitle */}
        <p className="text-zinc-500 text-xs tracking-[0.45em] uppercase">
           Recruitment Team
        </p>

        {/* Progress bar */}
        <div className="w-64 h-[2px] rounded-full overflow-hidden mt-2"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #92400e, #d97706, #fbbf24, #fde68a)',
              animation: 'splashBar 4s linear forwards',
              boxShadow: '0 0 8px rgba(234,179,8,0.5)',
            }}
          />
        </div>

        {/* Loading label */}
        <p className="text-zinc-700 text-[10px] tracking-[0.4em] uppercase">
          Loading Portfolio
        </p>

      </div>

      <style>{`
        @keyframes splashBar  { from { width: 0% } to { width: 100% } }
        @keyframes pulseFade  { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
      `}</style>
    </div>
  );
};

export default CompanySplash;