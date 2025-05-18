import { useState, useEffect } from 'react';
import { MantineProvider, Stack, Text, rem, Button } from '@mantine/core';
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
      // Update the existing reservation
      const response = await fetchWithTimeout(
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

      if (!response.ok) {
        throw new Error('Failed to update guest data');
      }

      const updatedReservation: StoredReservation = await response.json();
      setReservations((prev) =>
        prev.map((r) =>
          r.reservation.id === updatedReservation.reservation.id
            ? updatedReservation
            : r
        )
      );
      setSelectedReservation(updatedReservation);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating guest data:', err);
      setError(
        err instanceof Error && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'Failed to update guest data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedReservation(null);
    setIsEditing(false);
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

          {selectedReservation ? (
            <>
              <Button onClick={handleBackToList} variant="subtle" size="sm">
                ← Back to Reservations
              </Button>
              {isEditing ? (
                <GuestDataForm
                  onSubmit={handleGuestSubmit}
                  disabled={loading}
                  initialData={selectedReservation.reservation.guest}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <RiskScoreDisplay report={selectedReservation.riskReport} />
                  <Button onClick={() => setIsEditing(true)} disabled={loading}>
                    Edit Guest Details
                  </Button>
                </>
              )}
            </>
          ) : (
            <ReservationList
              reservations={reservations}
              onSelect={setSelectedReservation}
              selectedId={selectedReservation?.reservation.id}
              loading={loading}
            />
          )}
        </Stack>
      </MainAppShell>
    </MantineProvider>
  );
}

export default App;
