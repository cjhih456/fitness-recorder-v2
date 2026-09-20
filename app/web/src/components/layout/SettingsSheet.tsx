import { APP_VERSION } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isAppLanguage, type AppLanguage } from '../../assets/i18n/i18n';

export { APP_VERSION };

interface SettingsSheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const language: AppLanguage = isAppLanguage(i18n.language)
    ? i18n.language
    : 'ko';

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
        aria-label={t('common.close')}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl bg-background px-4 pb-8 pt-3 shadow-lg sm:rounded-3xl"
      >
        <div className="mb-3 flex justify-center pt-1">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="mb-2 flex items-center justify-between pb-4">
          <h2
            id="settings-sheet-title"
            className="text-lg font-bold text-foreground"
          >
            {t('settings.title')}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={handleClose}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-1 py-3.5">
            <span className="text-sm font-medium text-foreground">
              {t('settings.theme')}
            </span>
            <div
              className="flex gap-1 rounded-full bg-muted p-0.5"
              role="group"
              aria-label={t('settings.theme')}
            >
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  !isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                aria-pressed={!isDark}
                onClick={() => setTheme('light')}
              >
                {t('settings.light')}
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                aria-pressed={isDark}
                onClick={() => setTheme('dark')}
              >
                {t('settings.dark')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-border px-1 py-3.5">
            <span className="text-sm font-medium text-foreground">
              {t('settings.language')}
            </span>
            <div
              className="flex gap-1 rounded-full bg-muted p-0.5"
              role="group"
              aria-label={t('settings.language')}
            >
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'ko'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                aria-pressed={language === 'ko'}
                onClick={() => void i18n.changeLanguage('ko')}
              >
                한국어
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                aria-pressed={language === 'en'}
                onClick={() => void i18n.changeLanguage('en')}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-border px-1 py-3.5">
            <span className="text-sm font-medium text-foreground">
              {t('settings.appVersion')}
            </span>
            <span className="text-[13px] text-muted-foreground">{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
