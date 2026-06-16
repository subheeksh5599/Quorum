import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = getProvider();
  const { id } = await params;
  const dispute = await provider.getDispute(id);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }
  return NextResponse.json({ dispute });
}
