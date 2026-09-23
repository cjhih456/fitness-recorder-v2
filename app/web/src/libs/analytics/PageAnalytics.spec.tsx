import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageAnalytics } from './PageAnalytics';
import { __resetAnalyticsPortForTests, setAnalyticsPort } from './port';

function NavigateButton({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go
    </button>
  );
}

describe('PageAnalytics', () => {
  const log = vi.fn();

  beforeEach(() => {
    setAnalyticsPort({ log });
  });

  afterEach(() => {
    cleanup();
    __resetAnalyticsPortForTests();
    log.mockReset();
    vi.restoreAllMocks();
  });

  it('emits screen_view on mount and screen_leave on route change', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PageAnalytics />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                home
                <NavigateButton to="/routines" />
              </div>
            }
          />
          <Route path="/routines" element={<div>routines</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(log).toHaveBeenCalledWith(
      'screen_view',
      expect.objectContaining({ firebase_screen: 'dashboard' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'go' }));
    await screen.findByText('routines');

    await waitFor(() => {
      expect(log).toHaveBeenCalledWith(
        'screen_leave',
        expect.objectContaining({ firebase_screen: 'dashboard' }),
      );
      expect(log).toHaveBeenCalledWith(
        'screen_view',
        expect.objectContaining({ firebase_screen: 'routines' }),
      );
    });
  });

  it('emits screen_leave when the tab becomes hidden', () => {
    render(
      <MemoryRouter initialEntries={['/photo']}>
        <PageAnalytics />
        <Routes>
          <Route path="/photo" element={<div>photo</div>} />
        </Routes>
      </MemoryRouter>,
    );

    log.mockClear();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(log).toHaveBeenCalledWith(
      'screen_leave',
      expect.objectContaining({ firebase_screen: 'photo' }),
    );
  });
});
