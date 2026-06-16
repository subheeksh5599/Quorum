import type { DataProvider, CreateTxInput, Stats } from "./provider";
import type {
  Transaction,
  AgentVote,
  AuditEntry,
  Dispute,
  PrecedentCase,
  CaseStatus,
} from "../types";
import {
  saveTransaction,
  getTransaction,
  getAllTransactions,
  updateTransactionStatus,
  saveVotes,
  getVotes,
  appendAuditEntry,
  getAuditLog,
  getAllAuditLog,
  saveDispute,
  getDisputes,
  getDispute,
  resolveDispute,
  loadPrecedents,
  getPrecedents,
  addPrecedent,
  getStats,
  nextCaseNumber,
} from "../store";

export const memoryProvider: DataProvider = {
  createTransaction(input: CreateTxInput): Transaction {
    const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const caseNumber = nextCaseNumber();

    const tx: Transaction = {
      id,
      caseNumber,
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

    saveTransaction(tx);
    return tx;
  },

  getTransaction(id: string) {
    return Promise.resolve(getTransaction(id) ?? null);
  },

  getAllTransactions() {
    return Promise.resolve(getAllTransactions());
  },

  updateTransactionStatus(id: string, status: CaseStatus, updates?: Partial<Transaction>) {
    const result = updateTransactionStatus(id, status, updates);
    return Promise.resolve(result ?? null);
  },

  saveVotes(txId: string, votes: AgentVote[]) {
    saveVotes(txId, votes);
    return Promise.resolve();
  },

  getVotes(txId: string) {
    return Promise.resolve(getVotes(txId));
  },

  appendAudit(entry: AuditEntry) {
    appendAuditEntry(entry);
    return Promise.resolve();
  },

  getAuditLog(txId: string) {
    return Promise.resolve(getAuditLog(txId));
  },

  getAllAuditLog() {
    return Promise.resolve(getAllAuditLog());
  },

  saveDispute(dispute: Dispute) {
    saveDispute(dispute);
    return Promise.resolve();
  },

  getDisputes() {
    return Promise.resolve(getDisputes());
  },

  getDispute(txId: string) {
    return Promise.resolve(getDispute(txId) ?? null);
  },

  resolveDispute(txId: string, resolvedAt: number) {
    const result = resolveDispute(txId, resolvedAt);
    return Promise.resolve(result ?? null);
  },

  loadPrecedents(cases: PrecedentCase[]) {
    loadPrecedents(cases);
    return Promise.resolve();
  },

  getPrecedents() {
    return Promise.resolve(getPrecedents());
  },

  addPrecedent(c: PrecedentCase) {
    addPrecedent(c);
    return Promise.resolve();
  },

  getStats() {
    return Promise.resolve(getStats());
  },

  nextCaseNumber() {
    return nextCaseNumber();
  },
};
