import { Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface TodayRoutineEmptyProps {
  onClickCreateRoutine?: () => void;
}

export default function TodayRoutineEmpty({
  onClickCreateRoutine,
}: TodayRoutineEmptyProps) {
  const { t } = useTranslation();
  const handleCreate = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);

  return (
    <Card
      className="cursor-pointer border bg-muted transition-colors hover:border-primary/30"
      onClick={handleCreate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCreate();
        }
      }}
      aria-label={t('dashboard.createRoutine')}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Dumbbell size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-foreground">
            {t('dashboard.emptyRoutine')}
          </p>
          <p className="text-[13px] font-medium text-primary">
            {t('dashboard.emptyRoutineHint')}
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-zinc-400" />
      </CardContent>
    </Card>
  );
}
