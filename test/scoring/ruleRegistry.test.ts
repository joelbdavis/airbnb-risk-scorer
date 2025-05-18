import { RuleRegistry, RiskRule } from '../../src/scoring/ruleRegistry';

describe('RuleRegistry', () => {
  let registry: RuleRegistry;

  const mockRule: RiskRule = {
    id: 'TEST_RULE',
    name: 'Test Rule',
    defaultScore: 10,
    defaultEnabled: true,
    rationale: 'Test rationale',
    applies: () => true,
    category: 'identity',
  };

  beforeEach(() => {
    RuleRegistry.resetInstance();
    registry = RuleRegistry.getInstance();
  });

  it('maintains singleton instance', () => {
    const instance1 = RuleRegistry.getInstance();
    const instance2 = RuleRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('registers and retrieves rules', () => {
    registry.registerRule(mockRule);
    const retrieved = registry.getRule(mockRule.id);
    expect(retrieved).toEqual(mockRule);
  });

  it('clears all rules', () => {
    registry.registerRule(mockRule);
    registry.clearRules();
    expect(registry.getAllRules()).toHaveLength(0);
  });

  it('gets rules by category', () => {
    const identityRule: RiskRule = { ...mockRule, category: 'identity' };
    const contactRule: RiskRule = {
      ...mockRule,
      id: 'CONTACT_RULE',
      category: 'contact',
    };

    registry.registerRule(identityRule);
    registry.registerRule(contactRule);

    const identityRules = registry.getRulesByCategory('identity');
    expect(identityRules).toHaveLength(1);
    expect(identityRules[0]).toEqual(identityRule);
  });

  it('resets instance state', () => {
    registry.registerRule(mockRule);
    RuleRegistry.resetInstance();
    const newRegistry = RuleRegistry.getInstance();
    expect(newRegistry.getAllRules()).toHaveLength(0);
  });
});
