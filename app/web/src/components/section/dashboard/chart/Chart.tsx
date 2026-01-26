import { ChartContainer, ChartTooltip } from '@fitness-recoder/ui';
import { LineChart, Line, CartesianGrid, YAxis, XAxis } from 'recharts';

export interface ChartData {
  date: string;
  chest: number;
  back: number;
  legs: number;
}

interface ChartProps {
  data: ChartData[];
}

export default function Chart(props: ChartProps) {
  return (
    <ChartContainer config={{}}>
      <LineChart data={props.data}>
        <ChartTooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
        <Line type="monotone" dataKey="chest" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
        <Line type="monotone" dataKey="back" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
        <Line type="monotone" dataKey="legs" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
      </LineChart>
    </ChartContainer>
  );
};