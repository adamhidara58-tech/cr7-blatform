import { useState, useRef, useEffect, useCallback } from "react";

const MAX_DURATION = 3500;

export const SplashVideo = ({ onComplete }: { onComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"in" | "play" | "out">("in");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const startFadeOut = useCallback(() => {
    if (phase === "out") return;
    setPhase("out");
    setTimeout(onComplete, 600);
  }, [onComplete, phase]);

  useEffect(() => {
    // Max duration safety
    timerRef.current = setTimeout(startFadeOut, MAX_DURATION);
    // Fade in
    requestAnimationFrame(() => setPhase("play"));
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "in" ? 0 : phase === "out" ? 0 : 1,
        transition: phase === "in" ? "opacity 0.4s ease-in" : "opacity 0.5s ease-out",
      }}
    >
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={startFadeOut}
        onError={startFadeOut}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: phase === "play" ? "scale(1)" : "scale(1.05)",
          transition: "transform 3s ease-out",
        }}
      />
    </div>
  );
};
