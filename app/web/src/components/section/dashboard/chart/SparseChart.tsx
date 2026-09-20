import { useTranslation } from 'react-i18next';

export interface SparseTotals {
  chest: number;
  back: number;
  legs: number;
}

interface SparseChartProps {
  totals: SparseTotals;
}

const STATS = [
  { key: 'chest' as const, colorClass: 'text-chart-chest' },
  { key: 'back' as const, colorClass: 'text-chart-back' },
  { key: 'legs' as const, colorClass: 'text-chart-legs' },
];

function formatVolume(value: number, locale: string): string {
  if (value <= 0) return '—';
  return value.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR');
}

export default function SparseChart({ totals }: SparseChartProps) {
  const { t, i18n } = useTranslation();
  return (
    <div
      className="grid h-[180px] grid-cols-3 gap-2"
      data-testid="sparse-chart"
      aria-label={t('dashboard.volumeSummaryAria')}
    >
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted p-3"
        >
          <span className={`text-[11px] font-semibold ${stat.colorClass}`}>
            {t(`group.${stat.key}`)}
          </span>
          <span className="text-xl font-bold text-foreground">
            {formatVolume(totals[stat.key], i18n.language)}
          </span>
          <span className="text-[10px] text-muted-foreground">kg</span>
        </div>
      ))}
    </div>
  );
}

export function sumVolumeTotals(
  data: Array<{ chest: number; back: number; legs: number }>,
): SparseTotals {
  return data.reduce(
    (acc, point) => ({
      chest: acc.chest + (point.chest || 0),
      back: acc.back + (point.back || 0),
      legs: acc.legs + (point.legs || 0),
    }),
    { chest: 0, back: 0, legs: 0 },
  );
}
