"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import {
  isConfigured,
  queryApass,
  generateApass,
  faucetAusdc,
  type ApassInfo,
  type GenerateApassResult,
  type FaucetResult,
} from "@/lib/cleanverse/client";

export default function CleanversePanel() {
  const { wallet } = useWallet();
  const { address, isConnected, chainId } = wallet;
  const isMonad = chainId === 10143;

  const [apass, setApass] = useState<ApassInfo | null>(null);
  const [genResult, setGenResult] = useState<GenerateApassResult | null>(null);
  const [faucetResult, setFaucetResult] = useState<FaucetResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");

  if (!isConfigured()) return null;
  if (!isConnected || !address) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem", marginBottom: "2rem",
      }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>
          CLEANVERSE IDENTITY
        </h2>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-muted)" }}>
          Connect wallet on Monad to manage A-Pass identity
        </p>
      </div>
    );
  }

  async function handleQueryApass() {
    setLoading("query");
    setError(null);
    try {
      const result = await queryApass("monad", address!);
      setApass(result);
      if (!result) setError("No A-Pass found for this wallet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateApass() {
    if (!customerId.trim()) {
      setError("Enter a customer ID");
      return;
    }
    setLoading("generate");
    setError(null);
    try {
      const result = await generateApass({
        chain: "monad",
        address: address!,
        customerId: customerId.trim(),
      });
      if (result) {
        setGenResult(result);
        handleQueryApass();
      } else {
        setError("Failed to generate A-Pass — check customerId format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleFaucet() {
    setLoading("faucet");
    setError(null);
    setFaucetResult(null);
    try {
      const result = await faucetAusdc("monad", address!);
      if (result) {
        setFaucetResult(result);
      } else {
        setError("Faucet failed — ensure wallet has valid A-Pass and under daily limit (20 aUSDC/day)");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem", marginBottom: "2rem",
    }}>
      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "1rem" }}>
        CLEANVERSE IDENTITY
      </h2>

      {!isMonad && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--warning)", marginBottom: "0.75rem" }}>
          Switch to Monad Testnet (chain 10143)
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-muted)", marginBottom: "0.4rem", letterSpacing: "0.06em" }}>
            WALLET
          </label>
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
            padding: "0.5rem 0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-primary)",
            wordBreak: "break-all",
          }}>
            {address}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-muted)", marginBottom: "0.4rem", letterSpacing: "0.06em" }}>
            CUSTOMER ID
          </label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="e.g. hackathon-team-001"
            style={{
              width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem",
              fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--ink-primary)", outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button onClick={handleQueryApass} disabled={loading !== null} style={btnStyle(false)}>
          {loading === "query" ? "..." : "CHECK A-PASS"}
        </button>
        <button onClick={handleGenerateApass} disabled={loading !== null || !isMonad} style={btnStyle(true)}>
          {loading === "generate" ? "..." : "GENERATE A-PASS"}
        </button>
        <button onClick={handleFaucet} disabled={loading !== null || !isMonad} style={btnStyle(true)}>
          {loading === "faucet" ? "..." : "FAUCET aUSDC"}
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(196,84,62,0.08)", border: "1px solid rgba(196,84,62,0.2)", borderRadius: "var(--radius-sm)",
          padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {apass && (
        <div style={{
          background: apass.status === 1 ? "rgba(62,196,138,0.06)" : "rgba(196,84,62,0.06)",
          border: `1px solid ${apass.status === 1 ? "rgba(62,196,138,0.15)" : "rgba(196,84,62,0.15)"}`,
          borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "0.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
              A-PASS STATUS
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600,
              color: apass.status === 1 ? "var(--success)" : "var(--danger)",
              background: apass.status === 1 ? "rgba(62,196,138,0.15)" : "rgba(196,84,62,0.15)",
              padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)",
            }}>
              {apass.status === 1 ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--ink-muted)", display: "block" }}>TIER</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-primary)" }}>{apass.tier} / {apass.subTier}</span>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--ink-muted)", display: "block" }}>GROUP</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-primary)" }}>{apass.group}</span>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--ink-muted)", display: "block" }}>RECORD ID</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-primary)" }}>{apass.cvRecordId.slice(0, 12)}...</span>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--ink-muted)", display: "block" }}>EXPIRES</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-primary)" }}>
                {new Date(apass.expirationTime * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {genResult && (
        <div style={{
          background: "rgba(240,187,64,0.06)", border: "1px solid rgba(240,187,64,0.15)",
          borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "0.5rem",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--accent)", marginBottom: "0.25rem", letterSpacing: "0.06em" }}>
            A-PASS GENERATED
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-secondary)" }}>
            Record: {genResult.cvRecordId.slice(0, 16)}... | Tier: {genResult.tier} | Token: {genResult.atoken.slice(0, 10)}...
          </p>
        </div>
      )}

      {faucetResult && (
        <div style={{
          background: "rgba(62,196,138,0.06)", border: "1px solid rgba(62,196,138,0.15)",
          borderRadius: "var(--radius-sm)", padding: "0.75rem",
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--success)", letterSpacing: "0.06em" }}>
            FAUCET SUCCESSFUL — {faucetResult.amount} {faucetResult.symbol.toUpperCase()}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ink-secondary)", marginTop: "0.2rem" }}>
            TX: {faucetResult.txHash.slice(0, 14)}...
          </p>
        </div>
      )}
    </div>
  );
}

const btnStyle = (secondary: boolean): React.CSSProperties => ({
  background: secondary ? "var(--bg-elevated)" : "var(--accent)",
  color: secondary ? "var(--ink-primary)" : "var(--bg-deep)",
  padding: "0.45rem 0.9rem",
  borderRadius: "var(--radius-sm)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.62rem",
  letterSpacing: "0.06em",
  fontWeight: 500,
  border: secondary ? "1px solid var(--border-muted)" : "none",
  cursor: "pointer",
});
