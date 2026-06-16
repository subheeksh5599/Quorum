"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const agents = [
  { name: "Identity Agent", role: "Verifies A-Pass credentials and wallet ownership.", color: "rgba(196,154,60,0.10)", accent: "var(--accent)" },
  { name: "Prosecutor", role: "Finds reasons to reject. Sanctions, jurisdiction, suspicious patterns.", color: "rgba(196,84,62,0.10)", accent: "var(--danger)" },
  { name: "Defense Counsel", role: "Finds reasons to approve. Clean history, institutional whitelist, precedents.", color: "rgba(62,196,138,0.10)", accent: "var(--success)" },
  { name: "Risk Agent", role: "Analyzes amount, country exposure, and transaction velocity.", color: "rgba(196,154,60,0.08)", accent: "var(--warning)" },
  { name: "Authorization Agent", role: "Enforces spending mandates and organizational policy.", color: "rgba(255,255,255,0.04)", accent: "var(--ink-secondary)" },
  { name: "Review Judge", role: "Issues binding judicial opinion when agents disagree.", color: "rgba(255,255,255,0.06)", accent: "var(--ink-primary)" },
];

export default function AgentGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        background: "var(--bg-deep)",
        padding: "8rem 2rem",
        overflow: "hidden",
      }}
    >
      <motion.div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "var(--accent)",
            marginBottom: "1rem",
          }}
        >
          THE AGENTS
        </p>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--ink-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Six specialized agents. No unilateral authority.
        </h2>
      </motion.div>

      <motion.div
        style={{ y }}
        className="agent-grid"
      >
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            viewport={{ once: true, margin: "-60px" }}
            className="agent-card"
          >
            <div
              className="agent-card__badge"
            />
            <div>
              <h3 className="agent-card__name">{agent.name}</h3>
              <p className="agent-card__role">{agent.role}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style jsx>{`
        .agent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1px;
          max-width: 1000px;
          margin: 0 auto;
          background: var(--border-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .agent-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-card);
          transition: background 0.3s ease;
        }
        .agent-card:hover {
          background: var(--bg-elevated);
        }
        .agent-card__badge {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 0.4rem;
          flex-shrink: 0;
        }
        .agent-card:nth-child(2) .agent-card__badge { background: var(--danger); }
        .agent-card:nth-child(3) .agent-card__badge { background: var(--success); }
        .agent-card:nth-child(4) .agent-card__badge { background: var(--warning); }
        .agent-card:nth-child(5) .agent-card__badge { background: var(--ink-secondary); }
        .agent-card:nth-child(6) .agent-card__badge { background: var(--ink-primary); }
        .agent-card__name {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--ink-primary);
          margin-bottom: 0.25rem;
        }
        .agent-card__role {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--ink-muted);
          line-height: 1.5;
          letter-spacing: 0.02em;
        }
      `}</style>
    </section>
  );
}
