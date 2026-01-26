import { useNavigate } from 'react-router-dom';
import ChartSection from '../../components/section/dashboard/chart/ChartSection';
import TodayRoutineSection from '../../components/section/dashboard/todayRoutine/TodayRoutineSection';
import { DEFAULT_ROUTINES, VOLUME_DATA } from './constants';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    navigate('/workout');
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <ChartSection data={VOLUME_DATA} />
      <TodayRoutineSection data={DEFAULT_ROUTINES} onClickStartWorkout={handleStartWorkout} />
    </div>
  );
}