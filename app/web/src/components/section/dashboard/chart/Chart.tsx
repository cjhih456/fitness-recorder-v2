import { ChartContainer, ChartTooltip } from '@fitness-recoder/ui';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export interface ChartData {
  date: string;
  chest: number;
  back: number;
  legs: number;
}

export const MIN_CHART_POINTS = 4;

interface ChartProps {
  data: ChartData[];
}

const SERIES = [
  {
    key: 'chest' as const,
    color: 'var(--chart-chest)',
    strokeDasharray: undefined,
  },
  {
    key: 'back' as const,
    color: 'var(--chart-back)',
    strokeDasharray: '6 4',
  },
  {
    key: 'legs' as const,
    color: 'var(--chart-legs)',
    strokeDasharray: '2 3',
  },
];

export default function Chart({ data }: ChartProps) {
  const { t } = useTranslation();
  const series = SERIES.map((item) => ({
    ...item,
    label: t(`group.${item.key}`),
  }));
  return (
    <div className="flex h-[180px] flex-col gap-3">
      <div className="flex gap-3" aria-hidden="true">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <ChartContainer
        config={{}}
        className="min-h-0 flex-1"
        aria-label={t('dashboard.volumeTrendAria')}
      >
        <LineChart data={data}>
          <ChartTooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            }}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)' }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)' }}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={item.strokeDasharray}
              dot={{ r: 3, fill: item.color }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
