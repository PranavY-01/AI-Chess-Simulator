/**
 * MagicBento — Interactive animated feature grid with GSAP effects.
 *
 * Effects:
 *  - Spotlight radial gradient follows mouse per-card
 *  - Subtle 3D tilt / magnetism on hover
 *  - Floating particles on hover
 *  - Click ripple
 *  - All effects auto-disabled on mobile / reduced-motion
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './MagicBento.css';

/* ---- Feature data ---- */
interface BentoFeature {
  id: string;
  icon: string;
  name: string;
  desc: string;
  iconClass: string;
}

const FEATURES: BentoFeature[] = [
  {
    id: 'analysis',
    icon: '♟',
    name: 'Move Analysis',
    desc: 'Evaluate every candidate move with depth-limited search and surface the top alternatives.',
    iconClass: 'bento-card__icon--analysis',
  },
  {
    id: 'evaluation',
    icon: '⚖',
    name: 'Board Evaluation',
    desc: 'Quantify material, positional, and king-safety factors into a single centipawn score.',
    iconClass: 'bento-card__icon--evaluation',
  },
  {
    id: 'threat',
    icon: '⚠',
    name: 'Threat Detection',
    desc: 'Identify tactical threats like forks, pins, skewers, and discovered attacks in real time.',
    iconClass: 'bento-card__icon--threat',
  },
  {
    id: 'strategy',
    icon: '♞',
    name: 'Strategy Engine',
    desc: 'Alpha-beta pruning, advanced heuristics, and iterative deepening working together.',
    iconClass: 'bento-card__icon--strategy',
  },
  {
    id: 'suggestions',
    icon: '💡',
    name: 'AI Suggestions',
    desc: 'On-demand move recommendations with reasoning explanations from the AI companion.',
    iconClass: 'bento-card__icon--suggestions',
  },
  {
    id: 'insights',
    icon: '📊',
    name: 'Game Insights',
    desc: 'Post-game analytics — accuracy, blunder count, and win-probability graphs.',
    iconClass: 'bento-card__icon--insights',
  },
];

/* ---- Particle count per card ---- */
const PARTICLE_COUNT = 6;

/* ---- Helpers ---- */
function isMobile(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---- Component ---- */
const MagicBento: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; cardIdx: number }[]>(
    [],
  );
  const rippleId = useRef(0);
  const particleTweens = useRef<gsap.core.Tween[]>([]);

  /* ---- Tilt + Spotlight ---- */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, cardEl: HTMLDivElement) => {
      if (isMobile()) return;

      const rect = cardEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = ((y - cy) / cy) * -4;
      const tiltY = ((x - cx) / cx) * 4;

      gsap.to(cardEl, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Update spotlight
      const spotlight = cardEl.querySelector<HTMLDivElement>('.bento-card__spotlight');
      if (spotlight) {
        spotlight.style.background = `radial-gradient(circle 160px at ${x}px ${y}px, rgba(118,150,86,0.12), transparent 70%)`;
      }
    },
    [],
  );

  const handleMouseLeave = useCallback((cardEl: HTMLDivElement) => {
    gsap.to(cardEl, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, []);

  /* ---- Particles on hover ---- */
  const handleMouseEnter = useCallback((cardEl: HTMLDivElement) => {
    if (isMobile()) return;
    const particles = cardEl.querySelectorAll<HTMLSpanElement>('.bento-card__particle');
    particles.forEach((p) => {
      const tween = gsap.fromTo(
        p,
        {
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          opacity: 0,
          scale: 0,
        },
        {
          x: `+=${Math.random() * 60 - 30}`,
          y: `+=${Math.random() * 60 - 30}`,
          opacity: 0.5,
          scale: 1 + Math.random(),
          duration: 1.2 + Math.random() * 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 0.5,
        },
      );
      particleTweens.current.push(tween);
    });
  }, []);

  const handleParticleLeave = useCallback(() => {
    particleTweens.current.forEach((t) => t.kill());
    particleTweens.current = [];
  }, []);

  /* ---- Click Ripple ---- */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, cardIdx: number) => {
      if (isMobile()) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++rippleId.current;
      setRipples((prev) => [...prev, { id, x, y, cardIdx }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    },
    [],
  );

  /* ---- Entrance animation ---- */
  useEffect(() => {
    if (isMobile() || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLDivElement>('.bento-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      },
    );
  }, []);

  return (
    <div className="magic-bento">
      <div className="magic-bento__title">✦ AI Capabilities</div>

      <div className="magic-bento__grid" ref={gridRef} style={{ perspective: '800px' }}>
        {FEATURES.map((f, i) => (
          <div
            key={f.id}
            className="bento-card"
            style={{ transformStyle: 'preserve-3d' }}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget as HTMLDivElement)}
            onMouseLeave={(e) => {
              handleMouseLeave(e.currentTarget as HTMLDivElement);
              handleParticleLeave();
            }}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget as HTMLDivElement)}
            onClick={(e) => handleClick(e, i)}
          >
            {/* Spotlight overlay */}
            <div className="bento-card__spotlight" />

            {/* Particles */}
            <div className="bento-card__particles">
              {Array.from({ length: PARTICLE_COUNT }).map((_, pi) => (
                <span key={pi} className="bento-card__particle" />
              ))}
            </div>

            {/* Ripples */}
            {ripples
              .filter((r) => r.cardIdx === i)
              .map((r) => (
                <span
                  key={r.id}
                  className="bento-card__ripple"
                  style={{
                    left: r.x - 40,
                    top: r.y - 40,
                    width: 80,
                    height: 80,
                  }}
                />
              ))}

            {/* Content */}
            <div className={`bento-card__icon ${f.iconClass}`}>{f.icon}</div>
            <div className="bento-card__name">{f.name}</div>
            <div className="bento-card__desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MagicBento;
