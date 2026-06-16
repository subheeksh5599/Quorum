import { NextResponse } from "next/server";

const agents = [
  { id: "identity", name: "Identity Agent", description: "Verifies A-Pass credentials and wallet ownership", icon: "shield", color: "var(--accent)" },
  { id: "prosecutor", name: "Prosecutor", description: "Finds reasons to reject — sanctions, jurisdiction, suspicious patterns", icon: "scale", color: "var(--danger)" },
  { id: "defense", name: "Defense Counsel", description: "Finds reasons to approve — clean history, institutional whitelist, precedents", icon: "shield-check", color: "var(--success)" },
  { id: "risk", name: "Risk Agent", description: "Analyzes amount, country exposure, and transaction velocity", icon: "chart", color: "var(--warning)" },
  { id: "authorization", name: "Authorization Agent", description: "Enforces spending mandates and organizational policy limits", icon: "lock", color: "var(--ink-secondary)" },
  { id: "review", name: "Review Judge", description: "Issues binding judicial opinion when agents disagree", icon: "gavel", color: "var(--ink-primary)" },
];

export async function GET() {
  return NextResponse.json({ agents });
}
