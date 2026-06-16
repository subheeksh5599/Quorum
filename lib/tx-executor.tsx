"use client";

import { ethers } from "ethers";

const MONAD_TESTNET = {
  chainId: 10143,
  rpcUrl: "https://testnet-rpc.monad.xyz",
};

export interface TxReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  effectiveGasPrice: string;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  totalCostEth: string;
  totalCostUsd: string;
}

export async function getEthersProvider(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === "undefined") return null;
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
  if (!ethereum) return null;
  return new ethers.BrowserProvider(ethereum);
}

export async function estimateGas(
  to: string,
  valueEth: string
): Promise<GasEstimate | null> {
  try {
    const provider = await getEthersProvider();
    if (!provider) throw new Error("No wallet");

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");

    const gasLimit = 21000n;

    const totalCost = gasLimit * gasPrice;
    const totalEth = ethers.formatEther(totalCost);
    const monPrice = 0.15;
    const totalUsd = (parseFloat(totalEth) * monPrice).toFixed(4);

    return {
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(gasPrice, "gwei"),
      totalCostEth: totalEth,
      totalCostUsd: totalUsd,
    };
  } catch {
    return null;
  }
}

export async function sendTransaction(
  to: string,
  valueEth: string,
  data?: string
): Promise<TxReceipt> {
  const provider = await getEthersProvider();
  if (!provider) throw new Error("Wallet not connected");

  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== MONAD_TESTNET.chainId) {
    throw new Error(`Wrong network. Please switch to Monad Testnet (chain ${MONAD_TESTNET.chainId})`);
  }

  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(valueEth || "0"),
    data: data || "0x",
  });

  const receipt = await tx.wait();
  if (!receipt) throw new Error("Transaction failed — no receipt");

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.gasPrice.toString(),
  };
}

export async function sendMemoTransaction(
  to: string,
  memo: string
): Promise<TxReceipt> {
  const data = ethers.hexlify(ethers.toUtf8Bytes(memo));
  return sendTransaction(to, "0", data);
}

export { MONAD_TESTNET };
