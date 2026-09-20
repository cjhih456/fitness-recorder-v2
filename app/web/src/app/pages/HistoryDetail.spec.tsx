import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HistoryDetail from './HistoryDetail';

const useScheduleQuery = vi.fn();
const useExerciseListByScheduleIdQuery = vi.fn();
const useSetListByExerciseIdQuery = vi.fn();
const mutateCopy = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useScheduleQuery: (...args: unknown[]) => useScheduleQuery(...args),
    useExerciseListByScheduleIdQuery: (...args: unknown[]) =>
      useExerciseListByScheduleIdQuery(...args),
    useSetListByExerciseIdQuery: (...args: unknown[]) =>
      useSetListByExerciseIdQuery(...args),
    useCopyExercisePresetFromScheduleMutation: () => ({
      mutateAsync: mutateCopy,
      isPending: false,
    }),
  },
}));

const mockFinish: ScheduleData = {
  id: 42,
  year: 2026,
  month: 5,
  date: 20,
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
    primaryMuscles: ['chest'],
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

const mockSet: SetData = {
  id: 9,
  exerciseId: 1,
  repeat: 8,
  isDone: true,
  weightUnit: 'kg',
  weight: 80,
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/history/42']}>
      <Routes>
        <Route path="/history/:scheduleId" element={<HistoryDetail />} />
        <Route path="/history" element={<div data-testid="history-list" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HistoryDetail page', () => {
  beforeEach(() => {
    useScheduleQuery.mockReset();
    useExerciseListByScheduleIdQuery.mockReset();
    useSetListByExerciseIdQuery.mockReset();
    mutateCopy.mockReset();

    useScheduleQuery.mockReturnValue({
      data: mockFinish,
      isLoading: false,
    });
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [mockExercise],
      isLoading: false,
    });
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [mockSet],
      isLoading: false,
    });
  });

  it('renders read-only detail without finish CTA or add-set', () => {
    renderDetail();

    expect(screen.getByText('상체 위주 루틴')).toBeTruthy();
    expect(screen.getByText(/5월 20일/)).toBeTruthy();
    expect(screen.getByText('벤치프레스')).toBeTruthy();
    expect(screen.getByText('80')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByLabelText('벤치프레스 1세트 완료')).toBeTruthy();

    expect(screen.queryByRole('button', { name: '운동 완료' })).toBeNull();
    expect(screen.queryByRole('button', { name: /세트 추가/ })).toBeNull();
    expect(
      screen.queryByRole('button', { name: /새로운 운동 종목 추가/ }),
    ).toBeNull();
    expect(screen.queryByText('일시정지')).toBeNull();
  });

  it('shows empty session copy when there are no exercises', () => {
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderDetail();

    expect(
      screen.getByText('이 세션에 기록된 운동이 없습니다'),
    ).toBeTruthy();
  });
});
