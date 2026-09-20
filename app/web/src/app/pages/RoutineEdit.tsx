import type { Fitness } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button, Input, Label } from '@fitness-recoder/ui';
import { ChevronLeft, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import DiscardDraftConfirm from '../../components/section/routine-edit/DiscardDraftConfirm';
import FitnessPicker from '../../components/section/routine-edit/FitnessPicker';
import RoutineExerciseCard from '../../components/section/routine-edit/RoutineExerciseCard';
import {
  createDraftExercise,
  type DraftExercise,
  type DraftSet,
} from '../../components/section/routine-edit/types';
import DeleteRoutineConfirm from '../../components/section/routines/routines/DeleteRoutineConfirm';

export default function RoutineEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const presetId = isEdit ? Number(id) : undefined;

  const { data: preset, isLoading: isPresetLoading } =
    hooks.useExercisePresetQuery(presetId);
  const { data: loadedExercises = [], isLoading: isExercisesLoading } =
    hooks.useExerciseListByExercisePresetIdQuery(presetId);

  const createPreset = hooks.useCreateExercisePresetMutation();
  const updatePreset = hooks.useUpdateExercisePresetMutation();
  const deletePreset = hooks.useDeleteExercisePresetMutation();
  const createExercises = hooks.useCreateExerciseByExercisePresetMutation();
  const deleteExercise = hooks.useDeleteExerciseByIdMutation();
  const createSet = hooks.useCreateSetMutation();

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(!isEdit);

  const baselineRef = useRef<{ name: string; exercises: DraftExercise[] }>({
    name: '',
    exercises: [],
  });

  useEffect(() => {
    if (!isEdit) {
      setHydrated(true);
      return;
    }
    if (isPresetLoading || isExercisesLoading) return;
    if (!preset) {
      setHydrated(true);
      return;
    }

    const sourceExercises: Array<{ id: number; fitness?: Fitness | null }> =
      loadedExercises.length > 0
        ? loadedExercises
        : (preset.exerciseList ?? []);

    const draftExercises: DraftExercise[] = sourceExercises
      .filter(
        (exercise): exercise is { id: number; fitness: Fitness } =>
          Boolean(exercise.fitness),
      )
      .map((exercise) => ({
        localId: `loaded-${exercise.id}`,
        id: exercise.id,
        fitness: exercise.fitness as Fitness,
        sets: [
          {
            localId: `loaded-set-${exercise.id}-1`,
            weight: 0,
            repeat: 10,
          },
        ],
      }));

    setName(preset.name);
    setExercises(draftExercises);
    baselineRef.current = {
      name: preset.name,
      exercises: draftExercises,
    };
    setHydrated(true);
  }, [
    isEdit,
    isPresetLoading,
    isExercisesLoading,
    preset,
    loadedExercises,
  ]);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && exercises.length > 0 && !isSaving;

  const isDirty = useMemo(() => {
    if (!hydrated) return false;
    const baseline = baselineRef.current;
    if (trimmedName !== baseline.name.trim()) return true;
    if (exercises.length !== baseline.exercises.length) return true;
    return exercises.some((exercise, index) => {
      const baselineExercise = baseline.exercises[index];
      if (!baselineExercise) return true;
      if (exercise.fitness.id !== baselineExercise.fitness.id) return true;
      if (exercise.sets.length !== baselineExercise.sets.length) return true;
      return exercise.sets.some((set, setIndex) => {
        const baselineSet = baselineExercise.sets[setIndex];
        if (!baselineSet) return true;
        return (
          set.weight !== baselineSet.weight || set.repeat !== baselineSet.repeat
        );
      });
    });
  }, [exercises, hydrated, trimmedName]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    navigate(-1);
  }, [isDirty, navigate]);

  const handleDiscardConfirm = useCallback(() => {
    setDiscardOpen(false);
    navigate(-1);
  }, [navigate]);

  const handleAddExercise = useCallback((fitness: Fitness) => {
    setExercises((prev) => [...prev, createDraftExercise(fitness)]);
  }, []);

  const handleRemoveExercise = useCallback((localId: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.localId !== localId));
  }, []);

  const handleChangeSets = useCallback((localId: string, sets: DraftSet[]) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.localId === localId ? { ...exercise, sets } : exercise,
      ),
    );
  }, []);

  const persistSetsForExercises = useCallback(
    async (
      createdExercises: { id: number; fitnessId: number }[],
      draftList: DraftExercise[],
    ) => {
      for (const draft of draftList) {
        const matched = createdExercises.find(
          (item) => item.fitnessId === draft.fitness.id,
        );
        if (!matched) continue;
        for (const set of draft.sets) {
          await createSet.mutateAsync({
            exerciseId: matched.id,
            repeat: set.repeat,
            isDone: false,
            duration: 0,
            weightUnit: 'kg',
            weight: set.weight,
          });
        }
      }
    },
    [createSet],
  );

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      if (isEdit && presetId !== undefined && preset) {
        await updatePreset.mutateAsync({
          id: presetId,
          name: trimmedName,
          deps: preset.deps,
        });

        const keptIds = new Set(
          exercises.filter((item) => item.id !== undefined).map((item) => item.id),
        );
        const existingIds = (
          loadedExercises.length > 0
            ? loadedExercises
            : (preset.exerciseList ?? [])
        ).map((item: { id: number }) => item.id);

        for (const existingId of existingIds) {
          if (!keptIds.has(existingId)) {
            await deleteExercise.mutateAsync(existingId);
          }
        }

        const newDrafts = exercises.filter((item) => item.id === undefined);
        if (newDrafts.length > 0) {
          const created = await createExercises.mutateAsync({
            exercisePresetId: presetId,
            fitnessIds: newDrafts.map((item) => item.fitness.id),
          });
          await persistSetsForExercises(created, newDrafts);
        }
      } else {
        const createdPreset = await createPreset.mutateAsync({
          name: trimmedName,
          deps: 0,
        });
        const created = await createExercises.mutateAsync({
          exercisePresetId: createdPreset.id,
          fitnessIds: exercises.map((item) => item.fitness.id),
        });
        await persistSetsForExercises(created, exercises);
      }

      baselineRef.current = { name: trimmedName, exercises };
      navigate('/routines');
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    isEdit,
    presetId,
    preset,
    trimmedName,
    exercises,
    loadedExercises,
    updatePreset,
    deleteExercise,
    createExercises,
    createPreset,
    persistSetsForExercises,
    navigate,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    if (presetId === undefined) return;
    await deletePreset.mutateAsync(presetId);
    setDeleteOpen(false);
    navigate('/routines');
  }, [deletePreset, navigate, presetId]);

  const title = isEdit ? t('routines.edit') : t('routines.create');
  const exerciseCountLabel = t('routines.exerciseCount', {
    count: exercises.length,
  });

  if (isEdit && !hydrated) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-4 pb-28">
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md space-y-6 p-4 pb-28">
      <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t('common.back')}
          onClick={handleBack}
        >
          <ChevronLeft size={22} />
        </Button>
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('routines.deleteRoutine')}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={18} className="text-muted-foreground" />
          </Button>
        ) : (
          <span className="inline-block w-9" aria-hidden />
        )}
      </header>

      <section className="space-y-2">
        <Label htmlFor="routine-name" className="font-bold text-foreground">
          {t('routines.name')}
        </Label>
        <Input
          id="routine-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('routines.namePlaceholder')}
          className="h-12 rounded-2xl border-border bg-muted px-4 text-base focus-visible:border-ring"
          aria-invalid={trimmedName.length === 0}
        />
        {trimmedName.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('routines.nameRequired')}</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">{t('routines.exerciseSection')}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              exercises.length === 0
                ? 'bg-muted text-muted-foreground'
                : 'bg-brand-soft text-brand-text'
            }`}
          >
            {exerciseCountLabel}
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-muted px-6 py-12 text-center">
            <Dumbbell size={36} className="text-muted-foreground/50" aria-hidden />
            <p className="font-bold text-foreground">
              {t('workout.emptyTitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('workout.emptyHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <RoutineExerciseCard
                key={exercise.localId}
                exercise={exercise}
                onRemove={handleRemoveExercise}
                onChangeSets={handleChangeSets}
              />
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl border-brand/30 bg-background py-4 font-bold text-brand-text hover:bg-brand-soft"
          onClick={() => setPickerOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          {t('routines.addExercise')}
        </Button>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-md">
          <Button
            type="button"
            className="w-full rounded-2xl py-6 text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={!canSave}
            onClick={handleSave}
          >
            {isSaving ? t('routines.saving') : t('routines.save')}
          </Button>
        </div>
      </div>

      <FitnessPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddExercise}
      />
      <DiscardDraftConfirm
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        onConfirm={handleDiscardConfirm}
      />
      <DeleteRoutineConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isPending={deletePreset.isPending}
      />
    </div>
  );
}
