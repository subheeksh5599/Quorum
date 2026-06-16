import type {
  Transaction,
  AgentVote,
  AuditEntry,
  Dispute,
  PrecedentCase,
  VerdictStatus,
  CaseStatus,
} from "../types";

export interface Stats {
  totalCases: number;
  approved: number;
  blocked: number;
  disputed: number;
  totalValue: number;
  consensusRate: number;
  activeAgents: number;
  precedentCount: number;
}

export interface CreateTxInput {
  amount: number;
  currency: string;
  country: string;
  counterparty: string;
  counterpartyName: string;
  purpose: string;
  chain: string;
}

export interface DataProvider {
  createTransaction(input: CreateTxInput): Transaction | Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | null>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(
    id: string,
    status: CaseStatus,
    updates?: Partial<Transaction>
  ): Promise<Transaction | null>;

  saveVotes(txId: string, votes: AgentVote[]): Promise<void>;
  getVotes(txId: string): Promise<AgentVote[]>;

  appendAudit(entry: AuditEntry): Promise<void>;
  getAuditLog(txId: string): Promise<AuditEntry[]>;
  getAllAuditLog(): Promise<AuditEntry[]>;

  saveDispute(dispute: Dispute): Promise<void>;
  getDisputes(): Promise<Dispute[]>;
  getDispute(txId: string): Promise<Dispute | null>;
  resolveDispute(txId: string, resolvedAt: number): Promise<Dispute | null>;

  loadPrecedents(cases: PrecedentCase[]): Promise<void>;
  getPrecedents(): Promise<PrecedentCase[]>;
  addPrecedent(c: PrecedentCase): Promise<void>;

  getStats(): Promise<Stats>;
  nextCaseNumber(): string;
}
