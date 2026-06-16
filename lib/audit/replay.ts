import type { AuditEntry, Transaction } from "@/lib/types";
import { getAuditLog } from "@/lib/store";

export interface ReplayFrame {
  timestamp: number;
  phase: string;
  label: string;
  details: string;
  agentId?: string;
  vote?: string;
  confidence?: number;
}

export function getReplay(tx: Transaction): ReplayFrame[] {
  const log = getAuditLog(tx.id);
  if (log.length === 0) return [];

  const startTime = tx.createdAt;

  return log.map((entry) => ({
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
