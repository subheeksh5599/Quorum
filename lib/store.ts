import type {
  Transaction,
  AgentVote,
  AuditEntry,
  Dispute,
  PrecedentCase,
  ConsensusResult,
  CaseStatus,
} from "./types";

const transactions = new Map<string, Transaction>();
const votes = new Map<string, AgentVote[]>();
const auditLog: AuditEntry[] = [];
const disputes: Dispute[] = [];
const precedents: PrecedentCase[] = [];
let caseCounter = 0;

export function nextCaseNumber(): string {
  caseCounter++;
  return `TRB-2026-${String(caseCounter).padStart(3, "0")}`;
}

export function getCaseCounter(): number {
  return caseCounter;
}

export function saveTransaction(tx: Transaction): void {
  transactions.set(tx.id, tx);
}

export function getTransaction(id: string): Transaction | undefined {
  return transactions.get(id);
}

export function getAllTransactions(): Transaction[] {
  return Array.from(transactions.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function updateTransactionStatus(
  id: string,
  status: CaseStatus,
  updates?: Partial<Transaction>
): Transaction | undefined {
  const tx = transactions.get(id);
  if (!tx) return undefined;
  const updated = { ...tx, status, ...updates };
  transactions.set(id, updated);
  return updated;
}

export function saveVotes(transactionId: string, agentVotes: AgentVote[]): void {
  votes.set(transactionId, agentVotes);
}

export function getVotes(transactionId: string): AgentVote[] {
  return votes.get(transactionId) || [];
}

export function appendAuditEntry(entry: AuditEntry): void {
  auditLog.push(entry);
}

export function getAuditLog(transactionId: string): AuditEntry[] {
  return auditLog.filter((e) => e.transactionId === transactionId);
}

export function getAllAuditLog(): AuditEntry[] {
  return auditLog;
}

export function saveDispute(dispute: Dispute): void {
  disputes.push(dispute);
}

export function getDisputes(): Dispute[] {
  return disputes.sort((a, b) => {
    const ta = a.resolvedAt || 0;
    const tb = b.resolvedAt || 0;
    return tb - ta;
  });
}

export function getDispute(transactionId: string): Dispute | undefined {
  return disputes.find((d) => d.transactionId === transactionId);
}

export function resolveDispute(transactionId: string, resolvedAt: number): Dispute | undefined {
  const d = disputes.find((dp) => dp.transactionId === transactionId);
  if (d) d.resolvedAt = resolvedAt;
  return d;
}

export function loadPrecedents(cases: PrecedentCase[]): void {
  precedents.length = 0;
  precedents.push(...cases);
}

export function getPrecedents(): PrecedentCase[] {
  return precedents;
}

export function addPrecedent(c: PrecedentCase): void {
  precedents.push(c);
}

export function getStats() {
  const allTxs = getAllTransactions();
  const approved = allTxs.filter((t) => t.status === "approved").length;
  const blocked = allTxs.filter((t) => t.status === "blocked").length;
  const disputedTxs = allTxs.filter((t) => t.status === "disputed" || t.status === "under_review").length;
  const totalValue = allTxs.reduce((sum, t) => sum + t.amount, 0);

  return {
    totalCases: allTxs.length,
    approved,
    blocked,
    disputed: disputedTxs,
    totalValue,
    consensusRate: allTxs.length > 0 ? Math.round(((approved + blocked) / allTxs.length) * 100) : 0,
    activeAgents: 6,
    precedentCount: precedents.length,
  };
}

export { caseCounter };
