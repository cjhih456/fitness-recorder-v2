import type {
  ExerciseData,
  Fitness,
  ScheduleData,
  SetData,
} from '@fitness-recoder/structure';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Workout from './Workout';

const useScheduleQuery = vi.fn();
const useExerciseListByScheduleIdQuery = vi.fn();
const useSetListByExerciseIdQuery = vi.fn();
const useExerciseFinishHistoryQuery = vi.fn();
const useFitnessListByKeywordsQuery = vi.fn();

const mutateUpdateSchedule = vi.fn();
const mutateCreateExercise = vi.fn();
const mutateCreateSet = vi.fn();
const mutateUpdateSet = vi.fn();
const mutateDeleteSet = vi.fn();
const mutateCopyPreset = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useScheduleQuery: (...args: unknown[]) => useScheduleQuery(...args),
    useExerciseListByScheduleIdQuery: (...args: unknown[]) =>
      useExerciseListByScheduleIdQuery(...args),
    useSetListByExerciseIdQuery: (...args: unknown[]) =>
      useSetListByExerciseIdQuery(...args),
    useExerciseFinishHistoryQuery: (...args: unknown[]) =>
      useExerciseFinishHistoryQuery(...args),
    useFitnessListByKeywordsQuery: (...args: unknown[]) =>
      useFitnessListByKeywordsQuery(...args),
    useCreateExerciseByScheduleMutation: () => ({
      mutate: mutateCreateExercise,
      mutateAsync: mutateCreateExercise,
      isPending: false,
    }),
    useCreateSetMutation: () => ({
      mutate: mutateCreateSet,
      mutateAsync: mutateCreateSet,
      isPending: false,
    }),
    useUpdateSetMutation: () => ({
      mutate: mutateUpdateSet,
      mutateAsync: mutateUpdateSet,
      isPending: false,
    }),
    useDeleteSetMutation: () => ({
      mutate: mutateDeleteSet,
      mutateAsync: mutateDeleteSet,
      isPending: false,
    }),
    useUpdateScheduleMutation: () => ({
      mutate: mutateUpdateSchedule,
      mutateAsync: mutateUpdateSchedule,
      isPending: false,
    }),
    useCopyExercisePresetFromScheduleMutation: () => ({
      mutate: mutateCopyPreset,
      mutateAsync: mutateCopyPreset,
      isPending: false,
    }),
  },
}));

const mockFitness: Fitness = {
  id: 10,
  name: '벤치프레스',
  aliases: [],
  primaryMuscles: ['chest', 'triceps', 'shoulders'],
  secondaryMuscles: [],
  force: 'push',
  level: 'intermediate',
  mechanic: 'compound',
  equipment: 'barbell',
  category: 'strength',
  instructions: [],
  description: '',
  tips: [],
};

const baseSchedule: ScheduleData = {
  id: 1,
  year: 2026,
  month: 9,
  date: 19,
  title: '오늘의 운동',
  type: 'STARTED',
  start: Date.now() - 60_000,
  beforeTime: 0,
  breakTime: 0,
  workoutTimes: 0,
};

const mockExercise: ExerciseData = {
  id: 100,
  fitnessId: 10,
  deps: 0,
  fitness: mockFitness,
};

const incompleteSet: SetData = {
  id: 1,
  exerciseId: 100,
  duration: 0,
  repeat: 10,
  isDone: false,
  weightUnit: 'kg',
  weight: 60,
};

