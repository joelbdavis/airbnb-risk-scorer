import { RuleId } from './rules';
import { ruleRegistry } from './ruleRegistry';

export interface RiskThresholds {
  medium: number;
  high: number;
}

export interface RuleWeight {
  score: number;
  enabled: boolean;
}

export interface RiskScoringConfig {
  thresholds: RiskThresholds;
  rule_weights: Record<RuleId, RuleWeight>;
}

// Default configuration built from registered rules
export function getDefaultConfig(): RiskScoringConfig {
  const rule_weights: Record<string, RuleWeight> = {};

  for (const rule of ruleRegistry.getAllRules()) {
    rule_weights[rule.id] = {
      score: rule.defaultScore,
      enabled: rule.defaultEnabled,
    };
  }

  return {
    thresholds: {
      medium: 30,
      high: 60,
    },
    rule_weights: rule_weights as Record<RuleId, RuleWeight>,
  };
}

let currentConfig: RiskScoringConfig = getDefaultConfig();

export function getCurrentConfig(): RiskScoringConfig {
  return currentConfig;
}

export function updateConfig(newConfig: Partial<RiskScoringConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
    // Deep merge for nested objects
    thresholds: {
      ...currentConfig.thresholds,
      ...(newConfig.thresholds || {}),
    },
    rule_weights: {
      ...currentConfig.rule_weights,
      ...(newConfig.rule_weights || {}),
    },
  };
}
