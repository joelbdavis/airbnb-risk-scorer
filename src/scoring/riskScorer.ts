import { NormalizedReservation } from '../services/getReservationDetails';
import { getRiskLevel } from './riskLevel';
import { ruleRegistry } from './ruleRegistry';
import { getCurrentConfig } from './config';
import { RuleId, RULE_IDS, registerAllRules } from './rules';

// Register all rules on module load
registerAllRules();

// One matched rule with a reference to the key + context
export interface MatchedRule {
  name: RuleId;
  score: number;
  rationale: string;
}

export interface RiskReport {
  score: number;
  level: string;
  matched_rules: MatchedRule[];
  config_used: {
    thresholds: {
      medium: number;
      high: number;
    };
  };
}

export function calculateRiskScore(
  reservation: NormalizedReservation
): RiskReport {
  const { guest } = reservation;
  const matched_rules: MatchedRule[] = [];
  const config = getCurrentConfig();

  for (const rule of ruleRegistry.getAllRules()) {
    const ruleConfig = config.rule_configs[rule.id as RuleId];

    if (ruleConfig?.enabled && rule.applies(guest)) {
      matched_rules.push({
        name: rule.id as RuleId,
        score: ruleConfig.score,
        rationale: rule.rationale,
      });
    }
  }

  const score = matched_rules.reduce((sum, rule) => sum + rule.score, 0);
  const level = getRiskLevel(score, config.thresholds);

  return {
    score,
    level,
    matched_rules,
    config_used: {
      thresholds: config.thresholds,
    },
  };
}
