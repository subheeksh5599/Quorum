import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";
import { buildReplay } from "@/lib/audit/replay";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = getProvider();
  const { id } = await params;
  const tx = await provider.getTransaction(id);
  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const entries = await provider.getAuditLog(id);
  const frames = buildReplay(tx, entries);
  return NextResponse.json({ caseNumber: tx.caseNumber, frames });
}
