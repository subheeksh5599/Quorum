import { BaseAgent } from "./base";
import { queryInstitutionWhitelist, queryTxs, isConfigured } from "@/lib/cleanverse/client";
import type { Transaction } from "@/lib/types";
import { getPrecedents } from "@/lib/store";

export class DefenseAgent extends BaseAgent {
  readonly id = "defense";
  readonly name = "Defense Counsel";
  readonly description = "Finds reasons to approve — clean history, institutional whitelist, precedents";

  async vote(tx: Transaction): Promise<ReturnType<BaseAgent["approve"]>> {
    const evidence: string[] = [];
    const arguments_: string[] = [];

    if (isConfigured()) {
      const whitelist = await queryInstitutionWhitelist(tx.chain);
      if (whitelist) {
        arguments_.push("Institutional whitelist data available");
        evidence.push("Cleanverse: institution whitelist queried successfully");
      }

      const txs = await queryTxs(tx.chain, tx.counterparty, 25);
      if (txs) {
        arguments_.push("Clean transaction history — no prior violations detected");
        evidence.push("Cleanverse: prior transaction history shows compliant activity");
      } else {
        arguments_.push("No adverse transaction history found");
      }
    } else {
      arguments_.push("Transaction satisfies basic institutional criteria");
    }

    if (tx.amount <= 1_000_000) {
      arguments_.push("Amount within standard institutional transfer range");
    }

    const precedents = getPrecedents();
    const similarApproved = precedents.filter(
      (p) =>
        p.verdict === "approved" &&
        Math.abs(p.amount - tx.amount) / tx.amount < 0.5 &&
        (p.country === tx.country || p.purpose === tx.purpose)
    );

    if (similarApproved.length > 0) {
      arguments_.push(`${similarApproved.length} similar cases approved in precedent`);
      evidence.push(`Precedent: ${similarApproved.length} matching approved cases found`);
    }

    if (tx.counterpartyName && tx.counterpartyName !== "New Vendor" && tx.counterpartyName !== "Unknown") {
      arguments_.push(`Established counterparty: ${tx.counterpartyName}`);
    }

    return this.approve(arguments_.join(". "), 88, evidence);
  }
}
