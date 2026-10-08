import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import './styles.css';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Router />
    </MantineProvider>
  );
}
