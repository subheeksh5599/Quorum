"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useCountUp(
  target: number,
  duration: number = 2000,
  enabled: boolean = false
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let start: number | null = null;
    let raf: number;

    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);

  return count;
}

export function useTypewriter(
  texts: string[],
  typingSpeed: number = 60,
  deleteSpeed: number = 30,
  pauseBetween: number = 2000
): { text: string; isDone: boolean } {
  const [text, setText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const textsRef = useRef(texts);
  textsRef.current = texts;

  useEffect(() => {
    let textIndex = 0;
    let charIndex = 0;
    let phase: "typing" | "pausing" | "deleting" = "typing";
    let timer: NodeJS.Timeout | null = null;
    let cancelled = false;

    function tick() {
      if (cancelled) return;

      const list = textsRef.current;
      const current = list[textIndex % list.length];

      if (phase === "typing") {
        if (charIndex < current.length) {
          setText(current.slice(0, charIndex + 1));
          charIndex++;
          timer = setTimeout(tick, typingSpeed);
        } else {
          if (textIndex === list.length - 1) {
            setText(current);
            setIsDone(true);
            return;
          }
          phase = "pausing";
          timer = setTimeout(() => {
            if (cancelled) return;
            phase = "deleting";
            tick();
          }, pauseBetween);
        }
      } else if (phase === "deleting") {
        if (charIndex > 0) {
          charIndex--;
          setText(current.slice(0, charIndex));
          timer = setTimeout(tick, deleteSpeed);
        } else {
          textIndex++;
          phase = "typing";
          setText("");
          timer = setTimeout(tick, typingSpeed);
        }
      }
    }

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { text, isDone };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function formatAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
