import { RiskThresholds } from './config';

export function getRiskLevel(
  score: number,
  thresholds: RiskThresholds = { medium: 30, high: 60 }
): 'low' | 'medium' | 'high' {
  if (score >= thresholds.high) return 'high';
  if (score >= thresholds.medium) return 'medium';
  return 'low';
}
