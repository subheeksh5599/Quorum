"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";

export default function ConsensusPage() {
  return (
    <Suspense fallback={<div style={{ padding: "6rem 2rem", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-muted)" }}>Loading...</div>}>
      <AppNav />
      <ConsensusContent />
    </Suspense>
  );
}

interface AgentVote {
  agentId: string;
  vote: string;
  reason: string;
  confidence: number;
  evidence: string[];
  timestamp: number;
}

interface TxData {
  transaction: {
    id: string;
    caseNumber: string;
    amount: number;
    country: string;
    counterpartyName: string;
    purpose: string;
    status: string;
    verdict?: string;
    chain?: string;
    reviewOpinion?: {
      verdict: string;
      reasoning: string[];
      prosecutorArgument: string;
      defenseArgument: string;
      riskFindings: string;
      precedentAnalysis: string;
      authorizationFindings: string;
      issuedAt: number;
    };
    createdAt: number;
  };
  votes: AgentVote[];
  auditLog: { phase: string; details: string; timestamp: number }[];
}

const agentLabels: Record<string, string> = {
  identity: "Identity Agent",
  prosecutor: "Prosecutor",
  defense: "Defense Counsel",
  risk: "Risk Agent",
  authorization: "Authorization Agent",
  review: "Review Judge",
};

function ConsensusContent() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("id");
  const [data, setData] = useState<TxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchData = useCallback(async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      if (d.transaction.status === "voting") {
        setPolling(true);
      } else {
        setPolling(false);
      }
    }
  }, []);

  useEffect(() => {
    if (txId) fetchData(txId);
  }, [txId, fetchData]);

  useEffect(() => {
    if (!polling || !txId) return;
    const interval = setInterval(() => fetchData(txId), 1500);
    return () => clearInterval(interval);
  }, [polling, txId, fetchData]);

  if (!txId) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.5rem" }}>Consensus View</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)", marginBottom: "2rem", letterSpacing: "0.06em" }}>
          SELECT A CASE TO VIEW AGENT VOTES
        </p>
        <CaseList />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-muted)" }}>Loading...</p>
      </div>
    );
  }

  const { transaction: tx, votes, auditLog } = data;
  const isApproved = tx.status === "approved" && tx.verdict !== "blocked";
  const isBlocked = tx.status === "blocked" || (tx.status === "approved" && tx.verdict === "blocked");
  const isDisputed = tx.status === "disputed" || tx.status === "under_review";
  const hasReviewOpinion = !!tx.reviewOpinion;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
      <Link href="/dashboard" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)", textDecoration: "none", letterSpacing: "0.06em" }}>
        ← DASHBOARD
      </Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.1em" }}>
          {tx.caseNumber}
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              ${(tx.amount / 1000).toFixed(0)}K USDC · {tx.purpose.replace(/_/g, " ")}
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)" }}>
          {tx.counterpartyName} · {tx.country} · {tx.chain}
        </p>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--ink-secondary)", marginBottom: "1rem" }}>
          AGENT VOTES
        </h2>

        <div style={{ display: "grid", gap: "1px", background: "var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          {votes.map((v) => (
            <div key={v.agentId} style={{
              background: "var(--bg-elevated)",
              padding: "0.9rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                background: v.vote === "approve" ? "rgba(62,196,138,0.15)" : "rgba(196,84,62,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600,
                color: v.vote === "approve" ? "var(--success)" : "var(--danger)",
                flexShrink: 0,
              }}>
                {v.vote === "approve" ? "✓" : "✕"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 500, color: "var(--ink-primary)" }}>
                  {agentLabels[v.agentId] || v.agentId}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v.reason}
                </p>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)", flexShrink: 0 }}>
                {v.confidence}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {hasReviewOpinion && tx.reviewOpinion && (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 600, fontStyle: "italic", color: "var(--accent)", marginBottom: "1rem" }}>
            Tribunal Opinion
          </h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
            {tx.caseNumber} — Issued {new Date(tx.reviewOpinion.issuedAt).toLocaleString()}
          </p>

          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <OpinionBlock label="Prosecution" text={tx.reviewOpinion.prosecutorArgument} color="var(--danger)" />
            <OpinionBlock label="Defense" text={tx.reviewOpinion.defenseArgument} color="var(--success)" />
            <OpinionBlock label="Risk Findings" text={tx.reviewOpinion.riskFindings} color="var(--warning)" />
            <OpinionBlock label="Precedent Analysis" text={tx.reviewOpinion.precedentAnalysis} color="var(--ink-secondary)" />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            {tx.reviewOpinion.reasoning.map((r, i) => (
              <p key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--ink-primary)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                {r}
              </p>
            ))}
          </div>

          <div style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            background: tx.reviewOpinion.verdict === "final_approve" ? "rgba(62,196,138,0.08)" : "rgba(196,84,62,0.08)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: tx.reviewOpinion.verdict === "final_approve" ? "var(--success)" : "var(--danger)",
            letterSpacing: "0.08em",
          }}>
            VERDICT: {tx.reviewOpinion.verdict === "final_approve" ? "APPROVED" : "REJECTED"}
          </div>
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        borderRadius: "var(--radius-md)",
        background: isApproved ? "rgba(62,196,138,0.06)" : isBlocked ? "rgba(196,84,62,0.06)" : "rgba(196,154,60,0.06)",
        border: `1px solid ${isApproved ? "rgba(62,196,138,0.2)" : isBlocked ? "rgba(196,84,62,0.2)" : "rgba(196,154,60,0.2)"}`,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)", letterSpacing: "0.08em" }}>
          STATUS
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: isApproved ? "var(--success)" : isBlocked ? "var(--danger)" : "var(--warning)",
        }}>
          {tx.status.toUpperCase().replace("_", " ")}
        </span>
      </div>
    </div>
  );
}

function OpinionBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color, letterSpacing: "0.08em" }}>
        {label.toUpperCase()}
      </span>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink-secondary)", marginTop: "0.2rem", lineHeight: 1.4 }}>
        {text}
      </p>
    </div>
  );
}

function CaseList() {
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; amount: number; counterpartyName: string; purpose: string; status: string; verdict?: string; createdAt: number }>>([]);

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
        <Link key={c.id} href={`/consensus?id=${c.id}`} style={{ textDecoration: "none" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem",
            display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s ease",
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
