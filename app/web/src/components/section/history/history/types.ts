import type { ScheduleData } from '@fitness-recoder/structure';

export interface HistoryListItem {
  id: number;
  year: number;
  month: number;
  date: number;
  title: string;
  workoutTimes: number;
  totalVolume: number;
  muscles: string[];
  exerciseSummary: string;
}

export type HistorySchedule = ScheduleData;
