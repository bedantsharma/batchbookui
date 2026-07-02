import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentSuccess from '../components/PaymentSuccess';

function renderWithStatus(status) {
  const path = status ? `/payment-success?razorpay_payment_link_status=${status}` : '/payment-success';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PaymentSuccess />
    </MemoryRouter>
  );
}

describe('PaymentSuccess', () => {
  it('shows a payment received confirmation when Razorpay reports the payment as paid', () => {
    renderWithStatus('paid');
    expect(screen.getByText('Payment received')).toBeInTheDocument();
    expect(screen.getByText(/institute will confirm/i)).toBeInTheDocument();
  });

  it('shows a neutral message when Razorpay reports the payment as cancelled', () => {
    renderWithStatus('cancelled');
    expect(screen.getByText('Payment not completed')).toBeInTheDocument();
    expect(screen.queryByText('Payment received')).not.toBeInTheDocument();
  });

  it('shows a neutral message when no status param is present', () => {
    renderWithStatus(null);
    expect(screen.getByText('Payment not completed')).toBeInTheDocument();
  });

  it('renders an accessible icon label matching the payment outcome', () => {
    renderWithStatus('paid');
    expect(screen.getByRole('img', { name: /payment successful/i })).toBeInTheDocument();
  });

  it('renders a Done button', () => {
    renderWithStatus('paid');
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });
});
