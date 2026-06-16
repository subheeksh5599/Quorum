import type { AuditEntry, Transaction } from "@/lib/types";

export interface ReplayFrame {
  timestamp: number;
  phase: string;
  label: string;
  details: string;
  agentId?: string;
  vote?: string;
  confidence?: number;
}

export function buildReplay(tx: Transaction, entries: AuditEntry[]): ReplayFrame[] {
  if (entries.length === 0) {
    return [{
      timestamp: tx.createdAt,
      phase: "created",
      label: "Case Opened",
      details: `Case ${tx.caseNumber} opened — ${tx.purpose.replace(/_/g, " ")}`,
    }];
  }

  return entries.map((entry) => ({
    timestamp: entry.timestamp,
    phase: entry.phase,
    label: phaseLabel(entry.phase),
    details: entry.details,
    agentId: entry.agentId,
    vote: entry.vote,
    confidence: entry.confidence,
  }));
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    created: "Case Opened",
    identity: "Identity Verified",
    prosecutor: "Prosecution Filed",
    defense: "Defense Presented",
    risk: "Risk Analysis",
    authorization: "Authorization Check",
    consensus: "Consensus Reached",
    review: "Review Judge Ruled",
    settlement: "Settlement Executed",
  };
  return labels[phase] || phase;
}
