import type { DataProvider, CreateTxInput, Stats } from "./provider";
import type {
  Transaction,
  AgentVote,
  AuditEntry,
  Dispute,
  PrecedentCase,
  CaseStatus,
} from "../types";
import { isConfigured, queryTxs } from "../cleanverse/client";

const _txCache = new Map<string, Transaction>();
const _voteCache = new Map<string, AgentVote[]>();
const _auditCache: AuditEntry[] = [];
const _disputeCache: Dispute[] = [];
let _precedentCache: PrecedentCase[] = [];
let _caseNum = 0;

export const cleanverseProvider: DataProvider = {
  createTransaction(input: CreateTxInput): Transaction {
    _caseNum++;
    const id = `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tx: Transaction = {
      id,
      caseNumber: `CV-2026-${String(_caseNum).padStart(3, "0")}`,
      amount: input.amount,
      currency: input.currency,
      country: input.country,
      counterparty: input.counterparty,
      counterpartyName: input.counterpartyName,
      purpose: input.purpose,
      chain: input.chain,
      status: "voting",
      createdAt: Date.now(),
    };

    _txCache.set(id, tx);
    return tx;
  },

  async getTransaction(id: string) {
    const cached = _txCache.get(id);
    if (cached) return cached;

    if (!isConfigured()) return null;
    // TODO: GET from Cleanverse when API supports it
    return null;
  },

  async getAllTransactions() {
    const cached = Array.from(_txCache.values()).sort((a, b) => b.createdAt - a.createdAt);
    if (cached.length > 0) return cached;

    if (!isConfigured()) return [];
    // TODO: GET from Cleanverse
    return [];
  },

  async updateTransactionStatus(
    id: string,
    status: CaseStatus,
    updates?: Partial<Transaction>
  ) {
    const tx = _txCache.get(id);
    if (tx) {
      const updated = { ...tx, status, ...updates };
      _txCache.set(id, updated);
      return updated;
    }
    return null;
  },

  async saveVotes(txId: string, votes: AgentVote[]) {
    _voteCache.set(txId, votes);
  },

  async getVotes(txId: string) {
    return _voteCache.get(txId) || [];
  },

  async appendAudit(entry: AuditEntry) {
    _auditCache.push(entry);
  },

  async getAuditLog(txId: string) {
    return _auditCache.filter((e) => e.transactionId === txId);
  },

  async getAllAuditLog() {
    return _auditCache;
  },

  async saveDispute(dispute: Dispute) {
    _disputeCache.push(dispute);
  },

  async getDisputes() {
    return _disputeCache.sort((a, b) => {
      const ta = a.resolvedAt || 0;
      const tb = b.resolvedAt || 0;
      return tb - ta;
    });
  },

  async getDispute(txId: string) {
    return _disputeCache.find((d) => d.transactionId === txId) || null;
  },

  async resolveDispute(txId: string, resolvedAt: number) {
    const d = _disputeCache.find((dp) => dp.transactionId === txId);
    if (d) d.resolvedAt = resolvedAt;
    return d || null;
  },

  async loadPrecedents(cases: PrecedentCase[]) {
    _precedentCache = cases;
  },

  async getPrecedents() {
    return _precedentCache;
  },

  async addPrecedent(c: PrecedentCase) {
    _precedentCache.push(c);
  },

  async getStats() {
    const allTxs = Array.from(_txCache.values());
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
      precedentCount: _precedentCache.length,
    };
  },

  nextCaseNumber() {
    _caseNum++;
    return `CV-2026-${String(_caseNum).padStart(3, "0")}`;
  },
};
