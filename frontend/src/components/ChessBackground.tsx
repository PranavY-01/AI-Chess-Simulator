/**
 * ChessBackground — immersive, chess-themed animated backdrop.
 * Renders behind the entire app via position:fixed; never interferes with interaction.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ChessBackground.css';

const PIECE_SILHOUETTES = ['♔', '♕', '♖', '♗', '♘', '♚', '♛', '♜', '♝', '♞'];

interface FloatingPiece {
  symbol: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generatePieces(count: number): FloatingPiece[] {
  return Array.from({ length: count }, () => ({
    symbol: PIECE_SILHOUETTES[Math.floor(Math.random() * PIECE_SILHOUETTES.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 10,
    duration: 18 + Math.random() * 20,
  }));
}

const ChessBackground: React.FC = () => {
  const piecesRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const floatingPieces = React.useMemo(
    () => (isMobile ? [] : generatePieces(8)),
    [isMobile],
  );

  useEffect(() => {
    if (isMobile || !piecesRef.current) return;
    const els = piecesRef.current.querySelectorAll<HTMLSpanElement>('.chess-bg__piece');

    const tweens = Array.from(els).map((el, i) => {
      const p = floatingPieces[i];
      return gsap.fromTo(
        el,
        { opacity: 0, y: 40, rotate: -15 + Math.random() * 30 },
        {
          opacity: 0.08,
          y: -40,
          rotate: 15 - Math.random() * 30,
          duration: p.duration,
          delay: p.delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        },
      );
    });

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [floatingPieces, isMobile]);

  return (
    <div className="chess-bg" aria-hidden="true">
      <div className="chess-bg__gradient" />
      <div className="chess-bg__grid" />

      {/* Floating blurred orbs */}
      <div className="chess-bg__orb chess-bg__orb--1" />
      <div className="chess-bg__orb chess-bg__orb--2" />
      <div className="chess-bg__orb chess-bg__orb--3" />

      {/* Floating chess-piece silhouettes */}
      <div className="chess-bg__pieces" ref={piecesRef}>
        {floatingPieces.map((p, i) => (
          <span
            key={i}
            className="chess-bg__piece"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}rem`,
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ChessBackground;
