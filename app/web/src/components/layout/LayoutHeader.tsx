import { Button } from '@fitness-recoder/ui';
import { Dumbbell, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsSheet from './SettingsSheet';

export default function LayoutHeader() {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
            <Dumbbell size={24} /> {t('app.name')}
          </h1>
          <Button
            type="button"
            variant="ghost"
            className="p-2"
            aria-label={t('settings.title')}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={20} />
          </Button>
        </div>
      </header>
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
