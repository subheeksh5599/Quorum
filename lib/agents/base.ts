import type { AgentVote, Transaction } from "@/lib/types";

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract vote(tx: Transaction): Promise<AgentVote>;

  protected approve(reason: string, confidence: number, evidence: string[] = []): AgentVote {
    return {
      agentId: this.id as AgentVote["agentId"],
      vote: "approve",
      reason,
      confidence,
      evidence,
      timestamp: Date.now(),
    };
  }

  protected reject(reason: string, confidence: number, evidence: string[] = []): AgentVote {
    return {
      agentId: this.id as AgentVote["agentId"],
      vote: "reject",
      reason,
      confidence,
      evidence,
      timestamp: Date.now(),
    };
  }
}
