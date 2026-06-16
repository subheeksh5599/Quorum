import { BaseAgent } from "./base";
import type { Transaction } from "@/lib/types";

const HIGH_RISK_COUNTRIES = new Set(["IR", "KP", "SY", "CU", "MM", "VE", "BY", "AF"]);
const MODERATE_RISK_COUNTRIES = new Set(["NG", "PK", "YE", "SD", "SO", "ET"]);

export class RiskAgent extends BaseAgent {
  readonly id = "risk";
  readonly name = "Risk Agent";
  readonly description = "Analyzes amount, country exposure, and transaction velocity";

  async vote(tx: Transaction): Promise<ReturnType<BaseAgent["approve"]>> {
    const evidence: string[] = [];
    const flags: string[] = [];

    const country = tx.country.toUpperCase();
    if (HIGH_RISK_COUNTRIES.has(country)) {
      flags.push(`High-risk jurisdiction: ${country}`);
      evidence.push(`Country ${country} classified as high-risk`);
    } else if (MODERATE_RISK_COUNTRIES.has(country)) {
      evidence.push(`Country ${country} classified as moderate-risk`);
    }

    if (tx.amount > 5_000_000) {
      flags.push(`Extreme value transfer — exceeds $5M risk threshold`);
      evidence.push("Amount exceeds extreme threshold");
    } else if (tx.amount > 500_000) {
      flags.push(`Large value transfer — exceeds $500K risk threshold`);
      evidence.push("Large value transfer — elevated monitoring");
    }

    if (tx.chain === "solana") {
      evidence.push("Solana chain — standard risk profile");
    }

    if (tx.purpose === "ai_procurement" && tx.counterpartyName === "New Vendor") {
      flags.push("AI procurement from unknown vendor");
      evidence.push("First-time transaction with unverified AI vendor");
    }

    if (flags.length >= 2) {
      return this.reject(`Multiple risk flags: ${flags.join("; ")}`, 80, evidence);
    }

    if (flags.length === 1 && (HIGH_RISK_COUNTRIES.has(country) || tx.amount > 5_000_000)) {
      return this.reject(`Unacceptable risk — ${flags[0]}`, 82, evidence);
    }

    const riskLabel = flags.length === 0 ? "low" : "moderate";
    return this.approve(
      `Risk assessment: ${riskLabel} — within acceptable threshold`,
      flags.length === 0 ? 90 : 75,
      evidence
    );
  }
}
