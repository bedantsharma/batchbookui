import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

// ─── Consumer component for testing useAuth ───────────────────────────────────
function AuthConsumer() {
  const { session, user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? 'has-session' : 'no-session'}</span>
      <span data-testid="user">{user ? user.id : 'no-user'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: onAuthStateChange returns an unsubscribe fn
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('starts in loading state and resolves to no-session when unauthenticated', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // After getSession resolves
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('session').textContent).toBe('no-session');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('exposes session and user when authenticated', async () => {
    const fakeSession = { user: { id: 'user-123' }, access_token: 'jwt-abc' };
    supabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session').textContent).toBe('has-session');
    });
    expect(screen.getByTestId('user').textContent).toBe('user-123');
  });

  it('calls supabase.auth.signOut when signOut is invoked', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.signOut.mockResolvedValue({});

    function SignOutButton() {
      const { signOut } = useAuth();
      return <button onClick={signOut}>Sign out</button>;
    }

    const { getByText } = render(
      <AuthProvider>
        <SignOutButton />
      </AuthProvider>
    );

    await waitFor(() => getByText('Sign out'));
    getByText('Sign out').click();
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it('throws when useAuth is called outside AuthProvider', () => {
    // Suppress expected console.error from React
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Naked() {
      useAuth();
      return null;
    }
    expect(() => render(<Naked />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('signOut removes all four bb_ and onboarding localStorage keys', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.signOut.mockResolvedValue({});

    // Pre-populate all keys a session might leave behind
    localStorage.setItem('bb_role', 'student');
    localStorage.setItem('bb_student_id', '42');
    localStorage.setItem('bb_student_name', 'Priya');
    localStorage.setItem('onboarding_profile', JSON.stringify({ role: 'student' }));

    function SignOutButton() {
      const { signOut } = useAuth();
      return <button onClick={signOut}>Sign out</button>;
    }

    const { getByText } = render(
      <AuthProvider>
        <SignOutButton />
      </AuthProvider>
    );

    await waitFor(() => getByText('Sign out'));
    getByText('Sign out').click();

    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledOnce());

    expect(localStorage.getItem('bb_role')).toBeNull();
    expect(localStorage.getItem('bb_student_id')).toBeNull();
    expect(localStorage.getItem('bb_student_name')).toBeNull();
    expect(localStorage.getItem('onboarding_profile')).toBeNull();
  });

  it('onAuthStateChange clears all four localStorage keys when session becomes null', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    let authChangeCallback;
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    localStorage.setItem('bb_role', 'student');
    localStorage.setItem('bb_student_id', '42');
    localStorage.setItem('bb_student_name', 'Priya');
    localStorage.setItem('onboarding_profile', JSON.stringify({ role: 'student' }));

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );

    await waitFor(() => expect(authChangeCallback).toBeDefined());

    act(() => {
      authChangeCallback('SIGNED_OUT', null);
    });

    expect(localStorage.getItem('bb_role')).toBeNull();
    expect(localStorage.getItem('bb_student_id')).toBeNull();
    expect(localStorage.getItem('bb_student_name')).toBeNull();
    expect(localStorage.getItem('onboarding_profile')).toBeNull();
  });

  it('subscribes to onAuthStateChange and unsubscribes on unmount', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    const unsubscribeFn = vi.fn();
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeFn } },
    });

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    unmount();
    expect(unsubscribeFn).toHaveBeenCalledOnce();
  });
});
