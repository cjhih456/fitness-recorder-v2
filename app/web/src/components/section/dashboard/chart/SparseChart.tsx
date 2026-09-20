export interface SparseTotals {
  chest: number;
  back: number;
  legs: number;
}

interface SparseChartProps {
  totals: SparseTotals;
}

const STATS = [
  { key: 'chest' as const, label: '가슴', colorClass: 'text-[#3B82F6]' },
  { key: 'back' as const, label: '등', colorClass: 'text-[#10B981]' },
  { key: 'legs' as const, label: '하체', colorClass: 'text-[#F59E0B]' },
];

function formatVolume(value: number): string {
  if (value <= 0) return '—';
  return value.toLocaleString('ko-KR');
}

export default function SparseChart({ totals }: SparseChartProps) {
  return (
    <div
      className="grid h-[180px] grid-cols-3 gap-2"
      data-testid="sparse-chart"
      aria-label="최근 7일 부위별 총 볼륨 요약"
    >
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted p-3"
        >
          <span className={`text-[11px] font-semibold ${stat.colorClass}`}>
            {stat.label}
          </span>
          <span className="text-xl font-bold text-foreground">
            {formatVolume(totals[stat.key])}
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
