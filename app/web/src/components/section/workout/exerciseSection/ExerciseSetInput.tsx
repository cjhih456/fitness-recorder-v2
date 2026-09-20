import type { SetData } from '@fitness-recoder/structure';
import { Input } from '@fitness-recoder/ui';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

interface ExerciseSetInputProps {
  set: SetData;
  index: number;
  exerciseName: string;
  onUpdate: (set: SetData) => void;
  onDelete?: (setId: number) => void;
}

export default function ExerciseSetInput({
  set,
  index,
  exerciseName,
  onUpdate,
  onDelete,
}: ExerciseSetInputProps) {
  const handleWeightChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...set,
        weight: Number(event.target.value) || 0,
      });
    },
    [onUpdate, set],
  );

  const handleRepeatChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...set,
        repeat: Number(event.target.value) || 0,
      });
    },
    [onUpdate, set],
  );

  const handleToggleDone = useCallback(() => {
    onUpdate({
      ...set,
      isDone: !set.isDone,
    });
  }, [onUpdate, set]);

  const handleDelete = useCallback(() => {
    onDelete?.(set.id);
  }, [onDelete, set.id]);

  return (
    <div
      className={`grid grid-cols-12 gap-2 rounded-xl border p-2 transition-all ${
        set.isDone
          ? 'border-green-200 bg-green-50 opacity-90 dark:border-green-800 dark:bg-green-900/20'
          : 'border-transparent bg-zinc-50 shadow-inner dark:bg-zinc-900/50'
      }`}
    >
      <div className="col-span-2 flex items-center justify-center font-bold text-zinc-500">
        {index + 1}
      </div>
      <div className="col-span-3">
        <Input
          type="number"
          inputMode="decimal"
          aria-label={`${exerciseName} ${index + 1}세트 무게`}
          value={set.weight ?? 0}
          onChange={handleWeightChange}
          className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
        />
      </div>
      <div className="col-span-3">
        <Input
          type="number"
          inputMode="numeric"
          aria-label={`${exerciseName} ${index + 1}세트 횟수`}
          value={set.repeat}
          onChange={handleRepeatChange}
          className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
        />
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <button
          type="button"
          aria-label={`${exerciseName} ${index + 1}세트 완료`}
          aria-pressed={set.isDone}
          onClick={handleToggleDone}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            set.isDone
              ? 'bg-green-500 text-white shadow-md'
              : 'border-2 border-zinc-200 bg-background text-transparent dark:border-zinc-700'
          }`}
        >
          <CheckCircle2 size={20} />
        </button>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <button
          type="button"
          aria-label={`${exerciseName} ${index + 1}세트 삭제`}
          onClick={handleDelete}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
