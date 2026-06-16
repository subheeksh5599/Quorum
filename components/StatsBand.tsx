"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/lib/hooks";

interface StatItem {
  value: number;
  label: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { value: 12847, label: "Cases adjudicated", prefix: "" },
  { value: 2470000000, label: "Total value processed", prefix: "$" },
  { value: 94, label: "Consensus rate", prefix: "" },
  { value: 6, label: "Active agents", prefix: "" },
];

function StatBox({ value, label, prefix = "" }: StatItem) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const count = useCountUp(value, 2200, inView);

  const displayValue =
    prefix === "$"
      ? `$${(count / 1_000_000).toFixed(1)}M`
      : `${count}${label === "Consensus rate" ? "%" : ""}`;

  return (
    <div ref={ref}>
      <motion.p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
          fontWeight: 600,
          color: "var(--ink-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        {inView ? displayValue : (value === 2470000000 ? "$0" : "0")}
      </motion.p>
      <motion.p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          color: "var(--ink-secondary)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </motion.p>
    </div>
  );
}

export default function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "2.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "2rem",
        }}
      >
        {stats.map((s) => (
          <StatBox key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
