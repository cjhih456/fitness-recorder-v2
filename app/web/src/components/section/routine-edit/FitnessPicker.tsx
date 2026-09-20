import type { Fitness } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button, Input, Spinner } from '@fitness-recoder/ui';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type UIEvent } from 'react';
import { useTranslation } from 'react-i18next';
import FitnessItem from '../workout/fitnessSearchDrawer/FitnessItem';

const FITNESS_PICKER_PAGE_SIZE = 40;

interface FitnessPickerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (fitness: Fitness) => void;
}

export default function FitnessPicker({
  open = false,
  onOpenChange,
  onSelect,
}: FitnessPickerProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [loadedItems, setLoadedItems] = useState<Fitness[]>([]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setDebouncedQuery('');
      setOffset(0);
      setLoadedItems([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, searchQuery]);

  useEffect(() => {
    setOffset(0);
    setLoadedItems([]);
  }, [debouncedQuery]);

  const listParams = useMemo(
    () => ({
      ...(debouncedQuery ? { name: debouncedQuery } : {}),
      limit: FITNESS_PICKER_PAGE_SIZE,
      offset,
    }),
    [debouncedQuery, offset],
  );

  const { data = [], isLoading, isFetching } = hooks.useFitnessListByKeywordsQuery(
    listParams,
    { enabled: open },
  );

  useEffect(() => {
    if (!open || isFetching || offset === 0) return;
    setLoadedItems((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      const next = data.filter((item) => !seen.has(item.id));
      return next.length > 0 ? [...prev, ...next] : prev;
    });
  }, [open, isFetching, data, offset]);

  const items = offset === 0 ? data : loadedItems;

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleSelect = useCallback(
    (fitness: Fitness) => {
      onSelect?.(fitness);
      onOpenChange?.(false);
    },
    [onSelect, onOpenChange],
  );

  const handleListScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (isFetching || data.length < FITNESS_PICKER_PAGE_SIZE) return;
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      if (scrollHeight - scrollTop - clientHeight > 80) return;
      setLoadedItems((prev) => (offset === 0 ? data : prev));
      setOffset((prev) => prev + FITNESS_PICKER_PAGE_SIZE);
    },
    [data, isFetching, offset],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  const showEmpty = !isLoading && !isFetching && items.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label={t('common.close')}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fitness-picker-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-background shadow-lg md:max-h-[80vh] md:rounded-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-zinc-200 md:hidden" />
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2
            id="fitness-picker-title"
            className="text-lg font-bold text-foreground"
          >
            {t('routines.pickerTitle')}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-zinc-100 p-2"
            onClick={handleClose}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </Button>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
              aria-hidden
            />
            <Input
              type="search"
              aria-label={t('routines.searchAria')}
              placeholder={t('routines.searchPlaceholder')}
              className="rounded-full border-blue-500 bg-zinc-50 py-3 pl-10 pr-4"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-6"
          onScroll={handleListScroll}
        >
          {showEmpty ? (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="font-bold text-foreground">{t('routines.searchEmptyTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('routines.searchEmptyHint')}
              </p>
            </div>
          ) : (
            items.map((fitness) => (
              <FitnessItem
                key={fitness.id}
                fitness={fitness}
                onClick={handleSelect}
              />
            ))
          )}
          {(isLoading || isFetching) && !showEmpty ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
