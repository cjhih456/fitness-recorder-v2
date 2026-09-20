import { useTranslation } from 'react-i18next';
import SectionSkeleton from '../../SectionSkeleton';
import Chart, { ChartData, MIN_CHART_POINTS } from './Chart';
import SparseChart, { sumVolumeTotals } from './SparseChart';

interface ChartSectionProps {
  data: ChartData[];
}

export default function ChartSection({ data }: ChartSectionProps) {
  const { t } = useTranslation();
  const isSparse = data.length < MIN_CHART_POINTS;
  const subtitle = isSparse
    ? t('dashboard.last7daysSparse')
    : t('dashboard.last7days');

  return (
    <SectionSkeleton title={t('dashboard.volumeTitle')}>
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
