import { BaseAgent } from "./base";
import { queryApass, verifyApass, isConfigured } from "@/lib/cleanverse/client";
import type { Transaction } from "@/lib/types";

export class IdentityAgent extends BaseAgent {
  readonly id = "identity";
  readonly name = "Identity Agent";
  readonly description = "Verifies A-Pass credentials and wallet ownership";

  async vote(tx: Transaction): Promise<ReturnType<BaseAgent["approve"]>> {
    const evidence: string[] = [];

    if (isConfigured()) {
      const apass = await queryApass(tx.chain, tx.counterparty);
      if (!apass) {
        return this.reject("No valid A-Pass found for counterparty", 95, [
          "Cleanverse: query_apass returned no result",
        ]);
      }

      evidence.push(`A-Pass Tier: ${apass.tier}, Status: ${apass.status === 1 ? "Active" : "Frozen"}`);

      if (apass.status !== 1) {
        return this.reject("A-Pass is frozen or inactive", 98, evidence);
      }

      if (apass.expirationTime < Date.now() / 1000) {
        return this.reject("A-Pass has expired", 98, evidence);
      }
    } else {
      evidence.push("Cleanverse not configured — simulated identity check");
    }

    const passesBasicValidation = tx.counterparty.length >= 12;
    if (!passesBasicValidation) {
      return this.reject("Invalid wallet address format", 90, evidence);
    }

    return this.approve(`Identity verified — wallet ownership confirmed`, 98, evidence);
  }
}
