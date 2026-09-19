import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteRoutineConfirm from '../../components/section/routines/routines/DeleteRoutineConfirm';
import RoutineCardActions from '../../components/section/routines/routines/RoutineCardActions';
import RoutineSection from '../../components/section/routines/routines/RoutineSection';
import dayjs from '../../libs/dayjs';

function getTodayParts() {
  const today = dayjs();
  return {
    year: today.year(),
    month: today.month() + 1,
    date: today.date(),
  };
}

export default function Routines() {
  const navigate = useNavigate();
  const { data = [], isLoading } = hooks.useExercisePresetListQuery({
    offset: 0,
    size: 20,
  });
  const deleteMutation = hooks.useDeleteExercisePresetMutation();
  const cloneMutation = hooks.useCloneScheduleFromPresetMutation();

  const [pendingDelete, setPendingDelete] =
    useState<ExercisePresetWithExerciseList | null>(null);
  const [actionsRoutine, setActionsRoutine] =
    useState<ExercisePresetWithExerciseList | null>(null);
  const [startingPresetId, setStartingPresetId] = useState<number | null>(null);

  const handleCreateRoutine = useCallback(() => {
    navigate('/routines/new');
  }, [navigate]);

  const handleEditRoutine = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      setActionsRoutine(null);
      navigate(`/routines/${routine.id}/edit`);
    },
    [navigate],
  );

  const handleStartRoutine = useCallback(
    async (routine: ExercisePresetWithExerciseList) => {
      setStartingPresetId(routine.id);
      try {
        const schedule = await cloneMutation.mutateAsync({
          presetId: routine.id,
          targetDate: getTodayParts(),
        });
        setActionsRoutine(null);
        navigate(`/workout/${schedule.id}`);
      } finally {
        setStartingPresetId(null);
      }
    },
    [cloneMutation, navigate],
  );

  const handleDeleteRequest = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      setActionsRoutine(null);
      setPendingDelete(routine);
    },
    [],
  );

  const handleDeleteCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }, [deleteMutation, pendingDelete]);

  const handleOpenActions = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      setActionsRoutine(routine);
    },
    [],
  );

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <RoutineSection
        data={data}
        isLoading={isLoading}
        startingPresetId={startingPresetId}
        onClickCreateRoutine={handleCreateRoutine}
        onClickDeleteRoutine={handleDeleteRequest}
        onClickEditRoutine={handleEditRoutine}
        onClickStartRoutine={handleStartRoutine}
        onClickOpenActions={handleOpenActions}
      />
      <RoutineCardActions
        open={actionsRoutine !== null}
        routine={actionsRoutine}
        onOpenChange={(open) => {
          if (!open) setActionsRoutine(null);
        }}
        onClickStart={handleStartRoutine}
        onClickEdit={handleEditRoutine}
        onClickDelete={handleDeleteRequest}
        isStarting={
          actionsRoutine !== null && startingPresetId === actionsRoutine.id
        }
      />
      <DeleteRoutineConfirm
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
