import type { ExerciseData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button, Card, CardContent } from '@fitness-recoder/ui';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ExerciseSetInput from './ExerciseSetInput';
import RecentRecordsSheet, {
  type RecentRecordRow,
} from './RecentRecordsSheet';

interface ExerciseCardProps {
  exercise: ExerciseData;
  addSet: (exerciseId: number) => void;
  onUpdateSet: (set: SetData) => void;
  onDeleteSet?: (setId: number) => void;
  onSetsLoaded?: (exerciseId: number, sets: SetData[]) => void;
}

export default function ExerciseCard({
  exercise,
  addSet,
  onUpdateSet,
  onDeleteSet,
  onSetsLoaded,
}: ExerciseCardProps) {
  const [recordsOpen, setRecordsOpen] = useState(false);
  const exerciseName = exercise.fitness?.name ?? '운동';

  const { data: sets = [] } = hooks.useSetListByExerciseIdQuery(exercise.id);
  const { data: history = [] } = hooks.useExerciseFinishHistoryQuery(
    exercise.fitnessId,
    { enabled: recordsOpen },
  );

  useEffect(() => {
    onSetsLoaded?.(exercise.id, sets);
  }, [exercise.id, sets, onSetsLoaded]);

  const handleAddSet = useCallback(() => addSet(exercise.id), [addSet, exercise.id]);

  const records: RecentRecordRow[] = useMemo(() => {
    return history.flatMap((entry) =>
      entry.historyList.map((set, index) => ({
        id: `${entry.id}-${index}`,
        dateLabel: `${entry.month}월 ${entry.date}일`,
        weight: set.weight,
        repeat: set.repeat,
      })),
    );
  }, [history]);

  return (
    <>
      <Card className="border-zinc-100 shadow-sm dark:border-zinc-800">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-1.5 rounded-full bg-blue-600" />
              {exerciseName}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-500"
              onClick={() => setRecordsOpen(true)}
            >
              기록 확인
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase text-zinc-400">
            <div className="col-span-2 text-center">세트</div>
            <div className="col-span-3 text-center">무게 (kg)</div>
            <div className="col-span-3 text-center">횟수</div>
            <div className="col-span-2 text-center">완료</div>
            <div className="col-span-2 text-center">삭제</div>
          </div>

          {sets.map((set, index) => (
            <ExerciseSetInput
              key={set.id}
              set={set}
              index={index}
              exerciseName={exerciseName}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed py-3 text-zinc-400 hover:border-blue-200 hover:text-blue-600"
            onClick={handleAddSet}
          >
            <Plus size={18} className="mr-2" />
            세트 추가
          </Button>
        </CardContent>
      </Card>

      <RecentRecordsSheet
        open={recordsOpen}
        exerciseName={exerciseName}
        records={records}
        onOpenChange={setRecordsOpen}
      />
    </>
  );
}
