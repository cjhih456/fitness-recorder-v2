import { ChartContainer, ChartTooltip } from '@fitness-recoder/ui';
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
    label: '가슴',
    color: '#3B82F6',
    strokeDasharray: undefined,
  },
  {
    key: 'back' as const,
    label: '등',
    color: '#10B981',
    strokeDasharray: '6 4',
  },
  {
    key: 'legs' as const,
    label: '하체',
    color: '#F59E0B',
    strokeDasharray: '2 3',
  },
];

export default function Chart({ data }: ChartProps) {
  return (
    <div className="flex h-[180px] flex-col gap-3">
      <div className="flex gap-3" aria-hidden="true">
        {SERIES.map((series) => (
          <div key={series.key} className="flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              {series.label}
            </span>
          </div>
        ))}
      </div>
      <ChartContainer
        config={{}}
        className="min-h-0 flex-1"
        aria-label="최근 7일 가슴, 등, 하체 총 볼륨 추이"
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
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#888' }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#888' }}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              strokeDasharray={series.strokeDasharray}
              dot={{ r: 3, fill: series.color }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
