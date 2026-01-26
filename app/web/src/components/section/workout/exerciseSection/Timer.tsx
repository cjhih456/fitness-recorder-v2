import { Timer as TimerIcon } from "lucide-react";
import { useFormatedTime, useTimer } from "../../../utils/timer";

interface TimerProps {
  start: number;
  isPaused: boolean
  pausedTime: number
}
export default function Timer({ start, isPaused, pausedTime }: TimerProps) {

  const timer = useTimer(start, pausedTime, isPaused)

  const formatedTime = useFormatedTime(timer);

  return (
    <div className="flex items-center gap-2 text-primary font-mono font-bold text-sm">
      <TimerIcon size={14} /> {formatedTime}
    </div>
  )
}