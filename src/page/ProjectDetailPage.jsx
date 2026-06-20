import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanySplash from '../components/CompanySplash';




/* ══════════════════════════════════════════
   ANIMATED BACKGROUND
══════════════════════════════════════════ */
const AnimatedBG = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(234,179,8,0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(234,179,8,0.8) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)', animation: 'floatOrb1 14s ease-in-out infinite' }} />
    <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)', animation: 'floatOrb2 18s ease-in-out infinite' }} />
    <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.03) 0%, transparent 70%)', animation: 'floatOrb3 10s ease-in-out infinite' }} />
    <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
      style={{ animation: 'scanLine 8s linear infinite' }} />
    <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent"
      style={{ animation: 'scanLine 11s linear infinite', animationDelay: '3.5s' }} />
    <div className="absolute top-[15%] left-[8%] w-[260px] h-[260px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 70%)', animation: 'floatOrb4 16s ease-in-out infinite' }} />
    <div className="absolute bottom-[-5%] right-[15%] w-[380px] h-[380px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 70%)', animation: 'floatOrb1 13s ease-in-out infinite reverse' }} />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="absolute rounded-full"
        style={{
          width: 3, height: 3,
          top: `${12 + i * 19}%`,
          left: `${10 + (i % 3) * 35}%`,
          background: '#fbbf24',
          boxShadow: '0 0 6px 1px rgba(234,179,8,0.6)',
          animation: `twinkle ${4 + i * 1.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }} />
    ))}
    <style>{`
      @keyframes floatOrb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,60px)} }
      @keyframes floatOrb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,-40px)} }
      @keyframes floatOrb3 { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-60px)} }
      @keyframes floatOrb4 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-30px) scale(1.15)} }
      @keyframes scanLine  { 0%{top:-2px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
      @keyframes twinkle   { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.6)} }
      @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    `}</style>
  </div>
);



/* ══════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════ */
const Particles = () => {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 10}s`,
    size: Math.random() > 0.5 ? 2 : 1,
    opacity: 0.15 + Math.random() * 0.25,
  }));
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-yellow-400"
          style={{ left: p.left, width: p.size, height: p.size, opacity: p.opacity, bottom: '-4px', animation: `particleRise ${p.duration} ${p.delay} linear infinite` }} />
      ))}
      <style>{`
        @keyframes particleRise {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};



/* ══════════════════════════════════════════
   FADE-IN WRAPPER
══════════════════════════════════════════ */
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}>
      {children}
    </div>
  );
};



/* ══════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════ */
const Card = ({ children, className = '', glow = false }) => (
  <div className={`relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 overflow-hidden
                   hover:border-yellow-500/50 transition-all duration-300
                   ${glow ? 'shadow-[0_0_30px_rgba(234,179,8,0.05)]' : ''}
                   ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
      <div className="h-full w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.7), transparent)', animation: 'borderSweep 6s linear infinite' }} />
    </div>
    {children}
    <style>{`@keyframes borderSweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
  </div>
);


const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-4 mb-7">
    <h2 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: '#f5e09a' }}>{title}</h2>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.3), transparent)' }} />
  </div>
);


const GoldTag = ({ children }) => (
  <span className="text-[11px] font-bold px-3 py-1 rounded-full tracking-wide whitespace-nowrap"
    style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#fbbf24' }}>
    {children}
  </span>
);


const ExternalBtn = ({ href, label, primary = false }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 group
        ${primary
          ? 'text-black hover:brightness-110'
          : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/60 hover:text-yellow-400 hover:bg-zinc-800'
        }`}
      style={primary ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(234,179,8,0.3)' } : {}}
    >
      {label}
      {primary && <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>}
    </a>
  ) : null;


const ReportCard = ({ href, label, tool, type }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="group flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.35)'; e.currentTarget.style.background = 'rgba(234,179,8,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-semibold text-zinc-200 group-hover:text-yellow-400 text-sm transition-colors">{label}</span>
          <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{type}</span>
        </div>
        <span className="text-xs text-zinc-600">{tool}</span>
        <p className="text-[11px] mt-1 transition-colors" style={{ color: '#92400e' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
          onMouseLeave={e => e.currentTarget.style.color = '#92400e'}>
          ↗ Open Report
        </p>
      </div>
    </a>
  ) : null;



/* ══════════════════════════════════════════
   BULLET TEXT RENDERER
══════════════════════════════════════════ */
const BulletText = ({ text, className = '' }) => {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const hasBullets = lines.some(l => l.trimStart().startsWith('• '));


  if (hasBullets) {
    return (
      <ul className={`space-y-1.5 min-w-0 ${className}`}>
        {lines.map((line, i) => {
          const content = line.trimStart().startsWith('• ')
            ? line.trimStart().slice(2)
            : line.trim();
          return (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400 leading-relaxed min-w-0">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
              <span className="break-words min-w-0 flex-1">{content}</span>
            </li>
          );
        })}
      </ul>
    );
  }


  return (
    <p className={`text-zinc-400 text-sm leading-relaxed break-words min-w-0 ${className}`}>
      {text}
    </p>
  );
};



/* ══════════════════════════════════════════
   ARCHITECTURE DIAGRAM
══════════════════════════════════════════ */
const ArchitectureDiagram = ({ url }) => {
  const [status, setStatus] = useState('loading');


  const resolveDriveUrl = (raw) => {
    if (!raw) return null;
    const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w2000`;
    const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w2000`;
    return raw;
  };


  const src = resolveDriveUrl(url);
  if (!src) return null;


  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.08) 0%, transparent 75%)', animation: 'videoGlow 5s ease-in-out infinite' }} />
      <div className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ minHeight: '260px', background: status !== 'ok' ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 border-r-yellow-400/40 animate-spin" />
              </div>
              <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase">Loading diagram</p>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <p className="text-zinc-500 text-sm text-center">Could not load diagram.</p>
            <p className="text-zinc-600 text-xs text-center">
              Make sure the file is shared as <span className="text-yellow-600">"Anyone with the link"</span> in Google Drive.
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-xl font-bold transition-all duration-200"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#fbbf24' }}>
              Open in Google Drive ↗
            </a>
          </div>
        )}
        <img
          src={src}
          alt="System architecture diagram"
          className="w-full object-contain cursor-zoom-in transition-all duration-300 hover:brightness-110"
          style={{
            maxHeight: '720px',
            display: status === 'error' ? 'none' : 'block',
            opacity: status === 'ok' ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
        />
      </div>
      <style>{`@keyframes videoGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
};



/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const ProjectDetailPage = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [project,    setProject]    = useState(null);
  const [content,    setContent]    = useState(null);
  const [error,      setError]      = useState(null);


  useEffect(() => { fetchProject(); }, [slug]);


  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/projects/slug/${slug}`);
      setProject(res.data.project);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
      setError('not found');
    } finally {
      setLoading(false);
    }
  };


  const getEmbedUrl = (url) => {
    if (!url) return null;
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/, /youtube\.com\/embed\/([^&\s]+)/];
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
    return url.includes('youtube.com/embed/') ? url : null;
  };


  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>

      {/* Force black on html/body so no parent layout/router wrapper can show white
          behind or below this page, regardless of where it's mounted. */}
      <style>{`
        html, body, #root {
          background: #000000 !important;
        }
      `}</style>

      {/* Splash sits on top (z-50), fades out after 5s */}
      {!splashDone && <CompanySplash onDone={() => setSplashDone(true)} />}

      <div
        className="min-h-screen text-zinc-300 font-sans relative"
        style={{
          background: '#000000',
          opacity: splashDone ? 1 : 0,
          transition: 'opacity 700ms ease',
        }}
      >
        <AnimatedBG />
        <Particles />


        {/* ── LOADING ── */}
        {loading && (
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 border-r-yellow-400/40 animate-spin" />
              </div>
              <p className="text-xs text-zinc-600 tracking-[0.35em]">LOADING PROJECT</p>
            </div>
          </div>
        )}


        {/* ── ERROR ── */}
        {!loading && (error || !project) && (
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center bg-zinc-900/80 border border-zinc-800 rounded-2xl p-14 backdrop-blur-sm">
              <div className="text-8xl font-black text-zinc-800 mb-3">404</div>
              <p className="text-zinc-500 mb-7 text-sm">This project doesn't exist.</p>
              <button onClick={() => navigate('/home')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-black hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(234,179,8,0.3)' }}>
                ← Portfolio
              </button>
            </div>
          </div>
        )}


        {!loading && project && (
          <div className="relative z-10">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">


              {/* 1. HERO — What is this project? */}
              <FadeIn>
                <div className="relative rounded-2xl overflow-hidden p-8 sm:p-14"
                  style={{
                    background: 'linear-gradient(135deg, #0d0d0d 0%, #111111 50%, #0a0a0a 100%)',
                    border: '1px solid rgba(234,179,8,0.2)',
                    boxShadow: '0 0 60px rgba(234,179,8,0.05), inset 0 0 60px rgba(234,179,8,0.02)',
                  }}>
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 70%)', animation: 'floatOrb1 12s ease-in-out infinite' }} />
                  <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 70%)', animation: 'floatOrb2 16s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 right-10 w-44 h-44 rounded-full border border-yellow-400/10 pointer-events-none hidden sm:block"
                    style={{ marginTop: '-88px', animation: 'spin 24s linear infinite' }} />
                  <div className="absolute top-1/2 right-10 w-28 h-28 rounded-full border border-yellow-400/10 pointer-events-none hidden sm:block"
                    style={{ marginTop: '-56px', animation: 'spin 18s linear infinite reverse' }} />
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
                  <div className="relative flex flex-wrap items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-1.5 h-7 rounded-full" style={{ background: 'linear-gradient(180deg,#fbbf24,#d97706)' }} />
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: '#d97706' }}>Project Showcase</p>
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
                        style={{ textShadow: '0 0 40px rgba(234,179,8,0.1)' }}>
                        {project.projectName}
                      </h1>
                      {project.tagline && (
                        <p className="text-zinc-400 text-base leading-relaxed max-w-xl">{project.tagline}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {project.category && <GoldTag>{project.category}</GoldTag>}
                      {project.status && (
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full tracking-wide"
                          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                          {project.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>


              {/* 2. PROBLEM & SOLUTION — Why was it built? */}
              {content?.problemStatement && (
                content.problemStatement.problemText || content.problemStatement.solutionText
              ) && (
                <FadeIn delay={100}>
                  <Card glow>
                    <SectionTitle title="Problem & Solution" />
                    <div className="flex flex-col gap-4">
                      {content.problemStatement.problemText && (
                        <div className="rounded-xl p-5 min-w-0"
                          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full bg-red-500 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-red-400 tracking-[0.3em] uppercase">The Problem</p>
                          </div>
                          <BulletText text={content.problemStatement.problemText} />
                        </div>
                      )}
                      {content.problemStatement.solutionText && (
                        <div className="rounded-xl p-5 min-w-0"
                          style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)' }}>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
                            <p className="text-[10px] font-bold text-yellow-400 tracking-[0.3em] uppercase">The Solution</p>
                          </div>
                          <BulletText text={content.problemStatement.solutionText} />
                        </div>
                      )}
                    </div>
                  </Card>
                </FadeIn>
              )}


              {/* 3. ARCHITECTURE — How is it designed? */}
              {content?.architecture && (
                content.architecture.diagramUrl || content.architecture.components?.length > 0
              ) && (
                <FadeIn delay={100}>
                  <Card glow>
                    <SectionTitle title="System Architecture" />
                    {content.architecture.components?.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold text-zinc-600 tracking-[0.35em] uppercase mb-4">Components</p>
                        <div className="flex flex-wrap gap-2">
                          {content.architecture.components.map((comp, i) => (
                            <span key={i}
                              className="text-sm px-4 py-1.5 rounded-full transition-all duration-200 cursor-default"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.4)'; e.currentTarget.style.color = '#fbbf24'; e.currentTarget.style.background = 'rgba(234,179,8,0.06)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    {content.architecture.diagramUrl && (
                      <div className={content.architecture.components?.length > 0 ? 'mt-6' : ''}>
                        <ArchitectureDiagram url={content.architecture.diagramUrl} />
                      </div>
                    )}
                  </Card>
                </FadeIn>
              )}


              {/* 4. TECH STACK — What was it built with? */}
              {content?.techStack?.length > 0 && (
                <FadeIn delay={100}>
                  <Card glow>
                    <SectionTitle title="Tech Stack" />
                    <div className="flex flex-col gap-3">
                      {content.techStack.map((tech, i) => (
                        <FadeIn key={i} delay={i * 50}>
                          <div
                            className="group rounded-xl p-5 transition-all duration-200 cursor-default w-full min-w-0"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.35)'; e.currentTarget.style.background = 'rgba(234,179,8,0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                          >
                            <div className="flex items-center justify-between gap-3 min-w-0 mb-3">
                              <h3 className="font-bold text-white text-sm break-words min-w-0 flex-1">{tech.name}</h3>
                              <div className="flex-shrink-0"><GoldTag>{tech.category}</GoldTag></div>
                            </div>
                            {tech.justification && <BulletText text={tech.justification} className="mb-3" />}
                            {tech.alternativesConsidered && (
                              <div className="border-t pt-3 mt-1 min-w-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-[10px] font-bold text-zinc-600 tracking-[0.25em] uppercase mb-2">Alternatives</p>
                                <BulletText text={tech.alternativesConsidered} />
                              </div>
                            )}
                          </div>
                        </FadeIn>
                      ))}
                    </div>
                  </Card>
                </FadeIn>
              )}


              {/* 5. QUICK LINKS — Try it yourself (right after Tech Stack) */}
              {content?.demo && (content.demo.liveUrl || content.demo.githubUrl || content.demo.videoUrl) && (
                <FadeIn delay={100}>
                  <div className="flex flex-col gap-3">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <ExternalBtn href={content.demo.liveUrl}   label="Live Demo"   primary />
                      <ExternalBtn href={content.demo.githubUrl} label="GitHub Repo" />
                      <ExternalBtn href={content.demo.videoUrl}  label="Demo Video"  />
                    </div>

                    {/* Credential hint — only show if liveUrl exists */}
                    {content.demo.liveUrl && (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl"
                        style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)' }}>
                        <p style={{ color: '#71717a', fontSize: '0.8rem', letterSpacing: '0.03em' }}>
                          Test credentials are{' '}
                          <span style={{ color: '#fbbf24', fontWeight: 700 }}>auto-filled</span>
                          {' '}on the Live Demo page.
                        </p>
                      </div>
                    )}

                  </div>
                </FadeIn>
              )}


              {/* 6. TESTING & SECURITY — Proof of quality */}
              {content?.testing && Object.values(content.testing).some(Boolean) && (
                <FadeIn delay={100}>
                  <Card glow>
                    <SectionTitle title="Testing & Security Reports" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ReportCard href={content.testing.unitReportUrl}        label="Unit Tests"        tool="Jest + Codecov"   type="Coverage"    />
                      <ReportCard href={content.testing.integrationReportUrl} label="Integration Tests" tool="Supertest + Jest"  type="Coverage"    />
                      <ReportCard href={content.testing.e2eReportUrl}         label="E2E Tests"         tool="Playwright"        type="HTML Report" />
                      <ReportCard href={content.testing.sastReportUrl}        label="SAST Analysis"     tool="SonarCloud"        type="Static"      />
                      <ReportCard href={content.testing.dastReportUrl}        label="DAST Security"     tool="OWASP ZAP"         type="Dynamic"     />
                      <ReportCard href={content.testing.loadTestReportUrl}    label="Load Testing"      tool="k6"                type="Performance" />
                    </div>
                  </Card>
                </FadeIn>
              )}


              {/* 7. VIDEO — See it in action (last) */}
              {getEmbedUrl(content?.demo?.videoUrl) && (
                <FadeIn delay={150}>
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-3xl pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.10) 0%, transparent 75%)', animation: 'videoGlow 5s ease-in-out infinite' }} />
                    <div className="relative w-full rounded-2xl overflow-hidden"
                      style={{ background: '#000000', aspectRatio: '16 / 9', minHeight: '200px' }}>
                      <iframe src={getEmbedUrl(content.demo.videoUrl)} title="Project demo" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen className="w-full h-full"
                        style={{ background: '#000000', display: 'block', border: 'none' }} />
                    </div>
                  </div>
                  <style>{`@keyframes videoGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
                </FadeIn>
              )}

            </main>
          </div>
        )}
      </div>
    </div>
  );
};


export default ProjectDetailPage;