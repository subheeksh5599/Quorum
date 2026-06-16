"use client";

import Link from "next/link";
import WalletButton from "@/components/WalletButton";

export default function AppNav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(8,8,11,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            fontStyle: "italic",
            color: "var(--ink-primary)",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          Quorum
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        {[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Consensus", href: "/consensus" },
          { label: "Disputes", href: "/disputes" },
          { label: "Precedents", href: "/precedents" },
          { label: "Replay", href: "/replay" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--ink-secondary)",
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            {item.label.toUpperCase()}
          </Link>
        ))}
        <WalletButton />
      </div>
    </nav>
  );
}
