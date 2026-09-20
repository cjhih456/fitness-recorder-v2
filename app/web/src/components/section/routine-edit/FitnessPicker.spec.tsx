import type { Fitness } from '@fitness-recoder/structure';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FitnessPicker from './FitnessPicker';

const useFitnessListByKeywordsQuery = vi.fn();

vi.mock('@fitness-recoder/graphql-sqlite-worker', () => ({
  hooks: {
    useFitnessListByKeywordsQuery: (...args: unknown[]) =>
      useFitnessListByKeywordsQuery(...args),
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

describe('FitnessPicker', () => {
  beforeEach(() => {
    useFitnessListByKeywordsQuery.mockReset();
    useFitnessListByKeywordsQuery.mockReturnValue({
      data: [mockFitness],
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });
  });

  it('calls the keywords query with required limit and offset', () => {
    render(<FitnessPicker open />);

    expect(useFitnessListByKeywordsQuery).toHaveBeenCalledWith(
      { limit: 40 },
      { enabled: true },
    );
    expect(screen.getByRole('dialog', { name: '운동 선택' })).toBeTruthy();
    expect(screen.getByText('벤치프레스')).toBeTruthy();
  });
});
