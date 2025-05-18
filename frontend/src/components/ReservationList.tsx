import { Table, Text, Paper, Title, rem, Loader, Badge } from '@mantine/core';
import type { StoredReservation } from '../types/risk';

const RISK_LEVEL_COLORS = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
} as const;

interface ReservationListProps {
  reservations: StoredReservation[];
  onSelect: (reservation: StoredReservation) => void;
  selectedId?: string | undefined;
  loading?: boolean;
}

export function ReservationList({
  reservations,
  onSelect,
  selectedId,
  loading = false,
}: ReservationListProps) {
  if (loading) {
    return (
      <Paper p="md" radius="md">
        <Title order={2} mb={rem(16)}>
          Reservations
        </Title>
        <Loader />
      </Paper>
    );
  }

  if (!reservations.length) {
    return (
      <Paper p="md" radius="md">
        <Title order={2} mb={rem(16)}>
          Reservations
        </Title>
        <Text>
          No reservations yet. Click "+ New Reservation" to add one manually.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md">
      <Title order={2} mb={rem(16)}>
        Reservations
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Guest</Table.Th>
            <Table.Th>Platform</Table.Th>
            <Table.Th>Arrival</Table.Th>
            <Table.Th>Nights</Table.Th>
            <Table.Th>Risk Level</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Rules</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reservations.map((reservation) => (
            <Table.Tr
              key={reservation.reservation.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(reservation)}
              bg={
                reservation.reservation.id === selectedId
                  ? 'var(--mantine-color-blue-light)'
                  : undefined
              }
            >
              <Table.Td>{reservation.reservation.guest.name}</Table.Td>
              <Table.Td>{reservation.reservation.platform}</Table.Td>
              <Table.Td>
                {new Date(
                  reservation.reservation.arrival_date
                ).toLocaleDateString()}
              </Table.Td>
              <Table.Td>{reservation.reservation.nights}</Table.Td>
              <Table.Td>
                <Badge
                  color={
                    RISK_LEVEL_COLORS[
                      reservation.riskReport
                        .level as keyof typeof RISK_LEVEL_COLORS
                    ]
                  }
                >
                  {reservation.riskReport.level.toUpperCase()}
                </Badge>
              </Table.Td>
              <Table.Td>{reservation.riskReport.score}</Table.Td>
              <Table.Td>
                {reservation.riskReport.matched_rules.length} rules
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
