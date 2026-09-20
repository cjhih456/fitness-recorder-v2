import type { Fitness } from "@fitness-recoder/structure";
import { cn } from "@fitness-recoder/ui";
import { Plus } from "lucide-react";
import { useCallback } from "react";

interface FitnessItemProps {
  className?: string;
  style?: React.CSSProperties;
  fitness: Fitness;
  onClick: (fitness: Fitness) => void;
}

export default function FitnessItem({
  className,
  style,
  fitness,
  onClick,
}: FitnessItemProps) {
  const handleOnClick = useCallback(() => {
    onClick(fitness);
  }, [fitness, onClick]);
  return (
    <div
      className={cn("flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors group", className)}
      style={style}
      onClick={handleOnClick}
    >
      <div>
        <p className="font-bold">{fitness.name}</p>
        <p className="text-xs text-zinc-400 group-hover:text-blue-400">{fitness.primaryMuscles.join(', ')}</p>
      </div>
      <Plus size={20} className="text-zinc-300 group-hover:text-blue-600" />
    </div>
  )
}