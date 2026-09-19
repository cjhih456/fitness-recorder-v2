import type { Fitness } from '@fitness-recoder/structure';
import FitnessPicker from '../../routine-edit/FitnessPicker';

interface FitnessSearchDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (fitness: Fitness) => void;
}

/** Workout 전용 진입점 — routine-edit FitnessPicker와 동일 UI(empty 포함)를 공유합니다. */
export default function FitnessSearchDrawer({
  open,
  onOpenChange,
  onSelect,
}: FitnessSearchDrawerProps) {
  return (
    <FitnessPicker
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />
  );
}
