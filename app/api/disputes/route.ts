import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/data";

export async function GET() {
  const provider = getProvider();
  return NextResponse.json({ disputes: await provider.getDisputes() });
}
