import type { Workout } from "../../../../app/pages/constants";
import { Button } from "@fitness-recoder/ui";
import { Calendar } from "lucide-react";
import SectionSkeleton from "../../SectionSkeleton";
import History from "./History";

interface HistorySectionProps {
  data: Workout[];
}

export default function HistorySection({
  data
}: HistorySectionProps) {
  
  return (
    <SectionSkeleton title="운동 히스토리" useCard={false}>
      {{
        subtitle: <Button variant="ghost" size="icon" className="p-2">
          <Calendar size={20} />
        </Button>,
        default: <div className="flex flex-col gap-4">
          {data.map(workout => (
            <History key={workout.id} data={workout} />
          ))}
        </div>,
      }}
    </SectionSkeleton>
  );
}