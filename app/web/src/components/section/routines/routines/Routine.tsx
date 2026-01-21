import type { Routine } from "../../../../app/pages/constants";
import { Card, CardContent, CardTitle, CardFooter, Button, Separator } from "@fitness-recoder/ui";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";

interface RoutineProps {
  routine: Routine;
  onClickDeleteRoutine?: (routine: Routine) => void;
  onClickEditRoutine?: (routine: Routine) => void;
}

export default function Routine({
  routine,
  onClickDeleteRoutine,
  onClickEditRoutine
}: RoutineProps) {
  const handleDeleteRoutine = useCallback(() => {
    onClickDeleteRoutine?.(routine);
  }, [routine, onClickDeleteRoutine]);
  const handleEditRoutine = useCallback(() => {
    onClickEditRoutine?.(routine);
  }, [routine, onClickEditRoutine]);
  return (
    <Card className="overflow-hidden pb-0">
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{routine.name}</CardTitle>
            <p className="text-sm text-zinc-500 mb-2">{routine.target}</p>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase">주 5회</span>
              <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-md text-[10px] font-bold uppercase">근성장</span>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-red-500" onClick={handleDeleteRoutine}>
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-full">
          <Separator />
          <Button variant="ghost" className="rounded-t-none rounded-b-2xl w-full text-xs font-bold text-blue-600 dark:text-blue-400" onClick={handleEditRoutine}>
            편집하기
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}