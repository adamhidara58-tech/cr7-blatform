import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Img, staticFile } from "remotion";
import React from "react";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5E0A3";
const BG_DARK = "#050505";
const BG_MID = "#0A0A0A";

const Particle: React.FC<{
  x: number; y: number; size: number; delay: number; speed: number; opacity: number;
}> = ({ x, y, size, delay, speed, opacity: maxOpacity }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [delay, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const yOffset = progress * speed * -150;
  const opacity = interpolate(frame, [delay, delay + 15, durationInFrames - 20, durationInFrames], [0, maxOpacity, maxOpacity, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = Math.sin(progress * Math.PI * 2 + x) * 20;

  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD}00)`,
      opacity,
      transform: `translate(${drift}px, ${yOffset}px)`,
      boxShadow: `0 0 ${size * 2}px ${GOLD}40`,
    }} />
  );
};

const generateParticles = (count: number) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 7919;
    particles.push({
      x: (seed * 13) % 100,
      y: 50 + ((seed * 17) % 50),
      size: 2 + ((seed * 23) % 4),
      delay: (seed * 3) % 30,
      speed: 0.3 + ((seed * 11) % 10) / 10,
      opacity: 0.15 + ((seed * 29) % 20) / 100,
    });
  }
  return particles;
};

const particles = generateParticles(40);

export const SplashScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Logo fade in + scale
  const logoSpring = spring({ frame: frame - 10, fps, config: { damping: 30, stiffness: 120, mass: 1.2 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1]);
  const logoOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulse
  const glowPulse = interpolate(frame, [20, 50, 80], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Shine pass over logo
  const shineX = interpolate(frame, [30, 60], [-100, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Fade out at end
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Background radial glow animation
  const bgGlow = interpolate(frame, [0, 45, 90], [0, 0.15, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Ring animation
  const ringScale = spring({ frame: frame - 20, fps, config: { damping: 25, stiffness: 80 } });
  const ringOpacity = interpolate(frame, [20, 40, 70, 90], [0, 0.3, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG_DARK, opacity: fadeOut }}>
      {/* Background gradient */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 45%, ${GOLD}${Math.round(bgGlow * 255).toString(16).padStart(2, '0')} 0%, transparent 70%),
          radial-gradient(ellipse 80% 50% at 30% 60%, ${GOLD}08 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 70% 40%, ${GOLD}06 0%, transparent 50%),
          linear-gradient(180deg, ${BG_DARK} 0%, ${BG_MID} 50%, ${BG_DARK} 100%)
        `,
      }} />

      {/* Particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Ring effect */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        border: `1px solid ${GOLD}`,
        transform: `translate(-50%, -50%) scale(${interpolate(ringScale, [0, 1], [0.5, 1.3])})`,
        opacity: ringOpacity,
        boxShadow: `0 0 40px ${GOLD}20, inset 0 0 40px ${GOLD}10`,
      }} />

      {/* Second ring */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 650,
        height: 650,
        borderRadius: "50%",
        border: `1px solid ${GOLD}40`,
        transform: `translate(-50%, -50%) scale(${interpolate(spring({ frame: frame - 30, fps, config: { damping: 30, stiffness: 60 } }), [0, 1], [0.4, 1.2])})`,
        opacity: interpolate(frame, [30, 50, 75, 90], [0, 0.15, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />

      {/* Logo glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GOLD}${Math.round(glowPulse * 40).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
        filter: "blur(30px)",
      }} />

      {/* Logo container */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: logoOpacity,
        width: 320,
        height: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 40,
      }}>
        <Img
          src={staticFile("images/logo-512.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        {/* Shine pass */}
        <div style={{
          position: "absolute",
          top: 0,
          left: `${shineX}%`,
          width: "30%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT}30, transparent)`,
          transform: "skewX(-15deg)",
        }} />
      </div>
    </AbsoluteFill>
  );
};
