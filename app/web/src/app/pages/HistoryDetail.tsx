import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import HistoryDetailSection from '../../components/section/history/detail/HistoryDetailSection';
import { formatScheduleTitle } from '../../components/section/history/history/formatHistory';
import PageLoadingSkeleton from '../../components/utils/PageLoadingSkeleton';

export default function HistoryDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const numericId = scheduleId ? Number(scheduleId) : undefined;

  const { data: schedule, isLoading: isScheduleLoading } =
    hooks.useScheduleQuery(numericId);
  const { data: exercises = [], isLoading: isExercisesLoading } =
    hooks.useExerciseListByScheduleIdQuery(numericId);
  const copyPreset = hooks.useCopyExercisePresetFromScheduleMutation();
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = useCallback(() => {
    navigate('/history');
  }, [navigate]);

  const handleSaveAsRoutine = useCallback(async () => {
    if (!schedule) return;
    setIsSaving(true);
    try {
      await copyPreset.mutateAsync({
        scheduleId: schedule.id,
        name: formatScheduleTitle(schedule, t),
      });
      navigate('/routines');
    } finally {
      setIsSaving(false);
    }
  }, [copyPreset, navigate, schedule, t]);

  if (isScheduleLoading || isExercisesLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!schedule || schedule.type !== 'FINISH') {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-medium text-primary"
        >
          {t('error.history.back')}
        </button>
        <p className="text-sm text-muted-foreground">{t('error.history.notFound')}</p>
      </div>
    );
  }

  return (
    <HistoryDetailSection
      schedule={schedule}
      exercises={exercises}
      onBack={handleBack}
      onSaveAsRoutine={handleSaveAsRoutine}
      isSavingRoutine={isSaving}
    />
  );
}
