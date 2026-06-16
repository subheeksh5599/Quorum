import type { Transaction, AgentVote, Dispute, JudicialOpinion } from "@/lib/types";
import { ReviewAgent } from "@/lib/agents/review";

export class DisputeResolver {
  private review: ReviewAgent;

  constructor(review: ReviewAgent) {
    this.review = review;
  }

  async resolve(
    tx: Transaction,
    allVotes: AgentVote[]
  ): Promise<{ dispute: Dispute; opinion: JudicialOpinion }> {
    const approvingAgents = allVotes.filter((v) => v.vote === "approve").map((v) => v.agentId);
    const rejectingAgents = allVotes.filter((v) => v.vote === "reject").map((v) => v.agentId);

    const prosVote = allVotes.find((v) => v.agentId === "prosecutor")!;
    const defVote = allVotes.find((v) => v.agentId === "defense")!;

    const reviewVote = await this.review.vote(tx, allVotes);
    const finalVerdict = reviewVote.vote === "approve" ? "final_approve" : "final_reject";

    const opinion = this.review.generateOpinion(tx, allVotes, finalVerdict);

    const dispute: Dispute = {
      transactionId: tx.id,
      caseNumber: tx.caseNumber,
      approvingAgents,
      rejectingAgents,
      prosecutorVote: prosVote,
      defenseVote: defVote,
      reviewOpinion: opinion,
      resolvedAt: Date.now(),
    };

    return { dispute, opinion };
  }
}
