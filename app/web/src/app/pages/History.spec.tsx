import type { ExerciseData, ScheduleData } from '@fitness-recoder/structure';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import dayjs from '../../libs/dayjs';
import History from './History';

const useScheduleStatusByMonthQuery = vi.fn();
const useScheduleByDateQuery = vi.fn();
const useExerciseListByScheduleIdQuery = vi.fn();
const useSetListByExerciseIdQuery = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useScheduleStatusByMonthQuery: (...args: unknown[]) =>
      useScheduleStatusByMonthQuery(...args),
    useScheduleByDateQuery: (...args: unknown[]) =>
      useScheduleByDateQuery(...args),
    useExerciseListByScheduleIdQuery: (...args: unknown[]) =>
      useExerciseListByScheduleIdQuery(...args),
    useSetListByExerciseIdQuery: (...args: unknown[]) =>
      useSetListByExerciseIdQuery(...args),
  },
}));

const today = dayjs();
const mockFinish: ScheduleData = {
  id: 42,
  year: today.year(),
  month: today.month() + 1,
  date: today.date(),
  title: '상체 위주 루틴',
  type: 'FINISH',
  start: 0,
  beforeTime: 0,
  breakTime: 0,
  workoutTimes: 65,
};

const mockExercise: ExerciseData = {
  id: 1,
  fitnessId: 10,
  deps: 0,
  fitness: {
    id: 10,
    name: '벤치프레스',
    aliases: [],
    primaryMuscles: ['chest', 'middle_back'],
    secondaryMuscles: [],
    force: 'push',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'barbell',
    category: 'strength',
    instructions: [],
    description: '',
    tips: [],
  },
};

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={<History />} />
        <Route
          path="/history/:scheduleId"
          element={<div data-testid="history-detail">Detail</div>}
        />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('History page', () => {
  beforeEach(() => {
    useScheduleStatusByMonthQuery.mockReset();
    useScheduleByDateQuery.mockReset();
    useExerciseListByScheduleIdQuery.mockReset();
    useSetListByExerciseIdQuery.mockReset();

    useScheduleByDateQuery.mockReturnValue({ data: [], isLoading: false });
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('shows D9HpL empty copy when there are no FINISH schedules', async () => {
    useScheduleStatusByMonthQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderHistory();

    expect(screen.getByText('아직 운동 기록이 없습니다')).toBeTruthy();
    expect(
      screen.getByText('홈이나 루틴에서 운동을 시작해 보세요'),
    ).toBeTruthy();

    await user.click(screen.getByLabelText('홈으로'));
    expect(screen.getByTestId('home-page')).toBeTruthy();
  });

  it('renders FINISH cards and navigates to /history/:id on click', async () => {
    const status: string[][] = [];
    status[mockFinish.date] = ['FINISH'];
    useScheduleStatusByMonthQuery.mockImplementation(
      (params: { year: number; month: number }) => {
        const isCurrent =
          params.year === mockFinish.year && params.month === mockFinish.month;
        return {
          data: isCurrent ? status : [],
          isLoading: false,
        };
      },
    );
    useScheduleByDateQuery.mockImplementation(
      (params: { year: number; month: number; date: number }) => {
        const match =
          params.year === mockFinish.year &&
          params.month === mockFinish.month &&
          params.date === mockFinish.date;
        return {
          data: match ? [mockFinish] : [],
          isLoading: false,
        };
      },
    );
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [mockExercise],
      isLoading: false,
    });
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [
        {
          id: 1,
          exerciseId: 1,
          repeat: 10,
          isDone: true,
          weightUnit: 'kg',
          weight: 60,
        },
      ],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderHistory();

    expect(screen.getByText('상체 위주 루틴')).toBeTruthy();
    expect(screen.getByText(/시간: 65분/)).toBeTruthy();
    expect(screen.getByText('가슴')).toBeTruthy();
    expect(screen.getByText('등')).toBeTruthy();
    expect(screen.getByText('벤치프레스')).toBeTruthy();

    await user.click(screen.getByLabelText('상체 위주 루틴 상세 보기'));
    expect(screen.getByTestId('history-detail')).toBeTruthy();
  });
});
