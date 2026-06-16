import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = getProvider();
  const { id } = await params;
  const precedents = await provider.getPrecedents();
  const c = precedents.find((p) => p.caseNumber === id);
  if (!c) {
    return NextResponse.json({ error: "Precedent not found" }, { status: 404 });
  }
  return NextResponse.json({ case: c });
}
