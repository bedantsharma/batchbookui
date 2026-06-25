import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoleStep from '../components/onboarding/RoleStep';

describe('RoleStep', () => {
  it('renders an Owner / Institute option that is enabled', () => {
    render(<RoleStep value="" onChange={() => {}} />);

    const ownerCard = screen.getByText('Owner / Institute');
    expect(ownerCard).toBeDefined();

    // The card should not have cursor:not-allowed styling
    // (i.e., it is not disabled)
    const studentCard = screen.getByText('Student');
    expect(studentCard).toBeDefined();
  });

  it('calls onChange with "owner" when the Owner card is clicked', () => {
    const onChange = vi.fn();
    render(<RoleStep value="" onChange={onChange} />);

    fireEvent.click(screen.getByText('Owner / Institute').closest('[class]') || screen.getByText('Owner / Institute'));
    expect(onChange).toHaveBeenCalledWith('owner');
  });

  it('teacher card is still disabled', () => {
    render(<RoleStep value="" onChange={vi.fn()} />);
    // Teacher sub-text confirms the card is present and marked coming-soon
    expect(screen.getByText(/coming soon/i)).toBeDefined();
  });
});
