import type { PrecedentCase, PrecedentMatch, Transaction } from "@/lib/types";
import { getPrecedents } from "@/lib/store";

interface IndexEntry {
  case: PrecedentCase;
  tokens: Set<string>;
}

let index: IndexEntry[] = [];

function tokenize(str: string): string[] {
  return str.toLowerCase().split(/[\s_]+/);
}

function buildIndex(cases: PrecedentCase[]): void {
  index = cases.map((c) => {
    const tokens = new Set<string>([
      ...tokenize(c.purpose),
      ...tokenize(c.country),
      ...tokenize(c.counterpartyType),
      ...tokenize(c.verdict),
      ...c.tags.map((t) => t.toLowerCase()),
      c.amount < 100_000 ? "low_value"
        : c.amount < 1_000_000 ? "mid_value"
        : c.amount < 3_000_000 ? "high_value"
        : "extreme_value",
    ]);
    return { case: c, tokens };
  });
}

export function loadPrecedents(cases: PrecedentCase[]): void {
  buildIndex(cases);
}

export function search(tx: Transaction, limit: number = 5): PrecedentMatch[] {
  const cases = getPrecedents();
  if (cases.length !== index.length) {
    buildIndex(cases);
  }

  const queryTokens = new Set([
    ...tokenize(tx.purpose),
    ...tokenize(tx.country),
    ...tokenize(tx.counterpartyName || ""),
    tx.amount < 100_000 ? "low_value"
      : tx.amount < 1_000_000 ? "mid_value"
      : tx.amount < 3_000_000 ? "high_value"
      : "extreme_value",
  ]);

  const results: PrecedentMatch[] = [];

  for (const entry of index) {
    let score = 0;
    const matchedOn: string[] = [];

    for (const token of queryTokens) {
      if (entry.tokens.has(token)) {
        score += 1;
        matchedOn.push(token);
      }
    }

    const amountDiff = Math.abs(entry.case.amount - tx.amount) / Math.max(entry.case.amount, tx.amount);
    if (amountDiff < 0.3) {
      score += 2;
      matchedOn.push("similar_amount");
    } else if (amountDiff < 0.5) {
      score += 1;
      matchedOn.push("comparable_amount");
    }

    if (entry.case.country === tx.country) {
      score += 2;
      matchedOn.push("same_country");
    }

    if (entry.case.purpose === tx.purpose) {
      score += 3;
      matchedOn.push("same_purpose");
    }

    if (score > 0) {
      results.push({
        case: entry.case,
        similarityScore: score,
        matchedOn: [...new Set(matchedOn)],
      });
    }
  }

  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, limit);
}

export function recommend(tx: Transaction): {
  verdict: string;
  confidence: number;
  cases: PrecedentMatch[];
} {
  const matches = search(tx, 14);

  if (matches.length === 0) {
    return { verdict: "no precedent", confidence: 0, cases: [] };
  }

  let approved = 0;
  let blocked = 0;
  let disputed = 0;

  for (const m of matches) {
    if (m.case.verdict === "approved") approved++;
    else if (m.case.verdict === "blocked") blocked++;
    else disputed++;
  }

  const total = approved + blocked + disputed;
  const verdict = approved > blocked ? "approve" : "block";
  const confidence = Math.round((Math.max(approved, blocked) / total) * 100);

  return { verdict, confidence, cases: matches };
}
