"use client";

import { useState, useEffect } from "react";
import AppNav from "@/components/AppNav";

interface PrecedentCase {
  caseNumber: string;
  amount: number;
  country: string;
  counterpartyName: string;
  counterpartyType: string;
  purpose: string;
  verdict: string;
  prosecutorArg: string;
  defenseArg: string;
  tags: string[];
  timestamp: number;
  reviewOpinion?: string;
}

export default function PrecedentLibrary() {
  const [cases, setCases] = useState<PrecedentCase[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PrecedentCase | null>(null);

  useEffect(() => {
    fetch("/api/precedents")
      .then((r) => r.json())
      .then((d) => setCases(d.cases));
  }, []);

  const filtered = cases.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.caseNumber.toLowerCase().includes(q) ||
      c.counterpartyName.toLowerCase().includes(q) ||
      c.purpose.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.verdict.toLowerCase().includes(q)
    );
  });

  const approved = cases.filter((c) => c.verdict === "approved").length;
  const blocked = cases.filter((c) => c.verdict === "blocked").length;
  const disputed = cases.filter((c) => c.verdict === "disputed").length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
      <AppNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Precedent Library
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)", letterSpacing: "0.08em" }}>
            {cases.length} CASES · CASE LAW FOR AI TRANSACTIONS
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 600, color: "var(--success)" }}>{approved}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>APPROVED</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 600, color: "var(--danger)" }}>{blocked}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>BLOCKED</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 600, color: "var(--warning)" }}>{disputed}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>DISPUTED</p>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by case #, entity, purpose, country, tag, or verdict..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "0.7rem 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "var(--ink-primary)",
          outline: "none",
          marginBottom: "1.5rem",
        }}
      />

      {filtered.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontStyle: "italic", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>
            No precedents yet
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-muted)" }}>
            Submit transactions from the Dashboard to build the case law database.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
          {filtered.map((c) => (
            <div
            key={c.caseNumber}
            onClick={() => setSelected(selected?.caseNumber === c.caseNumber ? null : c)}
            style={{
              background: selected?.caseNumber === c.caseNumber ? "var(--bg-elevated)" : "var(--bg-card)",
              border: `1px solid ${selected?.caseNumber === c.caseNumber ? "var(--accent)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.08em" }}>
                {c.caseNumber}
              </span>
              <VerdictBadge verdict={c.verdict} />
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500, color: "var(--ink-primary)", marginBottom: "0.3rem" }}>
              ${(c.amount / 1000).toFixed(0)}K — {c.purpose.replace(/_/g, " ")}
            </p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <Tag>{c.counterpartyName}</Tag>
              <Tag>{c.country}</Tag>
              <Tag>{c.counterpartyType}</Tag>
            </div>

            {selected?.caseNumber === c.caseNumber && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--danger)", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                    PROSECUTION
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)", lineHeight: 1.4 }}>
                    {c.prosecutorArg}
                  </p>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--success)", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                    DEFENSE
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)", lineHeight: 1.4 }}>
                    {c.defenseArg}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {c.tags.map((t) => (
                    <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", background: "var(--bg-surface)", padding: "0.15rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                {c.reviewOpinion && (
                  <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(196,154,60,0.06)", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--warning)", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                      REVIEW OPINION
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--ink-secondary)", lineHeight: 1.5, fontStyle: "italic" }}>
                      {c.reviewOpinion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = { approved: "var(--success)", blocked: "var(--danger)", disputed: "var(--warning)" };
  return (
    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.06em", background: `${colors[verdict]}15`, color: colors[verdict] }}>
      {verdict.toUpperCase()}
    </span>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--ink-muted)", background: "var(--bg-surface)", padding: "0.15rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
      {children}
    </span>
  );
}
