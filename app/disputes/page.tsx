"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

interface Dispute {
  transactionId: string;
  caseNumber: string;
  approvingAgents: string[];
  rejectingAgents: string[];
  prosecutorVote: { reason: string; confidence: number };
  defenseVote: { reason: string; confidence: number };
  reviewOpinion?: { verdict: string; reasoning: string[]; issuedAt: number };
  resolvedAt?: number;
}

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    fetch("/api/disputes").then((r) => r.json()).then((d) => setDisputes(d.disputes));
  }, []);

  return (
    <>
      <AppNav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Dispute Center</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)", letterSpacing: "0.08em", marginBottom: "3rem" }}>CASES WHERE AGENTS DISAGREED</p>

        {disputes.length === 0 && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "3rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontStyle: "italic", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>No disputes yet</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-muted)" }}>Submit a case with mixed agent votes to trigger a dispute</p>
          </div>
        )}

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {disputes.map((d) => (
            <div key={d.transactionId} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
              <Link href={`/consensus?id=${d.transactionId}`} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.1em" }}>{d.caseNumber}</p>
                    {d.reviewOpinion && (
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: d.reviewOpinion.verdict === "final_approve" ? "var(--success)" : "var(--danger)", letterSpacing: "0.06em", fontWeight: 600, marginTop: "0.25rem" }}>
                        {d.reviewOpinion.verdict === "final_approve" ? "FINAL APPROVE" : "FINAL REJECT"}
                      </p>
                    )}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)" }}>{d.resolvedAt ? new Date(d.resolvedAt).toLocaleString() : "PENDING"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "rgba(196,84,62,0.06)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--danger)", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>REJECTED BY ({d.rejectingAgents.length})</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)" }}>{d.prosecutorVote.reason}</p>
                  </div>
                  <div style={{ background: "rgba(62,196,138,0.06)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--success)", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>APPROVED BY ({d.approvingAgents.length})</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)" }}>{d.defenseVote.reason}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
