import { NormalizedReservation } from '../services/getReservationDetails';

type NormalizedGuest = NormalizedReservation['guest'];

export interface RiskRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name of the rule */
  name: string;
  /** Default score for this rule */
  defaultScore: number;
  /** Default enabled state */
  defaultEnabled: boolean;
  /** Human-readable explanation of why this rule increases risk */
  rationale: string;
  /** Function that determines if this rule applies to a guest */
  applies: (guest: NormalizedGuest) => boolean;
  /** Optional category for grouping rules */
  category?: 'identity' | 'contact' | 'reputation';
}

export class RuleRegistry {
  private static instance: RuleRegistry | null = null;
  private rules: Map<string, RiskRule> = new Map();

  private constructor() {
    console.log('Creating new RuleRegistry instance');
  }

  static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      console.log('Creating singleton RuleRegistry instance');
      RuleRegistry.instance = new RuleRegistry();
    }
    return RuleRegistry.instance;
  }

  registerRule(rule: RiskRule): void {
    console.log('Registering rule:', rule.id);
    this.rules.set(rule.id, rule);
    console.log('Rule registered successfully:', rule.id);
  }

  getRule(id: string): RiskRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): RiskRule[] {
    const rules = Array.from(this.rules.values());
    console.log(
      'Getting all rules:',
      rules.map((r) => r.id)
    );
    return rules;
  }

  getRulesByCategory(category: string): RiskRule[] {
    return this.getAllRules().filter((rule) => rule.category === category);
  }

  clearRules(): void {
    console.log('Clearing all rules');
    this.rules.clear();
  }

  static resetInstance(): void {
    console.log('Resetting RuleRegistry instance');
    RuleRegistry.instance = null;
  }
}

// Get the singleton instance
export const ruleRegistry = RuleRegistry.getInstance();
