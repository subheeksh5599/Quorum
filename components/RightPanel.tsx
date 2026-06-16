"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet";

interface Stats {
  totalCases: number;
  approved: number;
  blocked: number;
  disputed: number;
  totalValue: number;
  consensusRate: number;
  activeAgents: number;
  precedentCount: number;
}

interface Transaction {
  id: string;
  caseNumber: string;
  amount: number;
  counterpartyName: string;
  status: string;
  verdict?: string;
}

export default function RightPanel() {
  const { wallet, balance } = useWallet();
  const { address, isConnected, chainId } = wallet;
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecent(d.transactions?.slice(0, 10) || []);
      })
      .catch(() => {});
  }, []);

  if (collapsed) {
    return (
      <div
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 90,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px 0 0 8px",
          padding: "0.8rem 0.45rem",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onClick={() => setCollapsed(false)}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: "var(--accent)",
          }}
        >
          PANEL
        </span>
      </div>
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        right: 0,
        top: "3.55rem",
        bottom: 0,
        width: 280,
        zIndex: 90,
        background: "rgba(14,14,18,0.95)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid var(--border-subtle)",
        overflowY: "auto",
        padding: "1.5rem 1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            color: "var(--ink-muted)",
          }}
        >
          QUORUM CONTROL
        </h3>
        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink-muted)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            padding: "0.2rem 0.4rem",
            borderRadius: "var(--radius-sm)",
          }}
        >
          &#x2715;
        </button>
      </div>

      <Section title="WALLET STATUS">
        {isConnected && address ? (
          <>
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-sm)",
                padding: "0.8rem",
                border: "1px solid var(--border-subtle)",
                marginBottom: "0.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.52rem",
                  color: "var(--ink-muted)",
                  marginBottom: "0.25rem",
                  letterSpacing: "0.08em",
                }}
              >
                ADDRESS
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--ink-primary)",
                  wordBreak: "break-all",
                }}
              >
                {address.slice(0, 10)}...{address.slice(-8)}
              </p>
            </div>
            {balance && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.8rem",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "0.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.52rem",
                    color: "var(--ink-muted)",
                    marginBottom: "0.25rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  BALANCE
                </p>
                <p
                  className="gradient-text"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {balance} MON
                </p>
              </div>
            )}
            <div
              style={{
                background:
                  chainId === 10143
                    ? "rgba(62,196,138,0.08)"
                    : "rgba(196,84,62,0.08)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                border: `1px solid ${
                  chainId === 10143
                    ? "rgba(62,196,138,0.2)"
                    : "rgba(196,84,62,0.2)"
                }`,
                marginBottom: "0.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color:
                    chainId === 10143 ? "var(--success)" : "var(--danger)",
                  letterSpacing: "0.06em",
                }}
              >
                {chainId === 10143
                  ? "MONAD TESTNET"
                  : chainId
                  ? `NETWORK ${chainId}`
                  : "DETECTING..."}
              </p>
            </div>
          </>
        ) : (
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-sm)",
              padding: "0.8rem",
              border: "1px solid var(--border-subtle)",
              marginBottom: "0.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--ink-muted)",
                textAlign: "center",
              }}
            >
              No wallet connected
            </p>
          </div>
        )}
      </Section>

      {stats && (
        <Section title="PROTOCOL STATS">
          <StatRow label="Total Cases" value={stats.totalCases} />
          <StatRow label="Consensus Rate" value={`${stats.consensusRate}%`} />
          <StatRow label="Active Agents" value={stats.activeAgents} />
          <StatRow label="Precedents" value={stats.precedentCount} />
          <StatRow
            label="Total Value"
            value={`$${Number(stats.totalValue).toLocaleString()}`}
          />
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <Badge color="var(--success)" label={`${stats.approved} APPROVED`} />
            <Badge color="var(--danger)" label={`${stats.blocked} BLOCKED`} />
            <Badge color="var(--warning)" label={`${stats.disputed} DISPUTED`} />
          </div>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="LATEST ACTIVITY">
          {recent.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.4rem 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    color: "var(--ink-secondary)",
                    display: "block",
                  }}
                >
                  {c.caseNumber}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5rem",
                    color: "var(--ink-muted)",
                  }}
                >
                  {c.counterpartyName || `$${Number(c.amount).toLocaleString()}`}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.05em",
                  color:
                    c.verdict === "approved"
                      ? "var(--success)"
                      : c.verdict === "blocked"
                      ? "var(--danger)"
                      : c.status === "disputed"
                      ? "var(--warning)"
                      : "var(--ink-muted)",
                }}
              >
                {c.verdict
                  ? c.verdict.replace("_", " ").toUpperCase()
                  : c.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          ))}
        </Section>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p
        className="gradient-text-dual"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.56rem",
          letterSpacing: "0.14em",
          marginBottom: "0.65rem",
          fontWeight: 600,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0.3rem 0",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "var(--ink-muted)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          color: "var(--ink-primary)",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.48rem",
        color,
        background: `${color}18`,
        padding: "0.15rem 0.4rem",
        borderRadius: "var(--radius-sm)",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
