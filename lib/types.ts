export type AgentId = "identity" | "prosecutor" | "defense" | "risk" | "authorization" | "review";
export type VoteValue = "approve" | "reject";
export type CaseStatus = "pending" | "voting" | "approved" | "blocked" | "disputed" | "under_review";
export type VerdictStatus = "approved" | "blocked" | "disputed";
export type Phase =
  | "created"
  | "identity"
  | "prosecutor"
  | "defense"
  | "risk"
  | "authorization"
  | "consensus"
  | "review"
  | "settlement";

export interface Transaction {
  id: string;
  caseNumber: string;
  amount: number;
  currency: string;
  country: string;
  counterparty: string;
  counterpartyName: string;
  purpose: string;
  chain: string;
  status: CaseStatus;
  verdict?: VerdictStatus;
  reviewOpinion?: JudicialOpinion;
  createdAt: number;
  completedAt?: number;
}

export interface AgentVote {
  agentId: AgentId;
  vote: VoteValue;
  reason: string;
  confidence: number;
  evidence: string[];
  timestamp: number;
}

export interface PrecedentCase {
  caseNumber: string;
  amount: number;
  currency: string;
  country: string;
  counterpartyType: "institution" | "vendor" | "ai_agent" | "unknown";
  counterpartyName: string;
  purpose: string;
  chain: string;
  prosecutorArg: string;
  defenseArg: string;
  riskAssessment: string;
  authorizationCheck: string;
  votes: Record<string, VoteValue>;
  verdict: VerdictStatus;
  reviewOpinion?: string;
  tags: string[];
  timestamp: number;
}

export interface JudicialOpinion {
  caseNumber: string;
  prosecutorArgument: string;
  defenseArgument: string;
  riskFindings: string;
  precedentAnalysis: string;
  authorizationFindings: string;
  reasoning: string[];
  verdict: "final_approve" | "final_reject";
  issuedAt: number;
}

export interface AuditEntry {
  id: string;
  transactionId: string;
  caseNumber: string;
  timestamp: number;
  phase: Phase;
  agentId?: AgentId;
  vote?: VoteValue;
  reason?: string;
  confidence?: number;
  details: string;
}

export interface Dispute {
  transactionId: string;
  caseNumber: string;
  approvingAgents: AgentId[];
  rejectingAgents: AgentId[];
  prosecutorVote: AgentVote;
  defenseVote: AgentVote;
  reviewOpinion?: JudicialOpinion;
  resolvedAt?: number;
}

export interface PrecedentMatch {
  case: PrecedentCase;
  similarityScore: number;
  matchedOn: string[];
}

export interface ConsensusResult {
  status: VerdictStatus;
  votes: AgentVote[];
  allApproved: boolean;
  anyRejected: boolean;
  dispute?: Dispute;
  reviewOpinion?: JudicialOpinion;
  precedents?: PrecedentMatch[];
  auditLog: AuditEntry[];
}

export interface AppState {
  transactions: Transaction[];
  precedents: PrecedentCase[];
  disputes: Dispute[];
  auditLog: AuditEntry[];
  caseCounter: number;
}
