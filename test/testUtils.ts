import { RuleRegistry } from '../src/scoring/ruleRegistry';
import { updateConfig, getDefaultConfig } from '../src/scoring/config';
import { registerAllRules } from '../src/scoring/rules';

/**
 * Reset all global state used by the risk scoring system.
 * This includes the RuleRegistry singleton and configuration.
 */
export function resetRiskScoringState() {
  // Reset rule registry first
  RuleRegistry.resetInstance();

  // Register default rules
  registerAllRules();

  // Reset to default configuration
  updateConfig(getDefaultConfig());
}

/**
 * Common setup function to use in beforeEach blocks
 */
export function setupRiskScoringTest() {
  resetRiskScoringState();
}

/**
 * Common teardown function to use in afterEach blocks
 */
export function teardownRiskScoringTest() {
  resetRiskScoringState();
}
