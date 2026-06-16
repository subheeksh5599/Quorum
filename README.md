# Quorum

**Adversarial AI Consensus Protocol for Institutional Finance**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Ethers](https://img.shields.io/badge/Ethers-v6-purple?logo=ethereum)](https://ethers.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff0055)](https://www.framer.com/motion/)
[![Cleanverse](https://img.shields.io/badge/Cleanverse-UAT_API-3ec48a)](https://cleanverse.com)
[![Monad](https://img.shields.io/badge/Monad-Testnet-f0bb40)](https://testnet.monad.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> No AI agent can move money alone. Five specialized agents independently argue every transaction before a single dollar moves. When they disagree, a judge rules.

---

## Overview

Quorum implements **adversarial consensus** — a multi-agent architecture where every financial transaction must survive both prosecution and defense before execution. Each agent is a specialized LLM-powered reasoner that votes independently based on identity verification, sanctions screening, risk assessment, mandate compliance, and precedent matching.

When agents disagree, the case escalates to a Review Judge that issues a binding judicial opinion with full reasoning. Every decision is recorded as precedent, building an evolving case law database for AI-governed transactions.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Quorum App                     │
├─────────────────────────────────────────────────┤
│  Pages                                           │
│  ├── /              Landing + Hero               │
│  ├── /dashboard     Case submission + execution  │
│  ├── /consensus     Agent voting view            │
│  ├── /disputes      Split-decision center         │
│  ├── /precedents    Case law library             │
│  └── /replay        Audit trail animation        │
├─────────────────────────────────────────────────┤
│  Consensus Engine                                │
│  ├── Identity Agent      A-Pass verification     │
│  ├── Prosecutor          Sanctions + patterns    │
│  ├── Defense Counsel     Whitelist + precedents  │
│  ├── Risk Agent          Amount + jurisdiction   │
│  ├── Authorization       Mandate + policy limits │
│  └── Review Judge        Dispute resolution      │
├─────────────────────────────────────────────────┤
│  Data Layer (abstracted)                         │
│  ├── MemoryProvider      In-memory (demo)        │
│  └── CleanverseProvider  API (production)        │
├─────────────────────────────────────────────────┤
│  On-Chain Execution                              │
│  ├── ethers.js           Gas estimation          │
│  ├── MetaMask            Transaction signing     │
│  └── Monad Testnet       Chain 10143             │
└─────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| **5-Agent Consensus** | Identity, Prosecutor, Defense, Risk, Authorization vote independently |
| **Adversarial Reasoning** | Prosecutor argues to reject — Defense argues to approve |
| **Dispute Resolution** | Split decisions escalate to Review Judge with full opinion |
| **Precedent Library** | Every verdict becomes searchable case law |
| **Audit Replay** | Animated timeline of every decision step |
| **On-Chain Execution** | Approved cases execute via MetaMask on Monad Testnet |
| **Gas Estimation** | Real-time gas cost display before signing |
| **Cleanverse Identity** | A-Pass KYC integration with faucet for aUSDC |
| **Pluggable Data Layer** | Swap in-memory demo data for Cleanverse API via env var |
| **Dark UI** | Institutional-grade dark theme with gold accents |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Animation:** Framer Motion
- **Web3:** ethers.js v6
- **Identity:** Cleanverse UAT API (A-Pass, faucet)
- **Chain:** Monad Testnet (chain 10143)
- **Styling:** CSS custom properties + inline styles

---

## Quick Start

```bash
# Install
cd Tribunal
npm install

# Run dev server
npm run dev

# Type check
npm run typecheck

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `CLEANVERSE_API_ID` | Optional | Cleanverse sandbox API ID |
| `CLEANVERSE_API_KEY` | Optional | Cleanverse sandbox API key |
| `DATA_PROVIDER` | Optional | `"memory"` (default) or `"cleanverse"` |

When `CLEANVERSE_API_ID` is set, the Cleanverse Identity panel activates on the Dashboard — generate A-Pass, claim faucet aUSDC, and agents use real identity data.

---

## How It Works

### 1. Submit a Case
Connect your wallet → fill counterparty, amount, country, purpose → submit.

### 2. Agents Vote
Five specialized agents analyze the transaction:
- **Identity Agent** — verifies A-Pass credentials and wallet ownership
- **Prosecutor** — finds reasons to reject (sanctions, amount > $100K, unverified counterparty)
- **Defense Counsel** — finds reasons to approve (whitelist, precedents, institutional history)
- **Risk Agent** — flags jurisdiction risk and extreme values
- **Authorization Agent** — enforces spending mandates per purpose

### 3. Consensus Outcome
| Result | Trigger |
|--------|---------|
| **Approved** | All 5 agents vote approve |
| **Blocked** | All 5 agents vote reject |
| **Disputed** | Split vote → escalates to Review Judge |

### 4. Execute On-Chain (if approved)
Gas estimate shown → click EXECUTE → MetaMask signs → transaction on Monad Testnet with `QUORUM:CASE:APPROVED` memo.

When no MON balance, execution is simulated with a generated tx hash for demo purposes.

---

## Data Providers

The data layer is abstracted via `lib/data/`. To swap backends:

**In-memory (default):**
```
DATA_PROVIDER=memory
```

**Cleanverse API (production):**
```
DATA_PROVIDER=cleanverse
CLEANVERSE_API_ID=your_id
CLEANVERSE_API_KEY=your_key
```

Fill in the `TODO` stubs in `lib/data/cleanverse.ts` with your Cleanverse endpoint calls.

---

## Demo Flow (2 min)

1. Landing page → click **DASHBOARD**
2. Click **CONNECT WALLET** → approve in MetaMask
3. Fill case: $250K, US, counterparty wallet + name, supplier payment
4. Click **SUBMIT CASE** → agents vote → **DISPUTED** result
5. Click **VIEW** → see all 5 agent votes with reasons
6. Back to Dashboard → submit smaller case → **APPROVED**
7. Click **EXECUTE ON-CHAIN** → shows gas estimate + tx receipt
8. Navigate to **Disputes** → see split case
9. Navigate to **Precedents** → search case law database
10. Click any **REPLAY** link → animated audit trail

---

## Project Structure

```
Tribunal/
├── app/
│   ├── api/              # API routes (transactions, disputes, precedents)
│   ├── dashboard/        # Case submission page
│   ├── consensus/        # Agent voting view
│   ├── disputes/         # Dispute center
│   ├── precedents/       # Case law library
│   ├── replay/           # Audit trail player
│   ├── globals.css       # Theme + gradient utilities
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── AgentGrid.tsx     # Agent cards on landing
│   ├── AppNav.tsx        # Navigation bar
│   ├── CleanversePanel.tsx  # A-Pass + faucet UI
│   ├── Hero.tsx          # Landing hero
│   ├── Providers.tsx     # Context wrapper
│   ├── WalletButton.tsx  # Connect/disconnect
│   └── ...
├── lib/
│   ├── agents/           # 6 agent implementations
│   ├── engine/           # Consensus + dispute resolution
│   ├── data/             # Data provider abstraction
│   ├── cleanverse/       # Cleanverse API client
│   ├── audit/            # Audit trail + replay
│   ├── precedent/        # Precedent matching
│   ├── store.ts          # In-memory data store
│   ├── wallet.tsx        # Wallet context provider
│   ├── tx-executor.tsx   # On-chain transaction execution
│   └── types.ts          # TypeScript type definitions
└── ...
```

---

## License

MIT — built for the Monad hackathon.
