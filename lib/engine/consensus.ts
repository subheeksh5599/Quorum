import type { Transaction, AgentVote, ConsensusResult, AuditEntry, PrecedentCase } from "@/lib/types";
import { IdentityAgent } from "@/lib/agents/identity";
import { ProsecutorAgent } from "@/lib/agents/prosecutor";
import { DefenseAgent } from "@/lib/agents/defense";
import { RiskAgent } from "@/lib/agents/risk";
import { AuthorizationAgent } from "@/lib/agents/authorization";
import { ReviewAgent } from "@/lib/agents/review";
import { getProvider } from "@/lib/data";
import { audit } from "@/lib/audit/trail";
import { DisputeResolver } from "./dispute";

const identity = new IdentityAgent();
const prosecutor = new ProsecutorAgent();
const defense = new DefenseAgent();
const risk = new RiskAgent();
const authorization = new AuthorizationAgent();
const review = new ReviewAgent();
const disputeResolver = new DisputeResolver(review);

function timestamp(): number {
  return Date.now();
}

export async function runConsensus(tx: Transaction): Promise<ConsensusResult> {
  const provider = getProvider();
  const auditLog: AuditEntry[] = [];

  auditLog.push(audit.created(tx));

  const idVote = await identity.vote(tx);
  auditLog.push(audit.agentVote(tx, idVote));
  await provider.appendAudit(auditLog[auditLog.length - 1]);

  const prosVote = await prosecutor.vote(tx);
  auditLog.push(audit.agentVote(tx, prosVote));
  await provider.appendAudit(auditLog[auditLog.length - 1]);

  const defVote = await defense.vote(tx);
  auditLog.push(audit.agentVote(tx, defVote));
  await provider.appendAudit(auditLog[auditLog.length - 1]);

  const riskVote = await risk.vote(tx);
  auditLog.push(audit.agentVote(tx, riskVote));
  await provider.appendAudit(auditLog[auditLog.length - 1]);

  const authVote = await authorization.vote(tx);
  auditLog.push(audit.agentVote(tx, authVote));
  await provider.appendAudit(auditLog[auditLog.length - 1]);

  const allVotes = [idVote, prosVote, defVote, riskVote, authVote];
  await provider.saveVotes(tx.id, allVotes);

  const allApproved = allVotes.every((v) => v.vote === "approve");
  const anyRejected = allVotes.some((v) => v.vote === "reject");
  const split = allApproved ? false : !allVotes.every((v) => v.vote === "reject");

  let status: ConsensusResult["status"];
  let dispute;
  let reviewOpinion;

  if (allApproved) {
    status = "approved";
    auditLog.push(audit.consensus(tx, "approved", "Unanimous approval"));
    await provider.updateTransactionStatus(tx.id, "approved", { verdict: "approved", completedAt: timestamp() });
  } else if (!split) {
    status = "blocked";
    auditLog.push(audit.consensus(tx, "blocked", "All agents rejected"));
    await provider.updateTransactionStatus(tx.id, "blocked", { verdict: "blocked", completedAt: timestamp() });
  } else {
    status = "disputed";
    await provider.updateTransactionStatus(tx.id, "disputed");

    const result = await disputeResolver.resolve(tx, allVotes);
    dispute = result.dispute;
    reviewOpinion = result.opinion;

    await provider.saveDispute(dispute);
    auditLog.push(audit.consensus(tx, "disputed", "Split decision — escalated to Review Judge"));

    if (reviewOpinion) {
      auditLog.push(audit.review(tx, reviewOpinion));
      const finalStatus = reviewOpinion.verdict === "final_approve" ? "approved" : "blocked";
      await provider.updateTransactionStatus(tx.id, "under_review", {
        verdict: reviewOpinion.verdict === "final_approve" ? "approved" : "blocked",
        reviewOpinion,
        completedAt: timestamp(),
      });
      await provider.updateTransactionStatus(tx.id, finalStatus as "approved" | "blocked");
    }
  }

  for (const entry of auditLog) {
    await provider.appendAudit(entry);
  }

  const finalVotes: Record<string, string> = {};
  for (const v of allVotes) finalVotes[v.agentId] = v.vote;

  await provider.addPrecedent({
    caseNumber: tx.caseNumber,
    amount: tx.amount,
    currency: tx.currency,
    country: tx.country,
    counterpartyType: tx.counterpartyName.includes("Unknown") || tx.counterpartyName === "New Vendor" ? "unknown" as const : "vendor" as const,
    counterpartyName: tx.counterpartyName,
    purpose: tx.purpose,
    chain: tx.chain,
    prosecutorArg: allVotes.find((v) => v.agentId === "prosecutor")?.reason || "",
    defenseArg: allVotes.find((v) => v.agentId === "defense")?.reason || "",
    riskAssessment: allVotes.find((v) => v.agentId === "risk")?.reason || "",
    authorizationCheck: allVotes.find((v) => v.agentId === "authorization")?.reason || "",
    votes: finalVotes,
    verdict: status as "approved" | "blocked" | "disputed",
    reviewOpinion: reviewOpinion?.reasoning?.join(" "),
    tags: [tx.purpose],
    timestamp: Date.now(),
  } as PrecedentCase);

  return {
    status,
    votes: allVotes,
    allApproved,
    anyRejected,
    dispute,
    reviewOpinion,
    auditLog,
  };
}
