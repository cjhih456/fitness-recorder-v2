import type { ScheduleData } from '@fitness-recoder/structure';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LayoutFooter from './LayoutFooter';

const useScheduleByDateQuery = vi.fn();
const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useScheduleByDateQuery: (...args: unknown[]) =>
      useScheduleByDateQuery(...args),
    useCreateScheduleMutation: () => ({
      mutateAsync: mutateCreate,
      isPending: false,
    }),
    useUpdateScheduleMutation: () => ({
      mutateAsync: mutateUpdate,
      isPending: false,
    }),
  },
}));

function renderFooter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<LayoutFooter />} />
        <Route
          path="/workout/:scheduleId"
          element={<div data-testid="workout-page">Workout</div>}
        />
        <Route path="*" element={<LayoutFooter />} />
      </Routes>
    </MemoryRouter>,
  );
}

const startedSchedule: ScheduleData = {
  id: 42,
  year: 2026,
  month: 9,
  date: 19,
  title: '진행 중',
  type: 'STARTED',
  start: 1,
  beforeTime: 0,
  breakTime: 0,
  workoutTimes: 0,
};

const createdSchedule: ScheduleData = {
  id: 99,
  year: 2026,
  month: 9,
  date: 19,
  title: '오늘의 운동',
  type: 'SCHEDULED',
  start: 0,
  beforeTime: 0,
  breakTime: 0,
  workoutTimes: 0,
};

describe('LayoutFooter FAB', () => {
  beforeEach(() => {
    useScheduleByDateQuery.mockReset();
    mutateCreate.mockReset();
    mutateUpdate.mockReset();
  });

  it('navigates to existing STARTED schedule id', async () => {
    const user = userEvent.setup();
    useScheduleByDateQuery.mockReturnValue({
      data: [startedSchedule],
      isLoading: false,
    });

    renderFooter();

    await user.click(screen.getByRole('button', { name: '운동 시작' }));

    expect(await screen.findByTestId('workout-page')).toBeTruthy();
    expect(mutateCreate).not.toHaveBeenCalled();
  });

  it('creates schedule, starts it, then navigates to new id', async () => {
    const user = userEvent.setup();
    useScheduleByDateQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mutateCreate.mockResolvedValue(createdSchedule);
    mutateUpdate.mockResolvedValue({
      ...createdSchedule,
      type: 'STARTED',
      start: 123,
    });

    renderFooter();

    await user.click(screen.getByRole('button', { name: '운동 시작' }));

    await waitFor(() => {
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SCHEDULED',
          title: '오늘의 운동',
        }),
      );
    });
    expect(mutateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 99,
        type: 'STARTED',
      }),
    );
    expect(await screen.findByTestId('workout-page')).toBeTruthy();
  });

  it('renders tab labels from shell', () => {
    useScheduleByDateQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderFooter();

    expect(screen.getByText('홈')).toBeTruthy();
    expect(screen.getByText('기록')).toBeTruthy();
    expect(screen.getByText('루틴')).toBeTruthy();
    expect(screen.getByText('인증')).toBeTruthy();
  });

  it('hides tab bar on routine editor routes', () => {
    useScheduleByDateQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderFooter('/routines/new');
    expect(screen.queryByText('홈')).toBeNull();

    renderFooter('/routines/7/edit');
    expect(screen.queryByText('홈')).toBeNull();
  });
});
