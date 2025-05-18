import {
  updateConfig,
  getDefaultConfig,
  resetConfig,
  RuleConfig,
  PartialRiskScoringConfig,
} from '../../src/scoring/config';
import { RULE_IDS, RuleId, registerAllRules } from '../../src/scoring/rules';
import { RuleRegistry } from '../../src/scoring/ruleRegistry';
import { setupRiskScoringTest, teardownRiskScoringTest } from '../testUtils';

describe('Configuration System', () => {
  beforeEach(() => {
    // Reset everything to a clean state
    RuleRegistry.resetInstance();
    // Get a fresh registry instance
    const registry = RuleRegistry.getInstance();
    // Register all rules before getting default config
    registerAllRules();
    // Reset config after rules are registered
    resetConfig();
  });

  afterEach(() => {
    teardownRiskScoringTest();
    // Clean up after each test
    RuleRegistry.resetInstance();
    resetConfig();
  });

  it('provides default configuration', () => {
    // Get a fresh config after rules are registered
    const config = getDefaultConfig();

    // Check thresholds
    expect(config.thresholds).toBeDefined();
    expect(config.thresholds.medium).toBe(30);
    expect(config.thresholds.high).toBe(60);

    // Check rule configs exist for all rules
    expect(config.rule_configs).toBeDefined();

    // Get all registered rules for verification
    const registeredRules = RuleRegistry.getInstance().getAllRules();
    expect(registeredRules.length).toBeGreaterThan(0);

    // Verify each rule ID has a corresponding config
    registeredRules.forEach((rule) => {
      const ruleConfig = config.rule_configs[rule.id as RuleId];
      expect(ruleConfig).toBeDefined();
      expect(typeof ruleConfig.score).toBe('number');
      expect(ruleConfig.score).toBe(rule.defaultScore);
      expect(typeof ruleConfig.enabled).toBe('boolean');
      expect(ruleConfig.enabled).toBe(rule.defaultEnabled);
    });
  });

  it('updates thresholds', () => {
    const newThresholds = {
      medium: 25,
      high: 50,
    };

    updateConfig({
      thresholds: newThresholds,
    });

    const config = getDefaultConfig();
    expect(config.thresholds).toEqual(newThresholds);
  });

  it('updates individual rule configurations', () => {
    const ruleId = RULE_IDS.NO_TRIPS;
    const newScore = 42;
    const newEnabled = false;

    updateConfig({
      rule_configs: {
        [ruleId]: {
          score: newScore,
          enabled: newEnabled,
        },
      },
    });

    const config = getDefaultConfig();
    expect(config.rule_configs[ruleId].score).toBe(newScore);
    expect(config.rule_configs[ruleId].enabled).toBe(newEnabled);
  });

  it('preserves unmodified rule configurations', () => {
    const originalConfig = getDefaultConfig();
    const ruleId = RULE_IDS.NO_TRIPS;

    updateConfig({
      rule_configs: {
        [ruleId]: {
          score: 42,
          enabled: false,
        },
      },
    });

    const newConfig = getDefaultConfig();

    // Check that other rules remain unchanged
    Object.entries(originalConfig.rule_configs).forEach(([id, config]) => {
      if (id !== ruleId) {
        expect(newConfig.rule_configs[id as RuleId]).toEqual(config);
      }
    });
  });

  it('handles partial rule configuration updates', () => {
    const ruleId = RULE_IDS.NO_TRIPS;
    const originalConfig = getDefaultConfig();

    updateConfig({
      rule_configs: {
        [ruleId]: {
          score: 42,
          enabled: originalConfig.rule_configs[ruleId].enabled,
        },
      },
    });

    const newConfig = getDefaultConfig();
    expect(newConfig.rule_configs[ruleId].score).toBe(42);
    expect(newConfig.rule_configs[ruleId].enabled).toBe(
      originalConfig.rule_configs[ruleId].enabled
    );
  });
});
