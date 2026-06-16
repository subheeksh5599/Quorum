"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import StatsBand from "@/components/StatsBand";
import AgentGrid from "@/components/AgentGrid";
import DemoCards from "@/components/DemoCards";
import CTA from "@/components/CTA";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />

      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <nav
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              padding: "1.25rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(8,8,11,0.85)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: "var(--ink-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Quorum
              </span>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <WalletButton />
            </div>
          </nav>

          <main>
            <Hero />
            <StatsBand />
            <Statement />
            <div id="agents">
              <AgentGrid />
            </div>
            <div id="demos">
              <DemoCards />
            </div>
            <CTA />
          </main>
        </motion.div>
      )}

      <style jsx global>{`
        .nav-link:hover {
          color: var(--ink-primary) !important;
        }
      `}</style>
    </>
  );
}
