"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { ethers } from "ethers";

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

const WalletContext = createContext<{
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string | null;
  refreshBalance: () => Promise<void>;
}>({
  wallet: { address: null, chainId: null, isConnected: false },
  connect: async () => {},
  disconnect: () => {},
  balance: null,
  refreshBalance: async () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [balance, setBalance] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function eth(): any | null {
    if (typeof window === "undefined") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).ethereum || null;
  }

  const refreshBalance = useCallback(async () => {
    const e = eth();
    if (!e) return;
    try {
      const raw = await e.request({ method: "eth_getBalance", params: [wallet.address || e.selectedAddress, "latest"] });
      setBalance(ethers.formatEther(BigInt(raw)));
    } catch {
      setBalance(null);
    }
  }, [wallet.address]);

  const connect = useCallback(async () => {
    const e = eth();
    if (!e) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      console.log("[Quorum] requesting accounts...");
      const accounts: string[] = await e.request({ method: "eth_requestAccounts" });
      console.log("[Quorum] got accounts:", accounts);

      if (!accounts || accounts.length === 0) {
        console.error("[Quorum] no accounts returned");
        return;
      }

      const address = accounts[0];
      console.log("[Quorum] address:", address);

      const chainIdHex: string = await e.request({ method: "eth_chainId" });
      console.log("[Quorum] chainIdHex:", chainIdHex);
      const chainId = parseInt(chainIdHex, 16);

      const rawBal: string = await e.request({ method: "eth_getBalance", params: [address, "latest"] });
      console.log("[Quorum] rawBal:", rawBal, typeof rawBal);

      const wei = BigInt(rawBal);
      const formatted = ethers.formatEther(wei);

      setWallet({ address, chainId, isConnected: true });
      setBalance(formatted);
    } catch (err) {
      console.error("[Quorum] connect failed:", err, JSON.stringify(err), String(err));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ address: null, chainId: null, isConnected: false });
    setBalance(null);
    localStorage.removeItem("quorum_wallet");
  }, []);

  useEffect(() => {
    const e = eth();
    if (!e) return;

    // Auto-restore if MetaMask already has authorized accounts
    e.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length === 0) return;
      e.request({ method: "eth_chainId" }).then((id: string) => {
        e.request({ method: "eth_getBalance", params: [accounts[0], "latest"] }).then((raw: string) => {
          setWallet({ address: accounts[0], chainId: parseInt(id, 16), isConnected: true });
          setBalance(ethers.formatEther(BigInt(raw)));
        });
      });
    }).catch(() => {});

    const onAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) {
        setWallet({ address: null, chainId: null, isConnected: false });
        setBalance(null);
        localStorage.removeItem("quorum_wallet");
      }
    };

    const onChainChanged = (chainIdHex: unknown) => {
      setWallet((w) => ({ ...w, chainId: parseInt(chainIdHex as string, 16) }));
    };

    e.on("accountsChanged", onAccountsChanged);
    e.on("chainChanged", onChainChanged);

    return () => {
      e.removeListener("accountsChanged", onAccountsChanged);
      e.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, balance, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}
