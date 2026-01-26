import type { ScheduleHistoryData } from "@fitness-recoder/structure";
import { Card, CardContent } from "@fitness-recoder/ui";
import { ChevronRight } from "lucide-react";
import { useCallback, useMemo } from "react";

interface HistoryProps {
  data: ScheduleHistoryData;
  onClickHistory?: (workout: ScheduleHistoryData) => void;
}

export default function History({
  data,
  onClickHistory
}: HistoryProps) {
  const duration = useMemo(() => {
    return `${data.workoutTimes}분`;
  }, [data.workoutTimes]);
  const handleClickHistory = useCallback(() => {
    onClickHistory?.(data);
  }, [data, onClickHistory]);
  return (
    <Card onClick={handleClickHistory} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-2xl flex flex-col items-center min-w-[64px]">
          <span className="text-[10px] font-black uppercase leading-tight">{data.month}월</span>
          <span className="text-xl font-black">{data.date}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{data.title}</h3>
          <p className="text-xs text-zinc-400 font-medium">시간: {duration} • 총 볼륨: {data.totalVolume}</p>
        </div>
        <ChevronRight size={18} className="text-zinc-300" />
      </CardContent>
    </Card>
  );
}