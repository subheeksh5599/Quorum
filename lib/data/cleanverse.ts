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

/**
 * Cleanverse data provider.
 *
 * When CLEANVERSE_API_ID + CLEANVERSE_API_KEY are set,
 * transactions/votes/audit/disputes are persisted to Cleanverse.
 *
 * Currently stubbed — fill in the real API calls when your
 * Cleanverse endpoint is ready.
 */
export const cleanverseProvider: DataProvider = {
  createTransaction(input: CreateTxInput): Transaction {
    if (!isConfigured()) {
      throw new Error("Cleanverse API not configured");
    }

    // TODO: POST /transactions to Cleanverse
    // const result = await postEncrypted("/transactions/create", input);
    // return mapToTransaction(result.data);

    const id = `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      caseNumber: `CV-2026-${String(Date.now() % 1000).padStart(3, "0")}`,
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
  },

  async getTransaction(id: string) {
    if (!isConfigured()) return null;
    // TODO: GET /transactions/:id from Cleanverse
    return null;
  },

  async getAllTransactions() {
    if (!isConfigured()) return [];
    // TODO: GET /transactions from Cleanverse
    return [];
  },

  async updateTransactionStatus(
    id: string,
    status: CaseStatus,
    updates?: Partial<Transaction>
  ) {
    if (!isConfigured()) return null;
    // TODO: PATCH /transactions/:id on Cleanverse
    return null;
  },

  async saveVotes(txId: string, votes: AgentVote[]) {
    if (!isConfigured()) return;
    // TODO: POST /transactions/:id/votes on Cleanverse
  },

  async getVotes(txId: string) {
    if (!isConfigured()) return [];
    // TODO: GET /transactions/:id/votes from Cleanverse
    return [];
  },

  async appendAudit(entry: AuditEntry) {
    if (!isConfigured()) return;
    // TODO: POST /audit on Cleanverse
  },

  async getAuditLog(txId: string) {
    if (!isConfigured()) return [];
    // TODO: GET /audit?txId=:id from Cleanverse
    return [];
  },

  async getAllAuditLog() {
    if (!isConfigured()) return [];
    // TODO: GET /audit from Cleanverse
    return [];
  },

  async saveDispute(dispute: Dispute) {
    if (!isConfigured()) return;
    // TODO: POST /disputes on Cleanverse
  },

  async getDisputes() {
    if (!isConfigured()) return [];
    // TODO: GET /disputes from Cleanverse
    return [];
  },

  async getDispute(txId: string) {
    if (!isConfigured()) return null;
    // TODO: GET /disputes/:txId from Cleanverse
    return null;
  },

  async resolveDispute(txId: string, resolvedAt: number) {
    if (!isConfigured()) return null;
    // TODO: PATCH /disputes/:txId on Cleanverse
    return null;
  },

  async loadPrecedents(cases: PrecedentCase[]) {
    if (!isConfigured()) return;
    // TODO: Seed precedents on Cleanverse
  },

  async getPrecedents() {
    if (!isConfigured()) return [];
    // TODO: GET /precedents from Cleanverse
    return [];
  },

  async addPrecedent(c: PrecedentCase) {
    if (!isConfigured()) return;
    // TODO: POST /precedents on Cleanverse
  },

  async getStats() {
    if (!isConfigured()) {
      return {
        totalCases: 0,
        approved: 0,
        blocked: 0,
        disputed: 0,
        totalValue: 0,
        consensusRate: 0,
        activeAgents: 6,
        precedentCount: 0,
      };
    }
    // TODO: GET /stats from Cleanverse
    return {
      totalCases: 0,
      approved: 0,
      blocked: 0,
      disputed: 0,
      totalValue: 0,
      consensusRate: 0,
      activeAgents: 6,
      precedentCount: 0,
    };
  },

  nextCaseNumber() {
    return `CV-2026-${String(Date.now() % 1000).padStart(3, "0")}`;
  },
};
