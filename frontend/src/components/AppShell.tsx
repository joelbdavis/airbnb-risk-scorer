import { AppShell, Container, Title } from '@mantine/core';

interface AppShellProps {
  children: React.ReactNode;
}

export function MainAppShell({ children }: AppShellProps) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header p="md">
        <Title order={1}>Airbnb Risk Scorer</Title>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
