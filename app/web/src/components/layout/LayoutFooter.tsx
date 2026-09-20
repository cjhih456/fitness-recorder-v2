import type { ScheduleData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { LayoutDashboard, History, Plus, Camera, Play } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from '../../libs/dayjs';
import NavButton from './NavButton';

function isEditorRoute(pathname: string): boolean {
  if (pathname === '/routines/new') return true;
  return /^\/routines\/[^/]+\/edit$/.test(pathname);
}

function getTodayParts() {
  const today = dayjs();
  return {
    year: today.year(),
    month: today.month() + 1,
    date: today.date(),
  };
}

function findResumableSchedule(
  schedules: ScheduleData[] | undefined,
): ScheduleData | undefined {
  return schedules?.find(
    (schedule) => schedule.type === 'STARTED' || schedule.type === 'PAUSED',
  );
}

export default function LayoutFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = useMemo(() => getTodayParts(), []);
  const { data: schedules, isLoading } = hooks.useScheduleByDateQuery(today);
  const createSchedule = hooks.useCreateScheduleMutation();
  const updateSchedule = hooks.useUpdateScheduleMutation();
  const [isStarting, setIsStarting] = useState(false);
  const hideTabBar = isEditorRoute(location.pathname);

  const gotoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const gotoHistory = useCallback(() => {
    navigate('/history');
  }, [navigate]);

  const gotoRoutines = useCallback(() => {
    navigate('/routines');
  }, [navigate]);

  const gotoPhoto = useCallback(() => {
    navigate('/photo');
  }, [navigate]);

  const gotoWorkout = useCallback(async () => {
    if (isLoading || isStarting) return;

    const resumable = findResumableSchedule(schedules);
    if (resumable) {
      navigate(`/workout/${resumable.id}`);
      return;
    }

    setIsStarting(true);
    try {
      const created = await createSchedule.mutateAsync({
        year: today.year,
        month: today.month,
        date: today.date,
        type: 'SCHEDULED',
        title: '오늘의 운동',
      });
      if (!created) return;

      const started = await updateSchedule.mutateAsync({
        ...created,
        type: 'STARTED',
        start: Date.now(),
      });
      navigate(`/workout/${started?.id ?? created.id}`);
    } finally {
      setIsStarting(false);
    }
  }, [
    isLoading,
    isStarting,
    schedules,
    navigate,
    createSchedule,
    updateSchedule,
    today.year,
    today.month,
    today.date,
  ]);
  
  if (hideTabBar) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white px-4 py-2 shadow-lg backdrop-blur-md dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-md items-center justify-around">
        <NavButton icon={LayoutDashboard} label="홈" onClick={gotoHome} />
        <NavButton icon={History} label="기록" onClick={gotoHistory} />
        <div className="relative -top-6">
          <Button
            variant="default"
            size="icon-xl"
            className="rounded-full bg-blue-600 hover:bg-blue-600"
            onClick={gotoWorkout}
            disabled={isLoading || isStarting}
            aria-label="운동 시작"
          >
            <Play fill="white" size={24} />
          </Button>
        </div>
        <NavButton icon={Plus} label="루틴" onClick={gotoRoutines} />
        <NavButton icon={Camera} label="인증" onClick={gotoPhoto} />
      </nav>
    </footer>
  );
}
