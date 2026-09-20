import SectionSkeleton from '../../SectionSkeleton';
import Chart, { ChartData, MIN_CHART_POINTS } from './Chart';
import SparseChart, { sumVolumeTotals } from './SparseChart';

interface ChartSectionProps {
  data: ChartData[];
}

export default function ChartSection({ data }: ChartSectionProps) {
  const isSparse = data.length < MIN_CHART_POINTS;
  const subtitle = isSparse ? '최근 7일 · 데이터 부족' : '최근 7일';

  return (
    <SectionSkeleton title="총 볼륨 변화 (kg)">
      {{
        default: isSparse ? (
          <SparseChart totals={sumVolumeTotals(data)} />
        ) : (
          <Chart data={data} />
        ),
        subtitle: (
          <span className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </span>
        ),
      }}
    </SectionSkeleton>
  );
}