function renderWorkout(initialPath = '/workout/1') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/workout/:scheduleId" element={<Workout />} />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route
          path="/history"
          element={<div data-testid="history-page">History</div>}
        />
        <Route
          path="/photo"
          element={<div data-testid="photo-page">Photo</div>}
        />
        <Route
          path="/routines"
          element={<div data-testid="routines-page">Routines</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Workout page', () => {
  beforeEach(() => {
    useScheduleQuery.mockReset();
    useExerciseListByScheduleIdQuery.mockReset();
    useSetListByExerciseIdQuery.mockReset();
    useExerciseFinishHistoryQuery.mockReset();
    useFitnessListByKeywordsQuery.mockReset();
    mutateUpdateSchedule.mockReset();
    mutateCreateExercise.mockReset();
    mutateCreateSet.mockReset();
    mutateUpdateSet.mockReset();
    mutateDeleteSet.mockReset();
    mutateCopyPreset.mockReset();

    useScheduleQuery.mockReturnValue({
      data: { ...baseSchedule },
      isLoading: false,
    });
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [mockExercise],
      isLoading: false,
    });
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [incompleteSet],
      isLoading: false,
    });
    useExerciseFinishHistoryQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    useFitnessListByKeywordsQuery.mockReturnValue({
      data: [mockFitness],
      isLoading: false,
      isFetching: false,
    });
    mutateUpdateSchedule.mockImplementation(async (input: ScheduleData) => input);
  });

  it('pauses STARTED session and shows PAUSED UI on resume control', async () => {
    const user = userEvent.setup();
    let schedule: ScheduleData = { ...baseSchedule, type: 'STARTED' };

    useScheduleQuery.mockImplementation(() => ({
      data: schedule,
      isLoading: false,
    }));
    mutateUpdateSchedule.mockImplementation(async (input: ScheduleData) => {
      schedule = input;
      return input;
    });

    const { rerender } = renderWorkout();

    expect(screen.getByText('오늘의 운동')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /일시 정지/ }));

    await waitFor(() => {
      expect(mutateUpdateSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'PAUSED' }),
      );
    });

    schedule = { ...schedule, type: 'PAUSED', beforeTime: Date.now() };
    rerender(
      <MemoryRouter initialEntries={['/workout/1']}>
        <Routes>
          <Route path="/workout/:scheduleId" element={<Workout />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('일시정지')).toBeTruthy();
    expect(
      screen.getByText('휴식 중 · 언제든 다시 시작할 수 있어요'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '재개하기' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '재개하기' }));
    await waitFor(() => {
      expect(mutateUpdateSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'STARTED' }),
      );
    });
  });

  it('shows finish incomplete confirm then Finish Hub with CTAs', async () => {
    const user = userEvent.setup();
    renderWorkout();

    await user.click(screen.getByRole('button', { name: '운동 완료' }));

    const confirm = screen.getByRole('dialog', {
      name: '운동을 종료할까요?',
    });
    expect(
      within(confirm).getByText('아직 끝내지 않은 세트가 있습니다.'),
    ).toBeTruthy();

    await user.click(within(confirm).getByRole('button', { name: '종료' }));

    await waitFor(() => {
      expect(mutateUpdateSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'FINISH' }),
      );
    });

    const hub = await screen.findByRole('dialog', {
      name: '운동을 마쳤습니다',
    });
    expect(within(hub).getByRole('button', { name: '인증 만들기' })).toBeTruthy();
    expect(within(hub).getByRole('button', { name: '기록 보기' })).toBeTruthy();
    expect(within(hub).getByRole('button', { name: '홈으로' })).toBeTruthy();

    await user.click(within(hub).getByRole('button', { name: '인증 만들기' }));
    expect(await screen.findByTestId('photo-page')).toBeTruthy();
  });

  it('navigates Finish Hub history and home CTAs', async () => {
    const user = userEvent.setup();
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [{ ...incompleteSet, isDone: true }],
      isLoading: false,
    });

    const { unmount } = renderWorkout();
    await user.click(screen.getByRole('button', { name: '운동 완료' }));
    expect(screen.queryByRole('dialog', { name: '운동을 종료할까요?' })).toBeNull();

    const hub = await screen.findByRole('dialog', {
      name: '운동을 마쳤습니다',
    });
    await user.click(within(hub).getByRole('button', { name: '기록 보기' }));
    expect(await screen.findByTestId('history-page')).toBeTruthy();
    unmount();

    renderWorkout();
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [{ ...incompleteSet, isDone: true }],
      isLoading: false,
    });
    await user.click(screen.getByRole('button', { name: '운동 완료' }));
    const hub2 = await screen.findByRole('dialog', {
      name: '운동을 마쳤습니다',
    });
    await user.click(within(hub2).getByRole('button', { name: '홈으로' }));
    expect(await screen.findByTestId('home-page')).toBeTruthy();
  });

  it('shows empty exercises copy when there are 0 exercises', () => {
    useExerciseListByScheduleIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    useSetListByExerciseIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWorkout();

    expect(screen.getByText('아직 추가된 운동이 없습니다')).toBeTruthy();
    expect(
      screen.getByText('아래에서 종목을 검색해 추가하세요'),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /새로운 운동 종목 추가/ }),
    ).toBeTruthy();
  });

  it('shows picker empty state when search returns 0 results', async () => {
    const user = userEvent.setup();
    useFitnessListByKeywordsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    renderWorkout();
    await user.click(
      screen.getByRole('button', { name: /새로운 운동 종목 추가/ }),
    );

    const dialog = screen.getByRole('dialog', { name: '운동 선택' });
    expect(within(dialog).getByText('검색 결과가 없습니다')).toBeTruthy();
    expect(
      within(dialog).getByText('다른 키워드로 검색해 보세요'),
    ).toBeTruthy();
  });
});
