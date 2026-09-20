import type { ChartData } from '../../components/section/dashboard/chart/Chart';
import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChartSection from '../../components/section/dashboard/chart/ChartSection';
import Dashboard from './Dashboard';

const useExercisePresetListQuery = vi.fn();
const mutateClone = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useExercisePresetListQuery: (...args: unknown[]) =>
      useExercisePresetListQuery(...args),
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

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/routines"
          element={<div data-testid="routines-page">Routines</div>}
        />
        <Route
          path="/workout/:scheduleId"
          element={<div data-testid="workout-page">Workout</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
}

describe('Dashboard page', () => {
  beforeEach(() => {
    useExercisePresetListQuery.mockReset();
    mutateClone.mockReset();
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });


  it('shows empty copy and CTA when there are no presets', async () => {
    useExercisePresetListQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderDashboard();

    expect(useExercisePresetListQuery).toHaveBeenCalledWith({
      size: 20,
    });
    expect(screen.getByText('오늘 시작할 루틴이 없습니다')).toBeTruthy();
    expect(screen.getByText('루틴 탭에서 만들어 보세요')).toBeTruthy();

    await user.click(screen.getByLabelText('루틴 만들기'));
    expect(screen.getByTestId('routines-page')).toBeTruthy();
  });

  it('clones preset and navigates to /workout/:id on start', async () => {
    useExercisePresetListQuery.mockReturnValue({
      data: [mockPreset],
      isLoading: false,
    });
    mutateClone.mockResolvedValue({ id: 42 });

    const user = userEvent.setup();
    renderDashboard();

    expect(screen.getByText('상체 위주 루틴')).toBeTruthy();

    await user.click(screen.getByLabelText('상체 위주 루틴 시작'));

    await waitFor(() => {
      expect(mutateClone).toHaveBeenCalledWith({
        presetId: 7,
        targetDate: expect.objectContaining({
          year: expect.any(Number),
          month: expect.any(Number),
          date: expect.any(Number),
        }),
      });
    });

    expect(screen.getByTestId('workout-page')).toBeTruthy();
  });

  it('renders sparse stat cards when volume has fewer than 4 points', () => {
    const sparse: ChartData[] = [
      { date: '05-18', chest: 100, back: 0, legs: 50 },
      { date: '05-19', chest: 0, back: 200, legs: 0 },
    ];

    render(<ChartSection data={sparse} />);

    expect(screen.getByTestId('sparse-chart')).toBeTruthy();
    expect(screen.getByText('최근 7일 · 데이터 부족')).toBeTruthy();
    expect(screen.getByText('가슴')).toBeTruthy();
    expect(screen.getByText('등')).toBeTruthy();
    expect(screen.getByText('하체')).toBeTruthy();
    expect(screen.queryByLabelText(/총 볼륨 추이/)).toBeNull();
  });

  it('renders line chart when volume has at least 4 points', () => {
    const full: ChartData[] = [
      { date: '05-18', chest: 100, back: 0, legs: 0 },
      { date: '05-19', chest: 0, back: 200, legs: 0 },
      { date: '05-20', chest: 50, back: 0, legs: 300 },
      { date: '05-21', chest: 0, back: 100, legs: 0 },
    ];

    render(<ChartSection data={full} />);

    expect(screen.queryByTestId('sparse-chart')).toBeNull();
    expect(screen.getByText('최근 7일')).toBeTruthy();
    expect(
      screen.getByLabelText('최근 7일 가슴, 등, 하체 총 볼륨 추이'),
    ).toBeTruthy();
  });
});
