import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import App from './app';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  GraphQLSQLiteWorkerProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  APP_VERSION: '1.5.0',
  hooks: {
    useScheduleByDateQuery: () => ({ data: [], isLoading: false }),
    useCreateScheduleMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useUpdateScheduleMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useExercisePresetListQuery: () => ({ data: [], isLoading: false }),
    useCloneScheduleFromPresetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useExercisePresetQuery: () => ({ data: null, isLoading: false }),
    useExerciseListByExercisePresetIdQuery: () => ({
      data: [],
      isLoading: false,
    }),
    useFitnessListByKeywordsQuery: () => ({
      data: [],
      isLoading: false,
      isFetching: false,
    }),
    useCreateExercisePresetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useUpdateExercisePresetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useDeleteExercisePresetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useCreateExerciseByExercisePresetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useDeleteExerciseByIdMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useCreateSetMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useScheduleStatusByMonthQuery: () => ({ data: [], isLoading: false }),
    useScheduleQuery: () => ({
      data: {
        id: 7,
        year: 2026,
        month: 5,
        date: 20,
        title: '',
        type: 'FINISH',
        start: 0,
        beforeTime: 0,
        breakTime: 0,
        workoutTimes: 30,
      },
      isLoading: false,
    }),
    useExerciseListByScheduleIdQuery: () => ({ data: [], isLoading: false }),
    useSetListByExerciseIdQuery: () => ({ data: [], isLoading: false }),
    useCopyExercisePresetFromScheduleMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  },
}));

vi.mock(
  '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url',
  () => ({ default: '' }),
);
vi.mock(
  '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url',
  () => ({ default: '' }),
);
vi.mock(
  '@fitness-recoder/graphql-sqlite-worker/seedDb?url',
  () => ({ default: '' }),
);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  it('renders successfully at home', async () => {
    const { baseElement } = renderAt('/');
    expect(baseElement).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('FITLOG')).toBeTruthy();
    });
    expect(await screen.findByText('총 볼륨 변화 (kg)')).toBeTruthy();
    expect(await screen.findByText('오늘 시작할 루틴이 없습니다')).toBeTruthy();
  });

  it('renders photo page without crash', async () => {
    renderAt('/photo');
    expect(
      await screen.findByText('운동 인증 사진 만들기'),
    ).toBeTruthy();
  });

  it('renders routines/new without crash', async () => {
    renderAt('/routines/new');
    expect(await screen.findByText('루틴 생성')).toBeTruthy();
  });

  it('renders history detail without crash', async () => {
    renderAt('/history/7');
    expect(await screen.findByText('운동 기록')).toBeTruthy();
    expect(
      await screen.findByText('이 세션에 기록된 운동이 없습니다'),
    ).toBeTruthy();
  });
});
