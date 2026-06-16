"use client";

import { useWallet } from "@/lib/wallet";

const MONAD_TESTNET_ID = 10143;

export default function WalletButton() {
  const { wallet, balance, connect, disconnect } = useWallet();
  const { address, isConnected, chainId } = wallet;
  const isMonad = chainId === MONAD_TESTNET_ID;

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {balance && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--accent)",
            fontWeight: 500,
          }}>
            {parseFloat(balance).toFixed(4)} MON
          </span>
        )}
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--ink-primary)",
          background: isMonad ? "rgba(62,196,138,0.08)" : "rgba(196,154,60,0.08)",
          padding: "0.3rem 0.6rem",
          borderRadius: "var(--radius-sm)",
          letterSpacing: "0.04em",
        }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {!isMonad && chainId && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            background: "var(--danger)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.2rem 0.5rem",
            letterSpacing: "0.04em",
          }}>
            WRONG NETWORK
          </span>
        )}
        <button
          onClick={disconnect}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            background: "none",
            color: "var(--ink-secondary)",
            border: "1px solid var(--border-muted)",
            borderRadius: "var(--radius-sm)",
            padding: "0.3rem 0.75rem",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      style={{
        background: "var(--accent)",
        color: "var(--bg-deep)",
        padding: "0.4rem 1.2rem",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        letterSpacing: "0.06em",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
      }}
    >
      CONNECT WALLET
    </button>
  );
}
