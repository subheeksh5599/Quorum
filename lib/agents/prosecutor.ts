import { BaseAgent } from "./base";
import { validatorVerify, isConfigured } from "@/lib/cleanverse/client";
import type { Transaction } from "@/lib/types";

const SANCTIONS_JURISDICTIONS = new Set(["IR", "KP", "SY", "CU", "MM"]);

export class ProsecutorAgent extends BaseAgent {
  readonly id = "prosecutor";
  readonly name = "Prosecutor";
  readonly description = "Finds reasons to reject — sanctions, jurisdiction, suspicious patterns";

  async vote(tx: Transaction): Promise<ReturnType<BaseAgent["approve"]>> {
    const evidence: string[] = [];
    const concerns: string[] = [];

    if (SANCTIONS_JURISDICTIONS.has(tx.country.toUpperCase())) {
      concerns.push(`Restricted jurisdiction: ${tx.country}`);
      evidence.push(`Country ${tx.country} is on international sanctions list`);
    }

    if (tx.amount > 2_000_000) {
      concerns.push(`Exceptionally large transaction: $${(tx.amount / 1_000_000).toFixed(1)}M`);
      evidence.push(`Amount exceeds $2M threshold for automated approval`);
    } else if (tx.amount > 100_000) {
      concerns.push(`Large transaction amount: $${(tx.amount / 1_000).toFixed(0)}K`);
      evidence.push(`Amount over $100K — elevated scrutiny required`);
    }

    if (tx.counterparty.length < 20) {
      concerns.push("Counterparty wallet appears non-standard or unverified");
      evidence.push("Wallet address shorter than expected for institutional use");
    }

    if (tx.purpose.toLowerCase().includes("procurement") && tx.counterpartyName === "New Vendor") {
      concerns.push("AI procurement from unverified counterparty");
      evidence.push("First-time transaction with AI-sourced vendor");
    }

    if (isConfigured()) {
      const verify = await validatorVerify(tx.chain, tx.counterparty, tx.counterparty);
      if (verify) {
        evidence.push(`Validator compliance check: ${verify.valid ? "PASSED" : "FAILED"}`);
        if (!verify.valid) {
          concerns.push("Validator compliance pool check failed");
        }
      }
    }

    if (concerns.length > 0) {
      return this.reject(concerns.join("; "), 85, evidence);
    }

    return this.approve("No sanctions, jurisdiction, or pattern concerns found", 92, evidence);
  }
}
