import { normalizeGuest } from '../utils/normalizeGuest';
import { getRiskLevel } from './riskLevel';
import { riskRules, RULE_KEYS, RuleKey, RiskRule } from './riskRules';

// One matched rule with a reference to the key + context
export interface MatchedRule {
  name: RuleKey;
  score: number;
  rationale: string;
}

export interface RiskReport {
  score: number;
  level: string;
  matchedRules: MatchedRule[];
}

export function calculateRiskScore(reservation: any): RiskReport {
  const guest = normalizeGuest(reservation);
  const matchedRules: MatchedRule[] = [];

  for (const ruleKey of Object.keys(riskRules) as RuleKey[]) {
    const rule: RiskRule = riskRules[ruleKey];

    if (rule.applies(guest)) {
      matchedRules.push({
        name: ruleKey,
        score: rule.score,
        rationale: rule.rationale,
      });
    }
  }

  const score = matchedRules.reduce((sum, rule) => sum + rule.score, 0);
  const level = getRiskLevel(score);

  return {
    score,
    level,
    matchedRules,
  };
}
