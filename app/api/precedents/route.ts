import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";
import { search } from "@/lib/precedent";
import type { Transaction } from "@/lib/types";

export async function GET(req: NextRequest) {
  const provider = getProvider();
  const url = new URL(req.url);
  const searchQuery = url.searchParams.get("q");
  const country = url.searchParams.get("country");
  const purpose = url.searchParams.get("purpose");
  const txId = url.searchParams.get("txId");

  if (txId) {
    const tx = await provider.getTransaction(txId);
    if (tx) {
      const matches = search(tx, 14);
      return NextResponse.json({ matches });
    }
  }

  if (searchQuery || country || purpose) {
    const mockTx: Transaction = {
      id: "search",
      caseNumber: "SEARCH",
      amount: 500000,
      currency: "USD",
      country: country || "US",
      counterparty: "",
      counterpartyName: searchQuery || "",
      purpose: purpose || "supplier_payment",
      chain: "monad",
      status: "pending",
      createdAt: Date.now(),
    };
    const matches = search(mockTx, 14);
    return NextResponse.json({ matches });
  }

  return NextResponse.json({ cases: await provider.getPrecedents() });
}
