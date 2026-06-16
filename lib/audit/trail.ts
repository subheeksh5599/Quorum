import type { Transaction, AgentVote, AuditEntry, JudicialOpinion } from "@/lib/types";

function entry(
  tx: Transaction,
  phase: AuditEntry["phase"],
  details: string,
  extra?: Partial<AuditEntry>
): AuditEntry {
  return {
    id: `${tx.id}-${phase}-${Date.now()}`,
    transactionId: tx.id,
    caseNumber: tx.caseNumber,
    timestamp: Date.now(),
    phase,
    details,
    ...extra,
  };
}

export const audit = {
  created(tx: Transaction): AuditEntry {
    return entry(tx, "created", `Case ${tx.caseNumber} opened — ${tx.purpose.replace(/_/g, " ")} for $${(tx.amount / 1000).toFixed(0)}K to ${tx.counterpartyName}`);
  },

  agentVote(tx: Transaction, vote: AgentVote): AuditEntry {
    return entry(tx, vote.agentId as AuditEntry["phase"], vote.reason, {
      agentId: vote.agentId,
      vote: vote.vote,
      confidence: vote.confidence,
    });
  },

  consensus(tx: Transaction, verdict: string, details: string): AuditEntry {
    return entry(tx, "consensus", `${verdict.toUpperCase()} — ${details}`);
  },

  review(tx: Transaction, opinion: JudicialOpinion): AuditEntry {
    return entry(tx, "review", `Review Judge: ${opinion.verdict === "final_approve" ? "FINAL APPROVE" : "FINAL REJECT"}`, {
      agentId: "review",
    });
  },

  settlement(tx: Transaction): AuditEntry {
    return entry(tx, "settlement", `Settlement recorded for Case ${tx.caseNumber}`);
  },
};
