# Airbnb Risk Scorer — Developer Notes

## Overview

This project is a Node.js/Express backend (with TypeScript migration underway) that:

- Receives reservation webhooks from Hospitable
- Normalizes guest data into a structured format
- Applies rule-based risk scoring logic
- Returns a `RiskReport` with a `score`, `level`, and `matchedRules[]`

You are also testing and iterating via Jest, with a growing suite of payload-based test cases.

## Key Modules

### `normalizeGuest.ts`

- Converts raw reservation payloads into a consistent `NormalizedGuest` shape
- Ensures values like `phoneNumbers`, `email`, and `location` are never `undefined`

### `riskRules.ts`

- Exports a `RULE_KEYS` object with statically defined rule names (e.g., `MISSING_EMAIL`)
- Uses `RuleKey` type alias for safe access
- Each rule has: `score`, `rationale`, and `applies(guest)`

### `riskScorer.ts`

- Runs all rules against a normalized guest
- Returns a `RiskReport` with:

  - `score`: number
  - `level`: 'low' | 'medium' | 'high'
  - `matchedRules[]`: with `name`, `score`, and `rationale`

### `riskLevel.ts`

- Maps numeric score to level:

  - <30 = low
  - 30–59 = medium
  - 60+ = high

## Tooling & Workflow

### Jest Test Setup

- Test payloads live in `testPayloads/`
- Each has a corresponding `.expected.json` file with at least a `level` field
- Snapshot-style testing compares calculated output to expected results

### Environment Management

- `.env` file was accidentally committed but has been removed via `git filter-repo`
- `.env.example` now serves as a reference template
- Contains `HOSPITABLE_API_KEY`, `PORT`, and `NGROK_AUTHTOKEN`

### TypeScript Migration

- All major scoring and normalization logic is now in `.ts`
- Tests are being migrated to `.test.ts`
- Using `ts-jest` for smooth integration with Jest

### Cursor Integration

- Cursor IDE installed and functional
- Currently using Cursor’s built-in models (no OpenAI API key attached yet)
- Plans to use it for high-context code editing, refactoring, and suggestion loops

---

## Potential Next Steps

### 🔧 Codebase

- Convert saveTestPayload.js to ts
- ConvertgetReservationDetails.js to ts
- Convert index.js to ts?
- Investigate airbnbapi open source project to see if we can get more data
- Extract rule logic into individual testable files or classes (preparation for a plugin-like system)
- Add ability to disable/enable rules via config or UI flag
- Add support for "rule categories" (e.g., identity, contact, reputation) to help with grouping and tuning

### 🧪 Testing

- Add tests for getReservationDetails.js
- Add Jest tests for `riskLevel.ts` boundary values (already partly done, but could be more granular)
- Validate that all rules in `riskRules` are triggered by at least one test case
- Write unit tests for individual `rule.applies()` logic (can reuse normalized test data)

### 🔐 Security & CI

- Add `.pre-commit` hook using `husky` to block commits of `.env` or hardcoded API keys
- Set up GitHub Actions to run tests on PRs and pushes to `main`
- Add ESLint + Prettier config with a shared style guide

## 🌐 Frontend (when ready)

- Build a minimal frontend to manually enter guest data and view risk scores
- Allow upload of a `.json` payload and show matched rules + rationale
- Add a settings screen to toggle which rules are enabled
