import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button, Input } from '@fitness-recoder/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoShareCard from './PhotoShareCard';
import { downloadShareCard } from './downloadShareCard';
import {
  calcVolume,
  formatDurationFromMinutes,
  formatHighlightLine,
  formatPhotoDateLabel,
  formatPhotoTitle,
  formatVolumeLabel,
} from './formatPhoto';

interface PhotoSessionProps {
  schedule: ScheduleData;
}

function SetVolumeBridge({
  exerciseId,
  onSets,
}: {
  exerciseId: number;
  onSets: (exerciseId: number, sets: SetData[]) => void;
}) {
  const { data: sets = [] } = hooks.useSetListByExerciseIdQuery(exerciseId);
  useEffect(() => {
    onSets(exerciseId, sets);
  }, [exerciseId, sets, onSets]);
  return null;
}

export default function PhotoSession({ schedule }: PhotoSessionProps) {
  const { t, i18n } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [setsByExercise, setSetsByExercise] = useState(
    () => new Map<number, SetData[]>(),
  );

  const { data: exercises = [] } = hooks.useExerciseListByScheduleIdQuery(
    schedule.id,
  );

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleSets = useCallback((exerciseId: number, sets: SetData[]) => {
    setSetsByExercise((prev) => {
      const next = new Map(prev);
      next.set(exerciseId, sets);
      return next;
    });
  }, []);

  const volume = useMemo(
    () => calcVolume(setsByExercise),
    [setsByExercise],
  );
  const highlightLine = useMemo(
    () => formatHighlightLine(exercises as ExerciseData[], setsByExercise, t),
    [exercises, setsByExercise, t],
  );

  const handleChangePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      setImageUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!imageUrl || !cardRef.current || isSaving) return;
    setIsSaving(true);
    try {
      await downloadShareCard(cardRef.current);
    } finally {
      setIsSaving(false);
    }
  }, [imageUrl, isSaving]);

  const hasImage = Boolean(imageUrl);

  return (
    <div className="space-y-4">
      {(exercises as ExerciseData[]).map((exercise) => (
        <SetVolumeBridge
          key={`photo-vol-${exercise.id}`}
          exerciseId={exercise.id}
          onSets={handleSets}
        />
      ))}

      <PhotoShareCard
        ref={cardRef}
        title={formatPhotoTitle(schedule, t)}
        dateLabel={formatPhotoDateLabel(schedule, t)}
        volumeLabel={formatVolumeLabel(volume, i18n.language)}
        durationLabel={formatDurationFromMinutes(schedule.workoutTimes)}
        highlightLine={highlightLine}
        caption={caption.trim() || undefined}
        imageUrl={imageUrl}
      />

      <div className="space-y-2">
        <label
          htmlFor="photo-caption"
          className="text-[13px] font-semibold text-foreground"
        >
          {t('photo.addCaption')}
        </label>
        <Input
          id="photo-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder={t('photo.captionPlaceholder')}
          className="h-auto rounded-2xl border bg-muted px-4 py-3.5 text-sm"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className={`flex-1 rounded-2xl py-6 font-semibold ${
            hasImage ? '' : 'border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
          onClick={handleChangePhoto}
        >
          {t('photo.changePhoto')}
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-2xl bg-blue-600 py-6 font-bold text-white hover:bg-blue-700 disabled:opacity-40"
          disabled={!hasImage || isSaving}
          onClick={handleSave}
        >
          {t('photo.saveImage')}
        </Button>
      </div>
    </div>
  );
}
