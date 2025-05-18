import { useState, useEffect } from 'react';
import {
  MantineProvider,
  Stack,
  Text,
  rem,
  Button,
  Group,
  Title,
} from '@mantine/core';
import { MainAppShell } from './components/AppShell';
import { GuestDataForm } from './components/GuestDataForm';
import { RiskScoreDisplay } from './components/RiskScoreDisplay';
import { ReservationList } from './components/ReservationList';
import type { NormalizedGuest, StoredReservation } from './types/risk';
import '@mantine/core/styles.css';

const API_TIMEOUT = 30000; // 30 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function App() {
  const [reservations, setReservations] = useState<StoredReservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<StoredReservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Fetch existing reservations on mount
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await fetchWithTimeout(
          'http://localhost:3000/reservations'
        );
        if (!res.ok) throw new Error('Failed to fetch reservations');
        const data = await res.json();
        setReservations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(
          err instanceof Error && err.name === 'AbortError'
            ? 'Request timed out. Please try again.'
            : 'Failed to load existing reservations'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleGuestSubmit = async (guestData: NormalizedGuest) => {
    setLoading(true);
    try {
      let response;
      if (isCreating) {
        // Create new reservation
        response = await fetchWithTimeout(
          'http://localhost:3000/reservations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              guest: guestData,
            }),
          }
        );
      } else {
        // Update existing reservation
        response = await fetchWithTimeout(
          `http://localhost:3000/reservations/${selectedReservation?.reservation.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              guest: guestData,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          isCreating
            ? 'Failed to create reservation'
            : 'Failed to update guest data'
        );
      }

      const data: StoredReservation = await response.json();

      if (isCreating) {
        setReservations((prev) => [...prev, data]);
      } else {
        setReservations((prev) =>
          prev.map((r) => (r.reservation.id === data.reservation.id ? data : r))
        );
      }

      setSelectedReservation(data);
      setIsEditing(false);
      setIsCreating(false);
      setError(null);
    } catch (err) {
      console.error('Error saving guest data:', err);
      setError(
        err instanceof Error && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : isCreating
            ? 'Failed to create reservation'
            : 'Failed to update guest data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedReservation(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <MantineProvider>
      <MainAppShell>
        <Stack gap={rem(24)}>
          {error && (
            <Text c="red" size="lg">
              {error}
            </Text>
          )}

          {selectedReservation || isCreating ? (
            <>
              <Button onClick={handleBackToList} variant="subtle" size="sm">
                ← Back to Reservations
              </Button>
              {isEditing || isCreating ? (
                <GuestDataForm
                  onSubmit={handleGuestSubmit}
                  disabled={loading}
                  initialData={
                    isCreating || !selectedReservation
                      ? undefined
                      : selectedReservation.reservation.guest
                  }
                  onCancel={handleBackToList}
                />
              ) : selectedReservation ? (
                <>
                  <RiskScoreDisplay report={selectedReservation.riskReport} />
                  <Button onClick={() => setIsEditing(true)} disabled={loading}>
                    Edit Guest Details
                  </Button>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Group justify="space-between" align="center">
                <Title order={2}>Reservations</Title>
                <Button onClick={() => setIsCreating(true)} disabled={loading}>
                  + New Reservation
                </Button>
              </Group>
              <ReservationList
                reservations={reservations}
                onSelect={setSelectedReservation}
                selectedId={selectedReservation?.reservation.id}
                loading={loading}
              />
            </>
          )}
        </Stack>
      </MainAppShell>
    </MantineProvider>
  );
}

export default App;
