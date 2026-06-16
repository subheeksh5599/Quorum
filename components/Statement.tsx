"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Statement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.97, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  return (
    <section
      ref={containerRef}
      id="statement"
      style={{
        position: "relative",
        height: "200vh",
        background: "var(--bg-deep)",
      }}
    >
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{ opacity, scale, y, textAlign: "center", maxWidth: "52ch" }}
        >
          <motion.p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: "var(--accent)",
              marginBottom: "2.5rem",
            }}
          >
            THE PROBLEM
          </motion.p>

          <motion.h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              color: "var(--ink-primary)",
              fontStyle: "italic",
              marginBottom: "2rem",
            }}
          >
            &ldquo;Most AI payment systems give one agent the keys to the kingdom.&rdquo;
          </motion.h2>

          <motion.p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
              color: "var(--ink-secondary)",
              lineHeight: 1.7,
              fontWeight: 300,
              marginBottom: "1.5rem",
            }}
          >
            A compromised AI agent with unilateral spending authority is a single point of
            catastrophic failure. Real financial systems don&apos;t work that way. Banks use
            separation of powers. Governments use checks and balances. Why should AI be different?
          </motion.p>

          <motion.p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.9rem, 1.1vw, 1rem)",
              color: "var(--ink-muted)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Quorum introduces adversarial consensus. No single agent can move money. Five
            specialized agents must debate every transaction. A prosecutor argues for rejection. A
            defense counsel argues for approval. If they disagree, a judge issues a binding
            opinion. Every decision creates precedent. Everything is auditable.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
