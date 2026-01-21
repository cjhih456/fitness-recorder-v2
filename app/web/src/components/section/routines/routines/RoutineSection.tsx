import type { Routine as RoutineType } from "../../../../app/pages/constants";
import { Button } from "@fitness-recoder/ui";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import SectionSkeleton from "../../SectionSkeleton";
import Routine from "./Routine";

interface RoutineSectionProps {
  data: RoutineType[];
  onClickCreateRoutine?: () => void;
}

export default function RoutineSection({
  data,
  onClickCreateRoutine
}: RoutineSectionProps) {
  const handleCreateRoutine = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);
  return (
    <SectionSkeleton title="나의 루틴" useCard={false}>
      {{
        subtitle: <Button variant="default" size="sm" className="px-4 font-bold" onClick={handleCreateRoutine}>
          <Plus size={20} />
          루틴 생성
        </Button>,
        default: <div className="flex flex-col gap-4">
          {data.map(routine => (
            <Routine key={routine.id} routine={routine} />
          ))}
        </div>,
      }}
    </SectionSkeleton>
  );
}