import type { ExerciseData, SetData } from "@fitness-recoder/structure";
import { Card, CardContent, Button } from "@fitness-recoder/ui";
import { Plus } from "lucide-react";
import { useCallback } from "react";

interface ExerciseCardProps {
  exercise: ExerciseData;
  addSet: (exerciseId: number) => void;
  onUpdateSet: (set: SetData) => void;
}
export default function ExerciseCard({ exercise, addSet, onUpdateSet }: ExerciseCardProps) {
  const handleAddSet = useCallback(() => addSet(exercise.id), [addSet, exercise.id]);
  const handleUpdateSet = useCallback((set: SetData) => onUpdateSet(set), [onUpdateSet]);

  return (
    <Card className="border-zinc-100 dark:border-zinc-800 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
            {exercise.fitness?.name}
          </h3>
          <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
            기록 확인
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-zinc-400 uppercase px-2">
          <div className="col-span-2 text-center">세트</div>
          <div className="col-span-4 text-center">무게 (kg)</div>
          <div className="col-span-4 text-center">횟수</div>
          <div className="col-span-2 text-center">완료</div>
        </div>

        {/* {ex.sets.map((set, idx) => (
          <div 
            key={set.id} 
            className={`grid grid-cols-12 gap-2 p-2 rounded-xl border transition-all ${
              set.done 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-70' 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent shadow-inner'
            }`}
          >
            <div className="col-span-2 flex items-center justify-center font-bold text-zinc-500">{idx + 1}</div>
            <div className="col-span-4">
              <Input 
                type="number" 
                defaultValue={set.weight} 
                className="w-full bg-background border-none rounded-lg p-2 text-center font-bold text-foreground shadow-sm" 
              />
            </div>
            <div className="col-span-4">
              <Input 
                type="number" 
                defaultValue={set.reps} 
                className="w-full bg-background border-none rounded-lg p-2 text-center font-bold text-foreground shadow-sm" 
              />
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <button
                onClick={handleToggleSet}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  set.done 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-background text-transparent border-2 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        ))} */}
        <Button
          variant="outline" 
          className="w-full border-dashed text-zinc-400 hover:text-blue-600 hover:border-blue-200 py-3" 
          onClick={handleAddSet}
        >
          <Plus size={18} className="mr-2" />
          세트 추가
        </Button>
      </CardContent>
    </Card>
  )
}