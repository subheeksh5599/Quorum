"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface HyperFrame {
  id: number;
  text: string;
  opacity: number;
  x: number;
  y: number;
}

interface HyperframesOptions {
  totalFrames: number;
  duration: number;
  autoPlay: boolean;
  onComplete?: () => void;
}

export function useHyperframes({
  totalFrames,
  duration,
  autoPlay,
  onComplete,
}: HyperframesOptions) {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const frameDuration = duration / totalFrames;

  useEffect(() => {
    if (!isPlaying) return;

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentFrame = Math.min(
        Math.floor(elapsed / frameDuration),
        totalFrames
      );
      setFrame(currentFrame);

      if (currentFrame >= totalFrames) {
        setIsPlaying(false);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, totalFrames, frameDuration, onComplete]);

  const reset = useCallback(() => {
    startRef.current = null;
    completedRef.current = false;
    setFrame(0);
    setIsPlaying(true);
  }, []);

  return { frame, totalFrames, progress: frame / totalFrames, isPlaying, reset };
}

export function useStickyScroll(threshold: number = 0.1) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollRatio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setHasScrolled(scrollRatio > threshold);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hasScrolled;
}
