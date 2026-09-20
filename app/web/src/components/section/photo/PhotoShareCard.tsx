import { Calendar, Camera, CheckCircle2, Dumbbell } from 'lucide-react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface PhotoShareCardProps {
  title: string;
  dateLabel: string;
  volumeLabel: string;
  durationLabel: string;
  highlightLine: string | null;
  caption?: string;
  imageUrl: string | null;
}

const PhotoShareCard = forwardRef<HTMLDivElement, PhotoShareCardProps>(
  function PhotoShareCard(
    {
      title,
      dateLabel,
      volumeLabel,
      durationLabel,
      highlightLine,
      caption,
      imageUrl,
    },
    ref,
  ) {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        id="export-card"
        className="relative aspect-3/4 w-full overflow-hidden rounded-3xl border-4 border-white shadow-2xl dark:border-zinc-800"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover brightness-75"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/60 p-7 text-white">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg">
              <div className="mb-1 text-[10px] font-black uppercase italic tracking-widest opacity-80">
                Today&apos;s Workout
              </div>
              <div className="text-2xl font-black uppercase leading-none tracking-tight">
                {title}
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[10px]">
                <Calendar size={10} aria-hidden />
                {dateLabel}
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-500/50">
              <Dumbbell size={24} aria-hidden />
            </div>
          </div>

          {!imageUrl ? (
            <div className="flex flex-col items-center gap-2 self-center text-muted-foreground">
              <Camera size={28} aria-hidden />
              <p className="text-[13px] font-medium">{t('photo.choosePhoto')}</p>
            </div>
          ) : caption ? (
            <p className="self-center text-center text-sm font-semibold drop-shadow">
              {caption}
            </p>
          ) : (
            <div />
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Total Volume
                </p>
                <p className="text-2xl font-black">
                  {volumeLabel}
                  <span className="ml-1 text-sm font-normal">kg</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Duration
                </p>
                <p className="text-2xl font-black tracking-tighter">
                  {durationLabel}
                </p>
              </div>
            </div>

            {highlightLine ? (
              <div className="flex items-center justify-between rounded-2xl border border-blue-400/30 bg-blue-600/80 p-4 backdrop-blur-md">
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {t('photo.bestRecord')}
                  </p>
                  <p className="text-lg font-black">{highlightLine}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                  <CheckCircle2 size={24} aria-hidden />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

export default PhotoShareCard;
