import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LayoutHeader from './LayoutHeader';
import { APP_VERSION } from './SettingsSheet';

const setTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme,
  }),
}));

describe('LayoutHeader Settings', () => {
  beforeEach(() => {
    setTheme.mockReset();
  });

  it('opens settings sheet with 설정 title when icon is clicked', async () => {
    const user = userEvent.setup();
    render(<LayoutHeader />);

    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: '설정' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '설정' })).toBeTruthy();
  });

  it('calls theme setter when theme control is used', async () => {
    const user = userEvent.setup();
    render(<LayoutHeader />);

    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(screen.getByRole('button', { name: '다크' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('shows app version matching provider config', async () => {
    const user = userEvent.setup();
    render(<LayoutHeader />);

    await user.click(screen.getByRole('button', { name: '설정' }));

    expect(screen.getByText('앱 버전')).toBeTruthy();
    expect(screen.getByText(APP_VERSION)).toBeTruthy();
    expect(APP_VERSION).toBe('1.5.0');
  });

  it('closes sheet without navigation', async () => {
    const user = userEvent.setup();
    render(<LayoutHeader />);

    await user.click(screen.getByRole('button', { name: '설정' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.click(screen.getAllByRole('button', { name: '닫기' })[0]);

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
