import type { Fitness } from '@fitness-recoder/structure';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoutineEdit from './RoutineEdit';

const useExercisePresetQuery = vi.fn();
const useExerciseListByExercisePresetIdQuery = vi.fn();
const useFitnessListByKeywordsQuery = vi.fn();
const mutateCreatePreset = vi.fn();
const mutateUpdatePreset = vi.fn();
const mutateDeletePreset = vi.fn();
const mutateCreateExercises = vi.fn();
const mutateDeleteExercise = vi.fn();
const mutateCreateSet = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useExercisePresetQuery: (...args: unknown[]) =>
      useExercisePresetQuery(...args),
    useExerciseListByExercisePresetIdQuery: (...args: unknown[]) =>
      useExerciseListByExercisePresetIdQuery(...args),
    useFitnessListByKeywordsQuery: (...args: unknown[]) =>
      useFitnessListByKeywordsQuery(...args),
    useCreateExercisePresetMutation: () => ({
      mutateAsync: mutateCreatePreset,
      isPending: false,
    }),
    useUpdateExercisePresetMutation: () => ({
      mutateAsync: mutateUpdatePreset,
      isPending: false,
    }),
    useDeleteExercisePresetMutation: () => ({
      mutateAsync: mutateDeletePreset,
      isPending: false,
    }),
    useCreateExerciseByExercisePresetMutation: () => ({
      mutateAsync: mutateCreateExercises,
      isPending: false,
    }),
    useDeleteExerciseByIdMutation: () => ({
      mutateAsync: mutateDeleteExercise,
      isPending: false,
    }),
    useCreateSetMutation: () => ({
      mutateAsync: mutateCreateSet,
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

function renderCreate(options?: { withHistory?: boolean }) {
  const withHistory = options?.withHistory ?? false;
  return render(
    <MemoryRouter
      initialEntries={
        withHistory ? ['/routines', '/routines/new'] : ['/routines/new']
      }
      initialIndex={withHistory ? 1 : 0}
    >
      <Routes>
        <Route path="/routines/new" element={<RoutineEdit />} />
        <Route
          path="/routines"
          element={<div data-testid="routines-list">Routines</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoutineEdit page', () => {
  beforeEach(() => {
    useExercisePresetQuery.mockReset();
    useExerciseListByExercisePresetIdQuery.mockReset();
    useFitnessListByKeywordsQuery.mockReset();
    mutateCreatePreset.mockReset();
    mutateUpdatePreset.mockReset();
    mutateDeletePreset.mockReset();
    mutateCreateExercises.mockReset();
    mutateDeleteExercise.mockReset();
    mutateCreateSet.mockReset();

    useExercisePresetQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
    useExerciseListByExercisePresetIdQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    useFitnessListByKeywordsQuery.mockReturnValue({
      data: [mockFitness],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });
  });

  it('disables save when name is empty or there are 0 exercises', async () => {
    const user = userEvent.setup();
    renderCreate();

    const saveButton = screen.getByRole('button', {
      name: '저장하기',
    }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);

    await user.type(screen.getByLabelText('루틴 이름'), '상체 루틴');
    expect(saveButton.disabled).toBe(true);

    expect(screen.getByText('아직 추가된 운동이 없습니다')).toBeTruthy();
  });

  it('adds exercise via picker and saves with create mutations', async () => {
    const user = userEvent.setup();
    mutateCreatePreset.mockResolvedValue({ id: 101, name: '상체 루틴', deps: 0 });
    mutateCreateExercises.mockResolvedValue([
      { id: 201, fitnessId: 10, deps: 0 },
    ]);
    mutateCreateSet.mockResolvedValue({ id: 1 });

    renderCreate();

    await user.type(screen.getByLabelText('루틴 이름'), '상체 루틴');
    await user.click(screen.getByRole('button', { name: /운동 종목 추가/ }));

    const dialog = screen.getByRole('dialog', { name: '운동 선택' });
    await user.click(within(dialog).getByText('벤치프레스'));

    expect(screen.getByText('1개')).toBeTruthy();
    expect(screen.getByText('벤치프레스')).toBeTruthy();

    const saveButton = screen.getByRole('button', {
      name: '저장하기',
    }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);

    await user.click(saveButton);

    await waitFor(() => {
      expect(mutateCreatePreset).toHaveBeenCalledWith({
        name: '상체 루틴',
        deps: 0,
      });
    });
    expect(mutateCreateExercises).toHaveBeenCalledWith({
      exercisePresetId: 101,
      fitnessIds: [10],
    });
    expect(await screen.findByTestId('routines-list')).toBeTruthy();
  });

  it('shows discard confirm on dirty back and leaves on confirm', async () => {
    const user = userEvent.setup();
    renderCreate({ withHistory: true });

    await user.type(screen.getByLabelText('루틴 이름'), '임시');
    await user.click(screen.getByRole('button', { name: '뒤로' }));

    const dialog = screen.getByRole('dialog', {
      name: '수정을 취소할까요?',
    });
    expect(
      within(dialog).getByText('저장하지 않은 내용이 사라집니다.'),
    ).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: '나가기' }));
    expect(await screen.findByTestId('routines-list')).toBeTruthy();
  });

  it('keeps editing when discard confirm is cancelled', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText('루틴 이름'), '임시');
    await user.click(screen.getByRole('button', { name: '뒤로' }));

    const dialog = screen.getByRole('dialog', {
      name: '수정을 취소할까요?',
    });
    await user.click(
      within(dialog).getByRole('button', { name: '계속 편집' }),
    );

    expect(screen.queryByRole('dialog', { name: '수정을 취소할까요?' })).toBeNull();
    expect(screen.getByDisplayValue('임시')).toBeTruthy();
    expect(screen.getByText('루틴 생성')).toBeTruthy();
  });
});
