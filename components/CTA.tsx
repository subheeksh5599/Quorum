"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: "var(--bg-surface)",
        padding: "8rem 2rem",
        textAlign: "center",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0, 0, 1] }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.25em", color: "var(--accent)", marginBottom: "1.5rem" }}>
          BUILT ON MONAD
        </p>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 600, fontStyle: "italic", color: "var(--ink-primary)", letterSpacing: "-0.02em", marginBottom: "1.5rem", lineHeight: 1.2 }}>
          Adversarial consensus for the age of AI.
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--ink-secondary)", fontWeight: 300, maxWidth: "44ch", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Monad testnet with Cleanverse compliance. Deploy on your own infrastructure. Open-source scheduling.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ background: "var(--accent)", color: "var(--bg-deep)", padding: "0.8rem 2.2rem", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.06em", fontWeight: 500, border: "none", cursor: "pointer", textDecoration: "none" }}>
            LAUNCH APP
          </Link>
        </div>
      </motion.div>
      <footer style={{ marginTop: "6rem", paddingTop: "2rem", borderTop: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--ink-muted)", letterSpacing: "0.06em", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <span>QUORUM</span>
        <span>MONAD TESTNET · CHAIN 10143</span>
      </footer>
    </section>
  );
}
