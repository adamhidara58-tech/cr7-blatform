import { useState, useEffect, useCallback } from 'react';
import logoImg from '@/assets/logo-new.webp';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F5E0A3';

const particles = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 7919;
  return {
    x: (seed * 13) % 100,
    y: 50 + ((seed * 17) % 50),
    size: 2 + ((seed * 23) % 4),
    delay: ((seed * 3) % 20) * 0.1,
    duration: 2 + ((seed * 11) % 10) / 5,
    opacity: 0.15 + ((seed * 29) % 20) / 100,
  };
});

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<'active' | 'fadeOut' | 'done'>('active');

  const finish = useCallback(() => {
    setPhase('fadeOut');
    setTimeout(onFinish, 500);
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(finish, 2500);
    return () => clearTimeout(timer);
  }, [finish]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: '#050505',
        opacity: phase === 'fadeOut' ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 45%, ${GOLD}18 0%, transparent 70%),
            radial-gradient(ellipse 80% 50% at 30% 60%, ${GOLD}08 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 70% 40%, ${GOLD}06 0%, transparent 50%),
            linear-gradient(180deg, #050505 0%, #0A0A0A 50%, #050505 100%)
          `,
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${GOLD_LIGHT}, transparent)`,
            opacity: 0,
            boxShadow: `0 0 ${p.size * 2}px ${GOLD}40`,
            animation: `splashParticle ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}

      {/* Expanding ring 1 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          border: `1px solid ${GOLD}`,
          opacity: 0,
          animation: 'splashRing 2s ease-out 0.5s forwards',
        }}
      />

      {/* Expanding ring 2 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          border: `1px solid ${GOLD}40`,
          opacity: 0,
          animation: 'splashRing 2.5s ease-out 0.8s forwards',
        }}
      />

      {/* Logo glow */}
      <div
        className="absolute"
        style={{
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${GOLD}25 0%, transparent 60%)`,
          filter: 'blur(30px)',
          opacity: 0,
          animation: 'splashFadeIn 1s ease-out 0.3s forwards',
        }}
      />

      {/* Logo */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 180,
          height: 180,
          borderRadius: 28,
          opacity: 0,
          transform: 'scale(0.7)',
          animation: 'splashLogoIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards',
        }}
      >
        <img
          src={logoImg}
          alt="SevenX"
          className="w-full h-full object-contain"
        />
        {/* Shine pass */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: '30%',
            background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT}30, transparent)`,
            transform: 'skewX(-15deg)',
            left: '-30%',
            animation: 'splashShine 1s ease-in-out 1s forwards',
          }}
        />
      </div>
    </div>
  );
};
