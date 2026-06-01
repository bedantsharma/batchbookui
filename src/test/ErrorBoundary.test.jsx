import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorBoundary from '../components/ErrorBoundary';

const theme = createTheme({ palette: { mode: 'dark' } });

function wrap(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

// A component that throws on the first render and recovers after reset
function BrokenComponent({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test crash');
  return <div>All good</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected boundary catches
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    wrap(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows fallback UI when a child throws', () => {
    wrap(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('resets and re-renders children after clicking "Try again"', () => {
    let throwFlag = true;
    function Toggleable() {
      if (throwFlag) throw new Error('oops');
      return <div>Recovered</div>;
    }

    wrap(
      <ErrorBoundary>
        <Toggleable />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Simulate recovery: disable the throw, then click "Try again"
    throwFlag = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
