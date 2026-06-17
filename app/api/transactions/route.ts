import { NextRequest, NextResponse } from "next/server";
import { runConsensus } from "@/lib/engine/consensus";
import { getProvider } from "@/lib/data";
import type { Transaction } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const provider = getProvider();
    const body = await req.json();
    const { amount, country, counterparty, counterpartyName, purpose, chain, currency } = body;

    if (!amount || !country || !counterparty) {
      return NextResponse.json({ error: "amount, country, and counterparty are required" }, { status: 400 });
    }

    const tx = await provider.createTransaction({
      amount: Number(amount),
      currency: currency || "USD",
      country: country.toUpperCase(),
      counterparty,
      counterpartyName: counterpartyName || "Unknown",
      purpose: purpose || "supplier_payment",
      chain: chain || "monad",
    });

    const result = await runConsensus(tx);

    return NextResponse.json({
      success: true,
      transaction: tx,
      consensus: result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const provider = getProvider();
  const [transactions, stats] = await Promise.all([
    provider.getAllTransactions(),
    provider.getStats(),
  ]);
  return NextResponse.json({ transactions, stats });
}
