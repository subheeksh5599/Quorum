import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";

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

  return NextResponse.json({
    transaction: tx,
    votes: await provider.getVotes(id),
    auditLog: await provider.getAuditLog(id),
  });
}
