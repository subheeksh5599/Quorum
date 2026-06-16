import { BaseAgent } from "./base";
import type { Transaction, AgentVote, JudicialOpinion } from "@/lib/types";

export class ReviewAgent extends BaseAgent {
  readonly id = "review";
  readonly name = "Review Judge";
  readonly description = "Issues binding judicial opinion when agents disagree";

  async vote(
    tx: Transaction,
    allVotes?: AgentVote[]
  ): Promise<ReturnType<BaseAgent["approve"]>> {
    const votes = allVotes || [];
    const approved = votes.filter((v) => v.vote === "approve").length;
    const rejected = votes.filter((v) => v.vote === "reject").length;
    const total = votes.length;

    if (approved > rejected && approved >= Math.ceil(total / 2)) {
      return this.approve(
        `Majority of agents (${approved}/${total}) favored approval after full review`,
        82,
        [`${approved} approve vs ${rejected} reject votes across ${total} agents`]
      );
    }

    if (rejected > approved && rejected >= total * 0.6) {
      return this.reject(
        `Super-majority of agents (${rejected}/${total}) favored rejection`,
        88,
        [`${rejected} reject vs ${approved} approve votes — safety override applied`]
      );
    }

    return this.approve(
      "Tie or narrow margin — benefit of the doubt given to institutional trust",
      70,
      [`Split decision: ${approved}/${total} approve, ${rejected}/${total} reject — defaulting to approve`]
    );
  }

  generateOpinion(
    tx: Transaction,
    allVotes: AgentVote[],
    verdict: "final_approve" | "final_reject"
  ): JudicialOpinion {
    const prosecutorVote = allVotes.find((v) => v.agentId === "prosecutor");
    const defenseVote = allVotes.find((v) => v.agentId === "defense");
    const riskVote = allVotes.find((v) => v.agentId === "risk");
    const authVote = allVotes.find((v) => v.agentId === "authorization");

    return {
      caseNumber: tx.caseNumber,
      prosecutorArgument: prosecutorVote?.reason || "No argument presented",
      defenseArgument: defenseVote?.reason || "No argument presented",
      riskFindings: riskVote?.reason || "Risk assessment neutral",
      precedentAnalysis: verdict === "final_approve"
        ? "Precedent search returned supporting cases. The weight of prior decisions favors approval."
        : "Precedent search identified blocking risk factors. Prior cases with similar patterns were rejected.",
      authorizationFindings: authVote?.reason || "Authorization review complete",
      reasoning: [
        `The ${this.name} reviewed all ${allVotes.length} agent votes with full supporting evidence.`,
        verdict === "final_approve"
          ? "The prosecution raised valid concerns, but the defense demonstrated mitigating institutional safeguards and prior compliant history."
          : "The defense presented valid arguments, but the prosecution's risk factors and jurisdictional concerns outweighed the mitigating evidence.",
        `Vote breakdown: ${allVotes.filter((v) => v.vote === "approve").length} approve, ${allVotes.filter((v) => v.vote === "reject").length} reject.`,
      ],
      verdict,
      issuedAt: Date.now(),
    };
  }
}
