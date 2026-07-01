import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentSuccess from '../components/PaymentSuccess';

describe('PaymentSuccess', () => {
  it('shows a payment received confirmation', () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.getByText(/institute will confirm/i)).toBeInTheDocument();
  });

  it('renders a success icon with an accessible label', () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    expect(screen.getByRole('img', { name: /payment successful/i })).toBeInTheDocument();
  });

  it('renders a Done button', () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });
});
