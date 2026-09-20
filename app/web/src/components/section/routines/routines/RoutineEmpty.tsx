import { Button, Card, CardContent, CardFooter, CardTitle, Separator } from '@fitness-recoder/ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface RoutineEmptyProps {
  onClickCreateRoutine?: () => void;
}

export default function RoutineEmpty({ onClickCreateRoutine }: RoutineEmptyProps) {
  const { t } = useTranslation();
  const handleCreate = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);

  return (
    <Card className="overflow-hidden pb-0">
      <CardContent>
        <div>
          <CardTitle className="text-lg">{t('routines.emptyTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground mb-2">
            {t('routines.emptyHint')}
          </p>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-md text-[10px] font-bold uppercase">
              CREATE
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-full">
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="rounded-t-none rounded-b-2xl w-full text-xs font-bold text-blue-600 dark:text-blue-400"
            onClick={handleCreate}
          >
            {t('routines.create')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
