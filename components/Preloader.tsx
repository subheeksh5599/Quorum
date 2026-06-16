"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTypewriter } from "@/lib/hooks";
import { useState, useEffect } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const { text, isDone: typingDone } = useTypewriter(
    ["Initializing Quorum...", "Agents standing by..."],
    35,
    20,
    600
  );

  const [isLifting, setIsLifting] = useState(false);

  useEffect(() => {
    if (typingDone) {
      const delay = setTimeout(() => setIsLifting(true), 400);
      return () => clearTimeout(delay);
    }
  }, [typingDone]);

  useEffect(() => {
    if (isLifting) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLifting, onComplete]);

  const frames = Array.from({ length: 12 }, (_, i) => ({ id: i }));

  return (
    <AnimatePresence>
      {!isLifting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "var(--bg-deep)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Hyperframes grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              opacity: 0.06,
            }}
          >
            {frames.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.15] }}
                transition={{
                  duration: 1.8,
                  delay: f.id * 0.12,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  border: "1px solid var(--border-subtle)",
                  margin: 2,
                  borderRadius: "var(--radius-sm)",
                }}
              />
            ))}
          </div>

          {/* Typewriter text */}
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
              fontWeight: 500,
              fontStyle: "italic",
              color: "var(--ink-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {text}
            {!typingDone && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                style={{ color: "var(--accent)", marginLeft: 2 }}
              >
                |
              </motion.span>
            )}
          </motion.div>

          {/* Progress line */}
          <div className="preloader-progress" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
