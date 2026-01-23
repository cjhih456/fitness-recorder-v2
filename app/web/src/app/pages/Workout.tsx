import type { Fitness, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExerciseCard from '../../components/section/workout/exerciseSection/ExerciseCard';
import Timer from '../../components/section/workout/exerciseSection/Timer';
import FitnessSearchDrawer from '../../components/section/workout/fitnessSearchDrawer/FitnessSearchDrawer';
export default function Workout() {
  const navigate = useNavigate();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: scheduleData } = hooks.useScheduleQuery(Number(scheduleId));
  const { data: exercises } = hooks.useExerciseListByScheduleIdQuery(Number(scheduleId));
  
  const createExercise = hooks.useCreateExerciseByScheduleMutation()
  const handleCreateExercise = useCallback((fitness: Fitness) => {
    if (!scheduleId) return;
    createExercise.mutate({
      scheduleId: Number(scheduleId),
      fitnessIds: [fitness.id]
    })
  }, [scheduleId, createExercise])

  const addSet = hooks.useCreateSetMutation()
  const handleAddSet = useCallback((exerciseId: number) => {
    addSet.mutate({
      exerciseId,
      repeat: 1,
      isDone: false,
      weightUnit: 'kg',
      weight: 0,
    })
  }, [addSet])

  const updateSet = hooks.useUpdateSetMutation()
  const handleUpdateSet = useCallback((set: SetData) => {
    updateSet.mutate(set)
  }, [updateSet])

  const updateSchedule = hooks.useUpdateScheduleMutation()
  const handleFinish = useCallback(() => {
    if (!scheduleData) return;
    updateSchedule.mutate({
      ...scheduleData,
      type: 'FINISH'
    })
    navigate(-1);
  }, [scheduleData, updateSchedule, navigate])

  return (
    <div className="pb-24 relative max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6 sticky top-[60px] bg-background/80 backdrop-blur-sm py-2 z-20">
        <div>
          <h2 className="text-2xl font-black text-foreground">오늘의 운동</h2>
          <Timer start={scheduleData?.start ?? 0} isPaused={scheduleData?.type === 'PAUSED'} pausedTime={scheduleData?.breakTime ?? 0} />
        </div>
        <Button
          variant="default"
          className="px-6 rounded-full shadow-lg shadow-blue-200"
          onClick={handleFinish}
          disabled={scheduleData?.type === 'FINISH'}
        >
          운동 완료
        </Button>
      </div>

      <div className="space-y-8">
        {exercises?.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} addSet={handleAddSet} onUpdateSet={handleUpdateSet} />
        ))}

        <div className="pt-4 pb-8">
          <Button
            variant="secondary"
            className="w-full py-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-300 hover:text-blue-600 transition-all font-bold"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            새로운 운동 종목 추가
          </Button>
        </div>
      </div>
      <FitnessSearchDrawer open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSelect={handleCreateExercise} />
    </div>
  );
}