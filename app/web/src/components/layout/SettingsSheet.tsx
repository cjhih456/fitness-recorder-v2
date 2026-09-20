import { Button } from '@fitness-recoder/ui';
import { X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';

/** Matches GraphQLSQLiteWorkerProvider workerConfig.appVersion in App. */
export const APP_VERSION = '1.5.0';

type Language = 'ko' | 'en';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<Language>('ko');

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

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

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl bg-background px-4 pb-8 pt-3 shadow-lg sm:rounded-3xl"
      >
        <div className="mb-3 flex justify-center pt-1">
          <div className="h-1 w-9 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>

        <div className="mb-2 flex items-center justify-between pb-4">
          <h2
            id="settings-sheet-title"
            className="text-lg font-bold text-foreground"
          >
            설정
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={handleClose}
            aria-label="닫기"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 px-1 py-3.5 dark:border-zinc-800">
            <span className="text-sm font-medium text-foreground">테마</span>
            <div
              className="flex gap-1 rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900"
              role="group"
              aria-label="테마"
            >
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  !isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-zinc-500'
                }`}
                aria-pressed={!isDark}
                onClick={() => setTheme('light')}
              >
                라이트
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-zinc-500'
                }`}
                aria-pressed={isDark}
                onClick={() => setTheme('dark')}
              >
                다크
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-200 px-1 py-3.5 dark:border-zinc-800">
            <span className="text-sm font-medium text-foreground">언어</span>
            <div
              className="flex gap-1 rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900"
              role="group"
              aria-label="언어"
            >
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'ko'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-zinc-500'
                }`}
                aria-pressed={language === 'ko'}
                onClick={() => setLanguage('ko')}
              >
                한국어
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-zinc-500'
                }`}
                aria-pressed={language === 'en'}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-200 px-1 py-3.5 dark:border-zinc-800">
            <span className="text-sm font-medium text-foreground">앱 버전</span>
            <span className="text-[13px] text-zinc-500">{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
