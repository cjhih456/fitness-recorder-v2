import RoutineSection from '../../components/section/routines/routines/RoutineSection';
import { DEFAULT_ROUTINES } from './constants';

export default function Routines() {
  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <RoutineSection data={DEFAULT_ROUTINES} />
    </div>
  );
}