import HistorySection from '../../components/section/history/history/HistorySection';
import { RECENT_WORKOUTS } from './constants';

export default function History() {
  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <HistorySection data={RECENT_WORKOUTS} />
    </div>
  );
}