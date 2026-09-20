import type { Fitness } from '@fitness-recoder/structure';

export interface DraftSet {
  localId: string;
  id?: number;
  weight: number;
  repeat: number;
}

export interface DraftExercise {
  localId: string;
  id?: number;
  fitness: Fitness;
  sets: DraftSet[];
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultSet(): DraftSet {
  return {
    localId: createLocalId('set'),
    weight: 0,
    repeat: 10,
  };
}

export function createDraftExercise(fitness: Fitness): DraftExercise {
  return {
    localId: createLocalId('ex'),
    fitness,
    sets: [createDefaultSet()],
  };
}
