import { Routine } from "../../../../app/pages/constants";
import SectionSkeleton from "../../SectionSkeleton";
import TodayRoutine from "./TodayRoutine";

interface TodayRoutineSectionProps {
  data: Routine[];
  onClickStartWorkout?: (routine: Routine) => void;
}

export default function TodayRoutineSection({ data, onClickStartWorkout }: TodayRoutineSectionProps) {

  return (
    <SectionSkeleton title="오늘의 루틴">
      {{
        default: <div className="flex flex-col gap-4">
          {data.map(routine => (
            <TodayRoutine key={routine.id} routine={routine} onClickStartWorkout={onClickStartWorkout} />
          ))}
        </div>,
        subtitle: <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-bold">5월 20일 월요일</span>
      }}
    </SectionSkeleton>
  );
}