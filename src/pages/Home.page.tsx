import { Container, Paper, Title } from '@mantine/core';
import { AssessmentForm } from '../features/assessment/AssessmentForm';

// No backend: pretend the save takes a moment.
const fakeSave = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

export function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="sm" p="lg">
        <Title order={1} size="h2" mb="md">
          Geriatric Care Assessment
        </Title>
        <AssessmentForm onSave={fakeSave} />
      </Paper>
    </Container>
  );
}
