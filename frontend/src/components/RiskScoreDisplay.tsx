import {
  Paper,
  Title,
  Text,
  Badge,
  Stack,
  List,
  Group,
  rem,
} from '@mantine/core';
import type { RiskReport } from '../types/risk';

interface RiskScoreDisplayProps {
  report: RiskReport | null;
}

const RISK_LEVEL_COLORS = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
} as const;

export function RiskScoreDisplay({ report }: RiskScoreDisplayProps) {
  if (!report) return null;

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap={rem(16)}>
        <Group justify="space-between" align="center">
          <Title order={2}>Risk Assessment</Title>
          <Badge
            size="lg"
            color={RISK_LEVEL_COLORS[report.level]}
            variant="filled"
          >
            {report.level.toUpperCase()}
          </Badge>
        </Group>

        <Group>
          <Text size="lg" fw={500}>
            Risk Score:
          </Text>
          <Text size="lg">{report.score}</Text>
        </Group>

        {report.matched_rules.length > 0 && (
          <>
            <Title order={3}>Matched Rules</Title>
            <List>
              {report.matched_rules.map((rule) => (
                <List.Item key={rule.name}>
                  <Group>
                    <Text fw={500}>{rule.name}</Text>
                    <Badge>{rule.score} points</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {rule.rationale}
                  </Text>
                </List.Item>
              ))}
            </List>
          </>
        )}

        {report.config_used?.thresholds && (
          <Text size="sm" c="dimmed">
            Thresholds: Medium ≥ {report.config_used.thresholds.medium}, High ≥{' '}
            {report.config_used.thresholds.high}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
