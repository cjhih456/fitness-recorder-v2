import SectionSkeleton from "../../SectionSkeleton";
import Chart, { ChartData } from "./Chart";

interface ChartSectionProps {
  data: ChartData[];
}

export default function ChartSection({ data }: ChartSectionProps) {
  return (
    <SectionSkeleton title="부위별 총 볼륨 변화 (kg)">
      {{
        default: <Chart data={data} />,
        subtitle: <span className="text-xs text-zinc-500 font-medium">최근 7일</span>
      }}
    </SectionSkeleton>
  );
}