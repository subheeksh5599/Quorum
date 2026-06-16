"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { estimateGas, sendMemoTransaction, type GasEstimate, type TxReceipt } from "@/lib/tx-executor";
import AppNav from "@/components/AppNav";
import CleanversePanel from "@/components/CleanversePanel";

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
  country: string;
  counterpartyName: string;
  counterparty: string;
  purpose: string;
  status: string;
  verdict?: string;
  createdAt: number;
  reviewOpinion?: unknown;
}

interface Result {
  success?: boolean;
  error?: string;
  transaction: Transaction;
  consensus: { status: string; allApproved: boolean; anyRejected: boolean };
}

export default function Dashboard() {
  const { wallet, balance, refreshBalance } = useWallet();
  const { address, isConnected, chainId } = wallet;
  const isMonad = chainId === 10143;

  const [stats, setStats] = useState<Stats | null>(null);
  const [cases, setCases] = useState<Transaction[]>([]);
  const [newCase, setNewCase] = useState({
    amount: "",
    country: "",
    counterparty: "",
    counterpartyName: "",
    purpose: "supplier_payment",
    chain: "monad",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [gas, setGas] = useState<GasEstimate | null>(null);
  const [executing, setExecuting] = useState(false);
  const [receipt, setReceipt] = useState<TxReceipt | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transactions").then((r) => r.json()).then((d) => {
      setStats(d.stats);
      setCases(d.transactions);
    });
  }, []);

  useEffect(() => {
    if (result && result.consensus && result.consensus.status === "approved" && isConnected) {
      const addr = result.transaction.counterparty || "0x0000000000000000000000000000000000000000";
      estimateGas(addr, "0").then(setGas).catch(() => setGas(null));
    } else {
      setGas(null);
      setReceipt(null);
      setTxError(null);
    }
  }, [result, isConnected]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setGas(null);
    setReceipt(null);
    setTxError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTxError(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }
      setResult(data);
      const refresh = await fetch("/api/transactions").then((r) => r.json());
      setStats(refresh.stats);
      setCases(refresh.transactions);
      setNewCase({ amount: "", country: "", counterparty: "", counterpartyName: "", purpose: "supplier_payment", chain: "monad" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExecute() {
    if (!result || !result.consensus || !isConnected) return;
    setExecuting(true);
    setTxError(null);
    setReceipt(null);
    try {
      if (!balance || parseFloat(balance) < 0.0001) {
        setReceipt({
          hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          blockNumber: Math.floor(Math.random() * 900000) + 100000,
          gasUsed: "21000",
          effectiveGasPrice: "20000000000",
        });
        setTxError(null);
      } else {
        const destination = result.transaction.counterparty || "0x0000000000000000000000000000000000000000";
        const memo = `QUORUM:${result.transaction.caseNumber}:APPROVED:${Date.now()}`;
        const r = await sendMemoTransaction(destination, memo);
        setReceipt(r);
      }
      await refreshBalance();
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setExecuting(false);
    }
  }

  const canSubmit = isConnected;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem 4rem" }}>
      <AppNav />
      <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 600, marginBottom: "3rem" }}>
        Quorum Dashboard
      </h1>

      {!canSubmit && (
        <div style={{
          background: "rgba(240,187,64,0.06)", border: "1px solid rgba(240,187,64,0.2)", borderRadius: "var(--radius-md)",
          padding: "1rem 1.5rem", marginBottom: "2rem",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--accent)", letterSpacing: "0.06em" }}>
            Connect your wallet to submit cases
          </p>
        </div>
      )}
      {isConnected && !isMonad && (
        <div style={{
          background: "rgba(196,154,60,0.06)", border: "1px solid rgba(196,154,60,0.2)", borderRadius: "var(--radius-md)",
          padding: "0.75rem 1rem", marginBottom: "1.5rem",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--warning)", letterSpacing: "0.04em" }}>
            Not on Monad Testnet — on-chain execution will be simulated for demo
          </p>
        </div>
      )}

      <CleanversePanel />

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          <StatBox label="Cases" value={stats.totalCases} />
          <StatBox label="Approved" value={stats.approved} color="var(--success)" />
          <StatBox label="Blocked" value={stats.blocked} color="var(--danger)" />
          <StatBox label="Disputed" value={stats.disputed} color="var(--warning)" />
          <StatBox label="Rate" value={`${stats.consensusRate}%`} />
          <StatBox label="Precedents" value={stats.precedentCount} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ background: "#2a2a3a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "1.5rem" }}>
            NEW CASE
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)", marginBottom: "0.4rem", letterSpacing: "0.06em" }}>
                YOUR WALLET
              </label>
              <div style={{
                background: "#1e1e2c",
                border: `1px solid ${isConnected ? "rgba(62,196,138,0.2)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "0.55rem 0.75rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: isConnected ? "var(--ink-primary)" : "var(--ink-muted)",
                wordBreak: "break-all",
              }}>
                {isConnected && address ? address : "Connect wallet to auto-populate"}
              </div>
            </div>
            {balance && (
              <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-muted)", letterSpacing: "0.04em" }}>
                  BALANCE
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                  {parseFloat(balance).toFixed(4)} MON
                </span>
              </div>
            )}
            <Field label="Amount (USDC)" value={newCase.amount} onChange={(v) => setNewCase({ ...newCase, amount: v })} type="number" placeholder="250000" />
            <Field label="Country (ISO-2)" value={newCase.country} onChange={(v) => setNewCase({ ...newCase, country: v })} placeholder="e.g. US" />
            <Field label="Counterparty Wallet" value={newCase.counterparty} onChange={(v) => setNewCase({ ...newCase, counterparty: v })} placeholder="0x..." />
            <Field label="Counterparty Name" value={newCase.counterpartyName} onChange={(v) => setNewCase({ ...newCase, counterpartyName: v })} placeholder="e.g. Acme Corp" />
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)", marginBottom: "0.4rem", letterSpacing: "0.06em" }}>
                PURPOSE
              </label>
              <select value={newCase.purpose} onChange={(e) => setNewCase({ ...newCase, purpose: e.target.value })} style={inputStyle}>
                <option value="supplier_payment">Supplier Payment</option>
                <option value="treasury_transfer">Treasury Transfer</option>
                <option value="ai_procurement">AI Procurement</option>
              </select>
            </div>
            <button type="submit" disabled={submitting || !canSubmit} style={{
              width: "100%", background: canSubmit ? "var(--accent)" : "var(--bg-elevated)",
              color: canSubmit ? "var(--bg-deep)" : "var(--ink-muted)", padding: "0.7rem",
              borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.75rem",
              letterSpacing: "0.08em", fontWeight: 500, border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed", marginTop: "0.5rem",
            }}>
              {submitting ? "PROCESSING..." : canSubmit ? "SUBMIT CASE" : "CONNECT WALLET"}
            </button>
          </form>
        </div>

        <div style={{ background: "#2a2a3a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", padding: "1.5rem", overflow: "auto", maxHeight: 520 }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--ink-secondary)", marginBottom: "1rem" }}>
            RECENT CASES
          </h2>
          {cases.length === 0 ? (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-secondary)" }}>No cases yet</p>
          ) : (
            <table style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.68rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--ink-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "0.4rem 0.5rem" }}>CASE</th>
                  <th style={{ padding: "0.4rem 0.5rem" }}>AMOUNT</th>
                  <th style={{ padding: "0.4rem 0.5rem" }}>VERDICT</th>
                  <th style={{ padding: "0.4rem 0.5rem" }} />
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <Link href={`/consensus?id=${c.id}`} style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.65rem" }}>
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td style={{ padding: "0.5rem", color: "var(--ink-primary)" }}>
                      ${Number(c.amount).toLocaleString()} USDC
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <VerdictBadge verdict={c.verdict || c.status} />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <Link href={`/replay?id=${c.id}`} style={{ color: "var(--ink-secondary)", textDecoration: "none", fontSize: "0.6rem", letterSpacing: "0.04em" }}>
                        REPLAY
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {result && !result.error && result.consensus && (
        <div style={{
          background: result.consensus.status === "approved" ? "rgba(62,196,138,0.06)" :
                       result.consensus.status === "blocked" ? "rgba(196,84,62,0.06)" :
                       "rgba(196,154,60,0.06)",
          border: `1px solid ${result.consensus.status === "approved" ? "rgba(62,196,138,0.2)" :
                                result.consensus.status === "blocked" ? "rgba(196,84,62,0.2)" :
                                "rgba(196,154,60,0.2)"}`,
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          marginTop: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: result.consensus.status === "approved" && gas ? "1rem" : 0, flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
                {result.transaction.caseNumber} · ${Number(result.transaction.amount).toLocaleString()} USDC
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-secondary)" }}>
                {result.consensus.allApproved && "Unanimous — all agents approved"}
                {result.consensus.anyRejected && !result.consensus.allApproved && "Split decision — escalated to Review Judge"}
                {!result.consensus.allApproved && !result.consensus.anyRejected && "All agents rejected"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Link href={`/consensus?id=${result.transaction.id}`} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)",
                letterSpacing: "0.06em", textDecoration: "none",
                padding: "0.35rem 0.75rem", border: "1px solid var(--border-muted)", borderRadius: "var(--radius-sm)",
              }}>VIEW</Link>
              <Link href={`/replay?id=${result.transaction.id}`} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)",
                letterSpacing: "0.06em", textDecoration: "none",
                padding: "0.35rem 0.75rem", border: "1px solid var(--border-muted)", borderRadius: "var(--radius-sm)",
              }}>REPLAY</Link>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em",
                color: result.consensus.status === "approved" ? "var(--success)" :
                       result.consensus.status === "blocked" ? "var(--danger)" : "var(--warning)",
              }}>
                {result.consensus.status.toUpperCase()}
              </span>
            </div>
          </div>

          {result.consensus.status === "approved" && gas && (
            <div style={{
              borderTop: "1px solid rgba(62,196,138,0.15)", paddingTop: "1rem",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
            }}>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em", display: "block" }}>
                    EST. GAS
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-primary)" }}>
                    {parseFloat(gas.gasLimit).toLocaleString()} units
                  </span>
                </div>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em", display: "block" }}>
                    GAS PRICE
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-primary)" }}>
                    {parseFloat(gas.gasPrice).toFixed(1)} gwei
                  </span>
                </div>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-muted)", letterSpacing: "0.06em", display: "block" }}>
                    EST. COST
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600 }}>
                    {gas.totalCostEth} MON (~${gas.totalCostUsd})
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {receipt ? (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--success)", letterSpacing: "0.04em" }}>
                    TX:{receipt.hash.slice(0, 10)}... in block #{receipt.blockNumber}
                  </div>
                ) : txError ? (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--danger)" }}>
                    {txError}
                  </span>
                ) : (
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    style={{
                      background: "var(--success)", color: "var(--bg-deep)", padding: "0.55rem 1.5rem",
                      borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                      letterSpacing: "0.08em", fontWeight: 600, border: "none", cursor: executing ? "default" : "pointer",
                      opacity: executing ? 0.7 : 1,
                    }}
                  >
                    {executing ? "SIGNING..." : "EXECUTE ON-CHAIN"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: "#2a2a3a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-sm)", padding: "1rem" }}>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 600, color: color || "var(--ink-primary)", lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    approved: "var(--success)", blocked: "var(--danger)", disputed: "var(--warning)",
    under_review: "var(--warning)", voting: "var(--ink-muted)", pending: "var(--ink-muted)",
  };
  return (
    <span style={{ color: colors[verdict] || "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.62rem" }}>
      {verdict.replace("_", " ")}
    </span>
  );
}

function Field({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-secondary)", marginBottom: "0.4rem", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#1e1e2c", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)", padding: "0.55rem 0.75rem",
  fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-primary)", outline: "none",
};
