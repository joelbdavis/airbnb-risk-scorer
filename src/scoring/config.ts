import { RuleId } from './rules';
import { RuleRegistry } from './ruleRegistry';

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

export interface PartialRiskScoringConfig {
  thresholds?: Partial<RiskThresholds>;
  rule_configs?: Partial<Record<RuleId, RuleConfig>>;
}

// Initialize with null to indicate it hasn't been set yet
let currentConfig: RiskScoringConfig | null = null;

// Default configuration built from registered rules
export function getDefaultConfig(): RiskScoringConfig {
  console.log('Getting default config...');

  // If we have a current config, return it
  if (currentConfig !== null) {
    console.log('Returning existing config:', currentConfig);
    return currentConfig;
  }

  // Otherwise build a fresh config from rules
  const rule_configs: Record<string, RuleConfig> = {};

  const allRules = RuleRegistry.getInstance().getAllRules();
  console.log(
    'Available rules:',
    allRules.map((r) => r.id)
  );

  for (const rule of allRules) {
    console.log(
      'Configuring rule:',
      rule.id,
      'score:',
      rule.defaultScore,
      'enabled:',
      rule.defaultEnabled
    );
    rule_configs[rule.id] = {
      score: rule.defaultScore,
      enabled: rule.defaultEnabled,
    };
  }

  const config = {
    thresholds: {
      medium: 30,
      high: 60,
    },
    rule_configs: rule_configs as Record<RuleId, RuleConfig>,
  };

  // Store the initial config
  currentConfig = config;
  console.log('Created fresh config:', config);
  return config;
}

export function getCurrentConfig(): RiskScoringConfig {
  // Initialize if not yet set
  if (currentConfig === null) {
    currentConfig = getDefaultConfig();
  }
  return currentConfig;
}

export function updateConfig(newConfig: PartialRiskScoringConfig): void {
  console.log('Updating config with:', newConfig);

  // Get current config, initializing if needed
  const baseConfig = getCurrentConfig();

  currentConfig = {
    thresholds: {
      ...baseConfig.thresholds,
      ...(newConfig.thresholds || {}),
    },
    rule_configs: {
      ...baseConfig.rule_configs,
      ...(newConfig.rule_configs || {}),
    },
  };

  console.log('Updated config:', currentConfig);
}

// Add a function to reset the config (useful for testing)
export function resetConfig(): void {
  console.log('Resetting config to null');
  currentConfig = null;
}
