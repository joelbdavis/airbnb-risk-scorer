import { NormalizedReservation } from '../services/getReservationDetails';
import { getRiskLevel } from './riskLevel';
import { riskRules, RULE_KEYS, RuleKey } from './riskRules';

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

export function calculateRiskScore(
  reservation: NormalizedReservation
): RiskReport {
  const { guest } = reservation;
  const matchedRules: MatchedRule[] = [];

  for (const ruleKey of Object.keys(riskRules) as RuleKey[]) {
    const rule = riskRules[ruleKey];

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
