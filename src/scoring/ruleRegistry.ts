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

class RuleRegistry {
  private rules: Map<string, RiskRule> = new Map();

  registerRule(rule: RiskRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id ${rule.id} is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): RiskRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): RiskRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByCategory(category: string): RiskRule[] {
    return this.getAllRules().filter((rule) => rule.category === category);
  }
}

// Singleton instance
export const ruleRegistry = new RuleRegistry();
