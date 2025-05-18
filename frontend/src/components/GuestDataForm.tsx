import { useState, useEffect } from 'react';
import {
  TextInput,
  NumberInput,
  Switch,
  Button,
  Stack,
  Title,
  Paper,
  TagsInput,
  rem,
  Group,
} from '@mantine/core';
import type { NormalizedGuest } from '../types/risk';

interface GuestDataFormProps {
  onSubmit: (guestData: NormalizedGuest) => void;
  onCancel: () => void;
  disabled?: boolean;
  initialData?: NormalizedGuest;
}

export function GuestDataForm({
  onSubmit,
  onCancel,
  disabled = false,
  initialData,
}: GuestDataFormProps) {
  const [guestData, setGuestData] = useState<NormalizedGuest>(
    initialData || {
      id: '',
      name: '',
      review_count: 0,
      trip_count: 0,
      has_negative_reviews: false,
      profile_picture: false,
      phone_numbers: [],
      email: null,
      location: null,
      language: 'en',
    }
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setGuestData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(guestData);
  };

  return (
    <Paper p="md" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap={rem(16)}>
          <Title order={2}>Guest Information</Title>

          <TextInput
            label="Guest ID"
            required
            value={guestData.id}
            onChange={(e) => setGuestData({ ...guestData, id: e.target.value })}
            disabled={disabled}
          />

          <TextInput
            label="Name"
            required
            value={guestData.name}
            onChange={(e) =>
              setGuestData({ ...guestData, name: e.target.value })
            }
            disabled={disabled}
          />

          <NumberInput
            label="Review Count"
            value={guestData.review_count}
            onChange={(value) =>
              setGuestData({ ...guestData, review_count: Number(value) || 0 })
            }
            disabled={disabled}
          />

          <NumberInput
            label="Trip Count"
            value={guestData.trip_count}
            onChange={(value) =>
              setGuestData({ ...guestData, trip_count: Number(value) || 0 })
            }
            disabled={disabled}
          />

          <Switch
            label="Has Negative Reviews"
            checked={guestData.has_negative_reviews}
            onChange={(e) =>
              setGuestData({
                ...guestData,
                has_negative_reviews: e.currentTarget.checked,
              })
            }
            disabled={disabled}
          />

          <Switch
            label="Has Profile Picture"
            checked={guestData.profile_picture}
            onChange={(e) =>
              setGuestData({
                ...guestData,
                profile_picture: e.currentTarget.checked,
              })
            }
            disabled={disabled}
          />

          <TagsInput
            label="Phone Numbers"
            value={guestData.phone_numbers}
            onChange={(value) =>
              setGuestData({ ...guestData, phone_numbers: value })
            }
            disabled={disabled}
          />

          <TextInput
            label="Email"
            type="email"
            value={guestData.email || ''}
            onChange={(e) =>
              setGuestData({ ...guestData, email: e.target.value || null })
            }
            disabled={disabled}
          />

          <TextInput
            label="Location"
            value={guestData.location || ''}
            onChange={(e) =>
              setGuestData({ ...guestData, location: e.target.value || null })
            }
            disabled={disabled}
          />

          <TextInput
            label="Language"
            required
            value={guestData.language}
            onChange={(e) =>
              setGuestData({ ...guestData, language: e.target.value })
            }
            disabled={disabled}
          />

          <Group justify="flex-end" gap={rem(8)}>
            <Button variant="subtle" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
