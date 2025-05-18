import { NormalizedReservation } from '../services/getReservationDetails';
import { getRiskLevel } from './riskLevel';
import { getCurrentConfig } from './config';
import { RuleId, RULE_IDS, registerAllRules } from './rules';
import { RuleRegistry } from './ruleRegistry';

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
  // Ensure rules are registered
  registerAllRules();

  const { guest } = reservation;
  console.log('Calculating risk score for guest:', guest);

  const matched_rules: MatchedRule[] = [];
  const config = getCurrentConfig();
  console.log('Current config:', config);

  const allRules = RuleRegistry.getInstance().getAllRules();
  console.log(
    'Available rules:',
    allRules.map((rule) => rule.id)
  );

  for (const rule of allRules) {
    const ruleConfig = config.rule_configs[rule.id as RuleId] || {
      score: rule.defaultScore,
      enabled: rule.defaultEnabled,
    };

    console.log('Checking rule:', rule.id, 'enabled:', ruleConfig.enabled);

    if (ruleConfig.enabled && rule.applies(guest)) {
      console.log('Rule matched:', rule.id, 'score:', ruleConfig.score);
      matched_rules.push({
        name: rule.id as RuleId,
        score: ruleConfig.score,
        rationale: rule.rationale,
      });
    }
  }

  const score = matched_rules.reduce((sum, rule) => sum + rule.score, 0);
  const level = getRiskLevel(score, config.thresholds);

  console.log(
    'Final score:',
    score,
    'level:',
    level,
    'matched rules:',
    matched_rules
  );

  return {
    score,
    level,
    matched_rules,
    config_used: {
      thresholds: config.thresholds,
    },
  };
}
