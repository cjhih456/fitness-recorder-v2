import type { Fitness, ScheduleData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { Pause, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExerciseCard from '../../components/section/workout/exerciseSection/ExerciseCard';
import FinishHub from '../../components/section/workout/exerciseSection/FinishHub';
import FinishIncompleteConfirm from '../../components/section/workout/exerciseSection/FinishIncompleteConfirm';
import Timer from '../../components/section/workout/exerciseSection/Timer';
import FitnessSearchDrawer from '../../components/section/workout/fitnessSearchDrawer/FitnessSearchDrawer';
import { useFormatedTime, useTimer } from '../../components/utils/timer';

function countSets(setsByExercise: Map<number, SetData[]>) {
  let done = 0;
  let total = 0;
  for (const sets of setsByExercise.values()) {
    total += sets.length;
    done += sets.filter((set) => set.isDone).length;
  }
  return { done, total };
}

function calcVolume(setsByExercise: Map<number, SetData[]>) {
  let volume = 0;
  for (const sets of setsByExercise.values()) {
    for (const set of sets) {
      if (!set.isDone) continue;
      volume += (set.weight ?? 0) * set.repeat;
    }
  }
  return volume;
}

export default function Workout() {
  const navigate = useNavigate();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const numericScheduleId = scheduleId ? Number(scheduleId) : undefined;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [finishHubOpen, setFinishHubOpen] = useState(false);
  const [setsByExercise, setSetsByExercise] = useState<Map<number, SetData[]>>(
    () => new Map(),
  );
  const [finishSummary, setFinishSummary] = useState({
    durationMs: 0,
    volume: 0,
  });

  const { data: scheduleData } = hooks.useScheduleQuery(numericScheduleId);
  const { data: exercises = [] } = hooks.useExerciseListByScheduleIdQuery(
    numericScheduleId,
  );

  const createExercise = hooks.useCreateExerciseByScheduleMutation();
  const addSet = hooks.useCreateSetMutation();
  const updateSet = hooks.useUpdateSetMutation();
  const deleteSet = hooks.useDeleteSetMutation();
  const updateSchedule = hooks.useUpdateScheduleMutation();
  const copyPreset = hooks.useCopyExercisePresetFromScheduleMutation();

  const isPaused = scheduleData?.type === 'PAUSED';
  const isFinished = scheduleData?.type === 'FINISH';
  const elapsedMs = useTimer(
    scheduleData?.start ?? 0,
    scheduleData?.breakTime ?? 0,
    isPaused || isFinished || !scheduleData,
  );
  const durationLabel = useFormatedTime(
    finishHubOpen ? finishSummary.durationMs : Math.abs(elapsedMs),
  );

  const { done, total } = useMemo(
    () => countSets(setsByExercise),
    [setsByExercise],
  );
  const incompleteCount = total - done;

  useEffect(() => {
    setSetsByExercise((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const exercise of exercises) {
        if (!next.has(exercise.id)) {
          next.set(exercise.id, []);
          changed = true;
        }
      }
      for (const key of [...next.keys()]) {
        if (!exercises.some((exercise) => exercise.id === key)) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [exercises]);

  const handleSetsChange = useCallback((exerciseId: number, sets: SetData[]) => {
    setSetsByExercise((prev) => {
      const current = prev.get(exerciseId);
      if (
        current &&
        current.length === sets.length &&
        current.every(
          (set, index) =>
            set.id === sets[index]?.id &&
            set.isDone === sets[index]?.isDone &&
            set.weight === sets[index]?.weight &&
            set.repeat === sets[index]?.repeat,
        )
      ) {
        return prev;
      }
      const next = new Map(prev);
      next.set(exerciseId, sets);
      return next;
    });
  }, []);

  const handleCreateExercise = useCallback(
    (fitness: Fitness) => {
      if (!numericScheduleId) return;
      createExercise.mutate({
        scheduleId: numericScheduleId,
        fitnessIds: [fitness.id],
      });
    },
    [numericScheduleId, createExercise],
  );

  const handleAddSet = useCallback(
    (exerciseId: number) => {
      addSet.mutate({
        exerciseId,
        repeat: 10,
        isDone: false,
        weightUnit: 'kg',
        weight: 0,
      });
    },
    [addSet],
  );

  const handleUpdateSet = useCallback(
    (set: SetData) => {
      updateSet.mutate(set);
      setSetsByExercise((prev) => {
        const list = prev.get(set.exerciseId) ?? [];
        const next = new Map(prev);
        next.set(
          set.exerciseId,
          list.map((item) => (item.id === set.id ? set : item)),
        );
        return next;
      });
    },
    [updateSet],
  );

  const handleDeleteSet = useCallback(
    (setId: number) => {
      deleteSet.mutate(setId);
      setSetsByExercise((prev) => {
        const next = new Map(prev);
        for (const [exerciseId, sets] of next.entries()) {
          if (sets.some((set) => set.id === setId)) {
            next.set(
              exerciseId,
              sets.filter((set) => set.id !== setId),
            );
            break;
          }
        }
        return next;
      });
    },
    [deleteSet],
  );

  const mutateScheduleType = useCallback(
    async (patch: Partial<ScheduleData>) => {
      if (!scheduleData) return null;
      return updateSchedule.mutateAsync({
        ...scheduleData,
        ...patch,
      });
    },
    [scheduleData, updateSchedule],
  );

  const handlePause = useCallback(() => {
    if (!scheduleData || scheduleData.type !== 'STARTED') return;
    void mutateScheduleType({
      type: 'PAUSED',
      beforeTime: Date.now(),
    });
  }, [scheduleData, mutateScheduleType]);

  const handleResume = useCallback(() => {
    if (!scheduleData || scheduleData.type !== 'PAUSED') return;
    const pauseStartedAt = scheduleData.beforeTime || Date.now();
    const extraBreak = Math.max(0, Date.now() - pauseStartedAt);
    void mutateScheduleType({
      type: 'STARTED',
      breakTime: (scheduleData.breakTime ?? 0) + extraBreak,
      beforeTime: 0,
    });
  }, [scheduleData, mutateScheduleType]);

  const performFinish = useCallback(async () => {
    if (!scheduleData) return;
    const durationMs = Math.abs(elapsedMs);
    const volume = calcVolume(setsByExercise);
    setFinishSummary({ durationMs, volume });
    await mutateScheduleType({
      type: 'FINISH',
      workoutTimes: Math.max(1, Math.round(durationMs / 60000)),
    });
    setFinishConfirmOpen(false);
    setFinishHubOpen(true);
  }, [scheduleData, elapsedMs, setsByExercise, mutateScheduleType]);

  const handleFinishClick = useCallback(() => {
    if (!scheduleData || isFinished) return;
    if (incompleteCount > 0) {
      setFinishConfirmOpen(true);
      return;
    }
    void performFinish();
  }, [scheduleData, isFinished, incompleteCount, performFinish]);

  const handleSaveRoutine = useCallback(async () => {
    if (!numericScheduleId) return;
    await copyPreset.mutateAsync({
      scheduleId: numericScheduleId,
      name: scheduleData?.title || '오늘의 운동',
    });
    navigate('/routines');
  }, [numericScheduleId, copyPreset, scheduleData?.title, navigate]);

  const volumeLabel = `${finishSummary.volume.toLocaleString('ko-KR')} kg`;

  return (
    <div className="relative mx-auto max-w-md p-4 pb-24">
      <div className="sticky top-[60px] z-20 mb-6 flex items-start justify-between gap-3 bg-background/80 py-2 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          {isPaused ? (
            <>
              <h2 className="text-2xl font-black text-blue-600">일시정지</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Timer
                  start={scheduleData?.start ?? 0}
                  isPaused
                  pausedTime={scheduleData?.breakTime ?? 0}
                />
                {total > 0 ? (
                  <span className="text-sm font-bold text-blue-600">
                    {done}/{total} 세트
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                휴식 중 · 언제든 다시 시작할 수 있어요
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 px-0 text-xs text-zinc-500"
                onClick={handleFinishClick}
              >
                운동 완료
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-foreground">오늘의 운동</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Timer
                  start={scheduleData?.start ?? 0}
                  isPaused={false}
                  pausedTime={scheduleData?.breakTime ?? 0}
                />
                {total > 0 ? (
                  <span className="text-sm font-bold text-blue-600">
                    {done}/{total} 세트
                  </span>
                ) : null}
                {!isFinished ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-zinc-500"
                    onClick={handlePause}
                    disabled={!scheduleData || scheduleData.type !== 'STARTED'}
                  >
                    <Pause size={12} />
                    일시 정지
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>

        {isPaused ? (
          <Button
            type="button"
            className="rounded-full bg-blue-600 px-6 shadow-lg shadow-blue-200 hover:bg-blue-700"
            onClick={handleResume}
          >
            재개하기
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-full bg-blue-600 px-6 shadow-lg shadow-blue-200 hover:bg-blue-700"
            onClick={handleFinishClick}
            disabled={!scheduleData || isFinished}
          >
            운동 완료
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {exercises.length === 0 ? (
          <div className="rounded-2xl bg-zinc-100 px-6 py-10 text-center dark:bg-zinc-900">
            <p className="font-bold text-foreground">
              아직 추가된 운동이 없습니다
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              아래에서 종목을 검색해 추가하세요
            </p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              addSet={handleAddSet}
              onUpdateSet={handleUpdateSet}
              onDeleteSet={handleDeleteSet}
              onSetsLoaded={handleSetsChange}
            />
          ))
        )}

        <div className="pb-8 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-4 font-bold text-zinc-500 transition-all hover:border-blue-300 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            새로운 운동 종목 추가
          </Button>
        </div>
      </div>

      <FitnessSearchDrawer
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSelect={handleCreateExercise}
      />

      <FinishIncompleteConfirm
        open={finishConfirmOpen}
        onOpenChange={setFinishConfirmOpen}
        onConfirm={() => {
          void performFinish();
        }}
        isPending={updateSchedule.isPending}
      />

      <FinishHub
        open={finishHubOpen}
        durationLabel={durationLabel}
        volumeLabel={volumeLabel}
        onOpenChange={setFinishHubOpen}
        onPhoto={() => navigate(`/photo?scheduleId=${scheduleData?.id ?? ''}`)}
        onHistory={() => navigate('/history')}
        onHome={() => navigate('/')}
        onSaveRoutine={() => {
          void handleSaveRoutine();
        }}
        isSavingRoutine={copyPreset.isPending}
      />
    </div>
  );
}
