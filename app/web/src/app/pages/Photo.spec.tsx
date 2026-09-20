import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Photo from './Photo';

const useScheduleQuery = vi.fn();
const useScheduleByDateQuery = vi.fn();
const useExerciseListByScheduleIdQuery = vi.fn();
const useSetListByExerciseIdQuery = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useScheduleQuery: (...args: unknown[]) => useScheduleQuery(...args),
    useScheduleByDateQuery: (...args: unknown[]) =>
      useScheduleByDateQuery(...args),
    useExerciseListByScheduleIdQuery: (...args: unknown[]) =>
      useExerciseListByScheduleIdQuery(...args),
    useSetListByExerciseIdQuery: (...args: unknown[]) =>
      useSetListByExerciseIdQuery(...args),
  },
}));

const downloadShareCard = vi.fn().mockResolvedValue(undefined);
vi.mock('../../components/section/photo/downloadShareCard', () => ({
  downloadShareCard: (...args: unknown[]) => downloadShareCard(...args),
}));

const mockFinish: ScheduleData = {
  id: 42,
  year: 2026,
  month: 5,
  date: 20,
  title: 'PULL DAY',
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
    name: '데드리프트',
    aliases: [],
    primaryMuscles: ['lower_back'],
    secondaryMuscles: [],
    force: 'pull',
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
  repeat: 5,
  isDone: true,
  weightUnit: 'kg',
  weight: 140,
};

function renderPhoto(entry = '/photo') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/photo" element={<Photo />} />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Photo page', () => {
  beforeEach(() => {
    useScheduleQuery.mockReset();
    useScheduleByDateQuery.mockReset();
    useExerciseListByScheduleIdQuery.mockReset();
    useSetListByExerciseIdQuery.mockReset();
    downloadShareCard.mockReset();
    downloadShareCard.mockResolvedValue(undefined);

    useScheduleQuery.mockReturnValue({ data: null, isLoading: false });
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

  it('shows RmDkP empty copy and CTA when there is no FINISH session', async () => {
    const user = userEvent.setup();
    useScheduleByDateQuery.mockReturnValue({ data: [], isLoading: false });

    renderPhoto();

    expect(screen.getByText('완료한 운동이 없습니다')).toBeTruthy();
    expect(
      screen.getByText('운동을 마치면 인증 사진을 만들 수 있어요'),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '운동 시작' }));
    expect(screen.getByTestId('home-page')).toBeTruthy();
  });

  it('disables save when session exists but no image is selected', () => {
    useScheduleByDateQuery.mockReturnValue({
      data: [mockFinish],
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

    renderPhoto();

    expect(screen.getByText('사진을 선택해 주세요')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: '이미지 저장' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(screen.getByRole('button', { name: '사진 변경' })).toBeTruthy();
    expect(screen.getByLabelText('문구 추가')).toBeTruthy();
  });

  it('enables save and calls download handler after an image is selected', async () => {
    const user = userEvent.setup();
    useScheduleByDateQuery.mockReturnValue({
      data: [mockFinish],
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

    const { container } = renderPhoto();

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(['fake-image'], 'gym.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(
        (
          screen.getByRole('button', {
            name: '이미지 저장',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false);
    });

    await user.click(screen.getByRole('button', { name: '이미지 저장' }));

    await waitFor(() => {
      expect(downloadShareCard).toHaveBeenCalledTimes(1);
    });
  });

  it('prefers scheduleId search param over today’s latest FINISH', () => {
    const paramSchedule: ScheduleData = {
      ...mockFinish,
      id: 99,
      title: 'PARAM DAY',
    };
    useScheduleQuery.mockReturnValue({
      data: paramSchedule,
      isLoading: false,
    });
    useScheduleByDateQuery.mockReturnValue({
      data: [mockFinish],
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

    renderPhoto('/photo?scheduleId=99');

    expect(screen.getByText('PARAM DAY')).toBeTruthy();
    expect(useScheduleQuery).toHaveBeenCalledWith(99);
  });
});
