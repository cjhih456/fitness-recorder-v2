import type { ScheduleHistoryData } from '@fitness-recoder/structure'
import { Button } from "@fitness-recoder/ui";
import { Calendar } from "lucide-react";
import { useCallback } from "react";
import SectionSkeleton from "../../SectionSkeleton";
import History from "./History";

interface HistorySectionProps {
  data: ScheduleHistoryData[];
  onClickHistory?: (workout: ScheduleHistoryData) => void;
}

export default function HistorySection({
  data,
  onClickHistory
}: HistorySectionProps) {
  const handleClickHistory = useCallback((workout: ScheduleHistoryData) => {
    onClickHistory?.(workout);
  }, [onClickHistory]);
  return (
    <SectionSkeleton title="운동 히스토리" useCard={false}>
      {{
        subtitle: <Button variant="ghost" size="icon" className="p-2">
          <Calendar size={20} />
        </Button>,
        default: <div className="flex flex-col gap-4">
          {data.map(workout => (
            <History key={workout.id} data={workout} onClickHistory={handleClickHistory} />
          ))}
        </div>,
      }}
    </SectionSkeleton>
  );
}