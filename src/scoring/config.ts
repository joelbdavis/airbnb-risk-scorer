import { RuleId } from './rules';
import { ruleRegistry } from './ruleRegistry';

export interface RiskThresholds {
  medium: number;
  high: number;
}

export interface RuleConfig {
  score: number;
  enabled: boolean;
}

export interface RiskScoringConfig {
  thresholds: RiskThresholds;
  rule_configs: Record<RuleId, RuleConfig>;
}

// Default configuration built from registered rules
export function getDefaultConfig(): RiskScoringConfig {
  const rule_configs: Record<string, RuleConfig> = {};

  for (const rule of ruleRegistry.getAllRules()) {
    rule_configs[rule.id] = {
      score: rule.defaultScore,
      enabled: rule.defaultEnabled,
    };
  }

  return {
    thresholds: {
      medium: 30,
      high: 60,
    },
    rule_configs: rule_configs as Record<RuleId, RuleConfig>,
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
    rule_configs: {
      ...currentConfig.rule_configs,
      ...(newConfig.rule_configs || {}),
    },
  };
}
