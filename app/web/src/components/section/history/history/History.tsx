import type { Workout } from "../../../../app/pages/constants";
import { Card, CardContent } from "@fitness-recoder/ui";
import { ChevronRight } from "lucide-react";

interface HistoryProps {
  data: Workout;
}

export default function History({
  data
}: HistoryProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-2xl flex flex-col items-center min-w-[64px]">
          <span className="text-[10px] font-black uppercase leading-tight">{data.date.split('-')[1]}월</span>
          <span className="text-xl font-black">{data.date.split('-')[2]}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{data.name}</h3>
          <p className="text-xs text-zinc-400 font-medium">시간: {data.duration} • 총 볼륨: {data.volume}</p>
        </div>
        <ChevronRight size={18} className="text-zinc-300" />
      </CardContent>
    </Card>
  );
}