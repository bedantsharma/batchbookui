import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompleteProfileStep from '../components/onboarding/CompleteProfileStep';

vi.mock('../services/api', () => ({
  default: { patch: vi.fn() },
}));
import api from '../services/api';

describe('CompleteProfileStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders only the missing fields and submits them via PATCH', async () => {
    api.patch.mockResolvedValue({ data: {} });
    const onDone = vi.fn();

    render(
      <CompleteProfileStep
        missing={{ parentName: true, childEmail: true }}
        childId={10}
        onDone={onDone}
      />
    );

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/child's email/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Priya Devi' } });
    fireEvent.change(screen.getByLabelText(/child's email/i), { target: { value: 'kid@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/parent/update', { name: 'Priya Devi' });
      expect(api.patch).toHaveBeenCalledWith('/parent/children/10', { email: 'kid@test.com' });
      expect(onDone).toHaveBeenCalled();
    });
  });

  it('only renders and submits the parent name field when only that is missing', async () => {
    api.patch.mockResolvedValue({ data: {} });
    const onDone = vi.fn();

    render(
      <CompleteProfileStep
        missing={{ parentName: true, childEmail: false }}
        childId={10}
        onDone={onDone}
      />
    );

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/child's email/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Priya Devi' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/parent/update', { name: 'Priya Devi' });
      expect(api.patch).not.toHaveBeenCalledWith('/parent/children/10', expect.anything());
      expect(onDone).toHaveBeenCalled();
    });
  });
});
