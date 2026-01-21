import { Button, Card, CardContent } from "@fitness-recoder/ui";
import { ChevronRight, Dumbbell } from "lucide-react";
import { useCallback } from "react";
import { Routine } from "../../../../app/pages/constants";

interface TodayRoutineProps {
  routine: Routine;
  onClickStartWorkout?: (routine: Routine) => void;
}

export default function TodayRoutine({
  routine,
  onClickStartWorkout
}: TodayRoutineProps) {
  const handleStartWorkout = useCallback(() => {
    onClickStartWorkout?.(routine);
  }, [routine, onClickStartWorkout]);
  return (
    <Card className="hover:border-blue-200 transition-all cursor-pointer group">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 transition-colors">
            <Dumbbell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{routine.name}</h3>
            <p className="text-sm text-zinc-500">{routine.target} • {routine.exercises}개 종목</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleStartWorkout}>
          <ChevronRight size={20} className="text-zinc-400" />
        </Button>
      </CardContent>
    </Card>
  );
}