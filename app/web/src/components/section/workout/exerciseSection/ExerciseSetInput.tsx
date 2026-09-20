import type { SetData } from '@fitness-recoder/structure';
import { Input } from '@fitness-recoder/ui';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          ? 'border-success/30 bg-success-soft opacity-90'
          : 'border-transparent bg-muted shadow-inner'
      }`}
    >
      <div className="col-span-2 flex items-center justify-center font-bold text-muted-foreground">
        {index + 1}
      </div>
      <div className="col-span-3">
        <Input
          type="number"
          inputMode="decimal"
          aria-label={t('workout.setWeightAria', {
            name: exerciseName,
            index: index + 1,
          })}
          value={set.weight ?? 0}
          onChange={handleWeightChange}
          className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
        />
      </div>
      <div className="col-span-3">
        <Input
          type="number"
          inputMode="numeric"
          aria-label={t('workout.setRepsAria', {
            name: exerciseName,
            index: index + 1,
          })}
          value={set.repeat}
          onChange={handleRepeatChange}
          className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
        />
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <button
          type="button"
          aria-label={t('workout.setDoneAria', {
            name: exerciseName,
            index: index + 1,
          })}
          aria-pressed={set.isDone}
          onClick={handleToggleDone}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            set.isDone
              ? 'bg-success text-success-foreground shadow-md'
              : 'border-2 border-border bg-background text-transparent'
          }`}
        >
          <CheckCircle2 size={20} />
        </button>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <button
          type="button"
          aria-label={t('workout.setDeleteAria', {
            name: exerciseName,
            index: index + 1,
          })}
          onClick={handleDelete}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
