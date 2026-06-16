import { BaseAgent } from "./base";
import type { Transaction } from "@/lib/types";

const MANDATE_LIMITS: Record<string, { maxPerTx: number; daily: number; requireDefense: number }> = {
  default: { maxPerTx: 1_000_000, daily: 5_000_000, requireDefense: 250_000 },
  ai_procurement: { maxPerTx: 500_000, daily: 2_000_000, requireDefense: 100_000 },
  treasury_transfer: { maxPerTx: 5_000_000, daily: 25_000_000, requireDefense: 1_000_000 },
};

export class AuthorizationAgent extends BaseAgent {
  readonly id = "authorization";
  readonly name = "Authorization Agent";
  readonly description = "Enforces spending mandates and organizational policy limits";

  async vote(tx: Transaction): Promise<ReturnType<BaseAgent["approve"]>> {
    const evidence: string[] = [];
    const limits = MANDATE_LIMITS[tx.purpose] || MANDATE_LIMITS.default;

    if (tx.amount > limits.maxPerTx) {
      return this.reject(
        `Amount $${(tx.amount / 1_000_000).toFixed(2)}M exceeds per-transaction mandate of $${(limits.maxPerTx / 1_000_000).toFixed(1)}M`,
        96,
        [`Mandate limit: $${(limits.maxPerTx / 1_000_000).toFixed(1)}M max per transaction`]
      );
    }

    if (tx.amount > limits.requireDefense) {
      evidence.push(
        `Transaction requires defense review — above $${(limits.requireDefense / 1_000_000).toFixed(1)}M threshold`
      );
    }

    if (tx.purpose === "ai_procurement" && tx.counterpartyName === "New Vendor") {
      return this.reject(
        "AI procurement from unverified vendor exceeds authorization limits",
        90,
        ["AI procurement mandate: unverified vendors not authorized"]
      );
    }

    evidence.push(
      `Mandate: ${tx.purpose.replace(/_/g, " ")}, per-tx limit: $${(limits.maxPerTx / 1_000_000).toFixed(1)}M`
    );

    return this.approve(
      `Within spending mandate — ${tx.purpose.replace(/_/g, " ")} authorization valid`,
      94,
      evidence
    );
  }
}
