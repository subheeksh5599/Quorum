"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(196,154,60,0.06) 0%, transparent 70%)",
      }}
    >
      <motion.div
        style={{ textAlign: "center", zIndex: 2, maxWidth: 800 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "var(--accent)",
            marginBottom: "2rem",
          }}
        >
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0, 0, 1] }}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "var(--ink-primary)",
            maxWidth: "12ch",
            margin: "0 auto 1.5rem",
          }}
        >
          No agent{" "}
          <span className="gradient-text" style={{ fontStyle: "italic" }}>moves money</span>{" "}
          alone.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "var(--ink-secondary)",
            maxWidth: "42ch",
            margin: "0 auto 3rem",
            lineHeight: 1.6,
            fontWeight: 300,
          }}
        >
          <span className="gradient-text">Five specialized agents</span>{" "}
          argue every transaction before a single dollar moves.{" "}
          A prosecutor tries to reject it.{" "}
          A defense counsel tries to approve it. When they disagree,{" "}
          <span className="gradient-text" style={{ fontWeight: 500 }}>a judge rules.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <a
            href="/dashboard"
            style={{
              background: "transparent",
              color: "#ffffff",
              padding: "0.85rem 2.5rem",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              fontWeight: 600,
              border: "2px solid var(--accent)",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.2s ease",
            }}
          >
            DASHBOARD
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(to right, transparent, var(--accent), transparent)",
        }}
      />
    </section>
  );
}
