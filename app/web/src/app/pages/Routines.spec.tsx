import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Routines from './Routines';

const useExercisePresetListQuery = vi.fn();
const mutateDelete = vi.fn();
const mutateClone = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useExercisePresetListQuery: (...args: unknown[]) =>
      useExercisePresetListQuery(...args),
    useDeleteExercisePresetMutation: () => ({
      mutateAsync: mutateDelete,
      isPending: false,
    }),
    useCloneScheduleFromPresetMutation: () => ({
      mutateAsync: mutateClone,
      isPending: false,
    }),
  },
}));

const mockPreset: ExercisePresetWithExerciseList = {
  id: 7,
  name: '상체 위주 루틴',
  deps: 0,
  exerciseList: [
    {
      id: 1,
      fitnessId: 10,
      deps: 0,
      fitness: {
        id: 10,
        name: 'Bench Press',
        aliases: [],
        primaryMuscles: ['chest', 'shoulders', 'triceps'],
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
    },
  ],
};

function renderRoutines() {
  return render(
    <MemoryRouter initialEntries={['/routines']}>
      <Routes>
        <Route path="/routines" element={<Routines />} />
        <Route
          path="/routines/new"
          element={<div data-testid="routine-new">New</div>}
        />
        <Route
          path="/routines/:id/edit"
          element={<div data-testid="routine-edit">Edit</div>}
        />
        <Route
          path="/workout/:scheduleId"
          element={<div data-testid="workout-page">Workout</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Routines page', () => {
  beforeEach(() => {
    useExercisePresetListQuery.mockReset();
    mutateDelete.mockReset();
    mutateClone.mockReset();
  });

  it('shows empty state copy when there are no presets', () => {
    useExercisePresetListQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderRoutines();

    expect(useExercisePresetListQuery).toHaveBeenCalledWith({
      size: 20,
    });
    expect(screen.getByText('나만의 루틴을 만들어 보세요')).toBeTruthy();
    expect(
      screen.getByText(
        '자주 하는 운동을 저장해 두면 한 번에 시작할 수 있어요',
      ),
    ).toBeTruthy();
  });

  it('renders preset names in the happy list', () => {
    useExercisePresetListQuery.mockReturnValue({
      data: [mockPreset],
      isLoading: false,
    });

    renderRoutines();

    expect(screen.getByText('상체 위주 루틴')).toBeTruthy();
    expect(screen.getByText('편집하기')).toBeTruthy();
    expect(screen.getByText('이 루틴으로 시작')).toBeTruthy();
  });

  it('clones preset and navigates to workout on start', async () => {
    const user = userEvent.setup();
    useExercisePresetListQuery.mockReturnValue({
      data: [mockPreset],
      isLoading: false,
    });
    mutateClone.mockResolvedValue({ id: 55 });

    renderRoutines();

    await user.click(screen.getByRole('button', { name: '이 루틴으로 시작' }));

    await waitFor(() => {
      expect(mutateClone).toHaveBeenCalledWith(
        expect.objectContaining({
          presetId: 7,
          targetDate: expect.objectContaining({
            year: expect.any(Number),
            month: expect.any(Number),
            date: expect.any(Number),
          }),
        }),
      );
    });
    expect(await screen.findByTestId('workout-page')).toBeTruthy();
  });

  it('opens delete confirm and deletes on confirm', async () => {
    const user = userEvent.setup();
    useExercisePresetListQuery.mockReturnValue({
      data: [mockPreset],
      isLoading: false,
    });
    mutateDelete.mockResolvedValue('ok');

    renderRoutines();

    await user.click(
      screen.getByRole('button', { name: '상체 위주 루틴 삭제' }),
    );

    const dialog = screen.getByRole('dialog', { name: '루틴을 삭제할까요?' });
    expect(within(dialog).getByText('삭제하면 되돌릴 수 없습니다.')).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(mutateDelete).toHaveBeenCalledWith(7);
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup();
    useExercisePresetListQuery.mockReturnValue({
      data: [mockPreset],
      isLoading: false,
    });

    renderRoutines();

    await user.click(
      screen.getByRole('button', { name: '상체 위주 루틴 삭제' }),
    );

    const dialog = screen.getByRole('dialog', { name: '루틴을 삭제할까요?' });
    await user.click(within(dialog).getByRole('button', { name: '취소' }));

    expect(mutateDelete).not.toHaveBeenCalled();
  });

  it('navigates to create page from header CTA', async () => {
    const user = userEvent.setup();
    useExercisePresetListQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderRoutines();

    const createButtons = screen.getAllByRole('button', { name: /루틴 생성/ });
    await user.click(createButtons[0]);

    expect(await screen.findByTestId('routine-new')).toBeTruthy();
  });
});
