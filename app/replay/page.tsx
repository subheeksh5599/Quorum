"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";

export default function AuditReplayPage() {
  return (
    <Suspense fallback={<div style={{ padding: "6rem 2rem", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-muted)" }}>Loading...</div>}>
      <AuditReplayContent />
    </Suspense>
  );
}

interface ReplayFrame {
  timestamp: number;
  phase: string;
  label: string;
  details: string;
  agentId?: string;
  vote?: string;
  confidence?: number;
}

const phaseColors: Record<string, string> = {
  created: "var(--ink-secondary)",
  identity: "var(--accent)",
  prosecutor: "var(--danger)",
  defense: "var(--success)",
  risk: "var(--warning)",
  authorization: "var(--ink-secondary)",
  consensus: "var(--accent)",
  review: "var(--ink-primary)",
  settlement: "var(--success)",
};

function AuditReplayContent() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("id");
  const [frames, setFrames] = useState<ReplayFrame[]>([]);
  const [caseNumber, setCaseNumber] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(-1);

  useEffect(() => {
    if (!txId) return;
    fetch(`/api/transactions/${txId}/replay`)
      .then((r) => r.json())
      .then((d) => {
        setFrames(d.frames || []);
        setCaseNumber(d.caseNumber || "");
      });
  }, [txId]);

  useEffect(() => {
    if (!playing || !frames || frames.length === 0) return;
    let i = 0;
    setCurrentFrame(0);
    const interval = setInterval(() => {
      i++;
      setCurrentFrame(i);
      if (i >= frames.length) {
        setPlaying(false);
        clearInterval(interval);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [playing, frames.length]);

  if (!txId) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.5rem" }}>Audit Replay</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)", marginBottom: "2rem", letterSpacing: "0.06em" }}>
          SELECT A CASE TO REPLAY ITS AUDIT TRAIL
        </p>
        <ReplayCaseList />
      </div>
    );
  }

  const startTime = frames[0]?.timestamp;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
      <AppNav />
      <Link href="/dashboard" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)", textDecoration: "none", letterSpacing: "0.06em" }}>
        ← DASHBOARD
      </Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.1em" }}>
            {caseNumber}
          </p>
          <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 600 }}>
            Audit Replay
          </h1>
        </div>
        <button
          onClick={() => { if (!playing) { setPlaying(true); } else { setPlaying(false); } }}
          style={{
            background: playing ? "var(--bg-elevated)" : "var(--accent)",
            color: playing ? "var(--ink-primary)" : "var(--bg-deep)",
            padding: "0.7rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            border: playing ? "1px solid var(--border-muted)" : "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {playing ? "PAUSE" : "REPLAY"}
        </button>
      </div>

      <div style={{ position: "relative", paddingLeft: "2rem" }}>
        <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 1, background: "var(--border-subtle)" }} />

        {frames.map((f, i) => {
          const isActive = playing && i <= currentFrame;
          const isPast = !playing ? true : i <= currentFrame;

          return (
            <div key={i} style={{
              position: "relative",
              marginBottom: "1.5rem",
              opacity: isPast ? 1 : 0.25,
              transition: "opacity 0.4s ease",
            }}>
              <div style={{
                position: "absolute",
                left: "-2rem",
                top: 4,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: isPast ? (phaseColors[f.phase] || "var(--ink-muted)") : "var(--bg-elevated)",
                border: `2px solid ${isPast ? (phaseColors[f.phase] || "var(--ink-muted)") : "var(--border-subtle)"}`,
                transition: "all 0.3s ease",
                boxShadow: isActive && i === currentFrame ? `0 0 8px ${phaseColors[f.phase]}30` : "none",
              }} />

              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: phaseColors[f.phase] || "var(--ink-muted)", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
                {f.label.toUpperCase()}
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--ink-primary)", lineHeight: 1.4 }}>
                {f.details}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-muted)", marginTop: "0.2rem" }}>
                {new Date(f.timestamp).toLocaleTimeString()}
                {f.confidence !== undefined && ` · ${f.confidence}% confidence`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReplayCaseList() {
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; amount: number; counterpartyName: string; purpose: string; status: string; verdict?: string }>>([]);

  useEffect(() => {
    fetch("/api/transactions").then(r => r.json()).then(d => setCases(d.transactions));
  }, []);

  if (cases.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontStyle: "italic", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>No cases yet</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-muted)" }}>
          Submit a transaction from the <Link href="/dashboard" style={{ color: "var(--accent)" }}>Dashboard</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {cases.map((c) => (
        <Link key={c.id} href={`/replay?id=${c.id}`} style={{ textDecoration: "none" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.08em" }}>
                {c.caseNumber}
              </span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500, color: "var(--ink-primary)", marginTop: "0.1rem" }}>
                ${Number(c.amount).toLocaleString()} USDC — {c.purpose.replace(/_/g, " ")}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-muted)", marginTop: "0.15rem" }}>
                {c.counterpartyName}
              </p>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em",
              color: c.verdict === "approved" ? "var(--success)" : c.verdict === "blocked" ? "var(--danger)" : c.status === "disputed" ? "var(--warning)" : "var(--ink-muted)",
            }}>
              {(c.verdict || c.status).replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
