"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const demos = [
  {
    id: "blocked",
    title: "Blocked Transaction",
    description: "Prosecutor identifies sanctions match. Transaction halted before funds move.",
    verdict: "BLOCKED",
    color: "rgba(196,84,62,0.06)",
    accent: "var(--danger)",
    amount: "$500K USDC",
    country: "IR",
  },
  {
    id: "approved",
    title: "Approved Transfer",
    description: "All agents concur. Institutional whitelist verified. Precedent confidence at 78%.",
    verdict: "APPROVED",
    color: "rgba(62,196,138,0.06)",
    accent: "var(--success)",
    amount: "$1.2M USDC",
    country: "US",
  },
  {
    id: "disputed",
    title: "Dispute Resolution",
    description: "Prosecutor and Authorization disagree. Review Judge issues binding judicial opinion.",
    verdict: "DISPUTED",
    color: "rgba(196,154,60,0.06)",
    accent: "var(--warning)",
    amount: "$850K USDC",
    country: "SG",
  },
  {
    id: "replay",
    title: "Audit Replay",
    description: "Full timeline reconstruction. Every vote, every reason, every timestamp preserved.",
    verdict: "RECORDED",
    color: "rgba(255,255,255,0.03)",
    accent: "var(--ink-secondary)",
    amount: "N/A",
    country: "N/A",
  },
];

export default function DemoCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        background: "var(--bg-deep)",
        padding: "8rem 2rem 6rem",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "4rem" }}
      >
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: "var(--accent)",
          marginBottom: "1rem",
        }}>
          DEMONSTRATION
        </p>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
          fontWeight: 600,
          color: "var(--ink-primary)",
          letterSpacing: "-0.02em",
        }}>
          Watch the court in session
        </h2>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        {demos.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 * i }}
            onMouseEnter={() => setExpanded(item.id)}
            onMouseLeave={() => setExpanded(null)}
            style={{
              position: "relative",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              cursor: "default",
              transition: "all 0.35s cubic-bezier(0.25, 0, 0, 1)",
              transform: expanded === item.id ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
              borderColor: expanded === item.id ? item.accent : "var(--border-subtle)",
              boxShadow: expanded === item.id ? "0 20px 60px rgba(0,0,0,0.3)" : "none",
              zIndex: expanded === item.id ? 5 : 1,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: expanded === item.id ? 120 : 0,
                opacity: expanded === item.id ? 1 : 0,
              }}
              transition={{ duration: 0.35 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                background: item.color,
                borderRadius: "var(--radius-sm)",
                padding: "1rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                color: "var(--ink-secondary)",
                lineHeight: 1.5,
              }}>
                {item.description}
              </div>
            </motion.div>

            <div style={{
              background: item.color,
              borderRadius: "var(--radius-sm)",
              height: 100,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.35s ease",
            }}>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                fontWeight: 600,
                fontStyle: "italic",
                color: "var(--ink-primary)",
                opacity: 0.5,
              }}>
                {item.amount}
              </p>
            </div>

            <h3 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "var(--ink-primary)",
              marginBottom: "0.3rem",
            }}>
              {item.title}
            </h3>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--ink-muted)",
              letterSpacing: "0.04em",
            }}>
              {item.verdict} · {item.country}
            </p>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link
          href="/dashboard"
          style={{
            background: "var(--accent)",
            color: "var(--bg-deep)",
            padding: "0.7rem 2rem",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          TRY IT LIVE
        </Link>
      </div>
    </section>
  );
}
