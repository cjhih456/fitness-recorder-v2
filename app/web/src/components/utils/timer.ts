import { useEffect, useState, useMemo } from "react";
import dayjs from "../../libs/dayjs";

export function useTimer(start: number, pausedTime = 0, isPaused = false) {
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    if (isPaused) return;
    setTimer(dayjs(start).diff(dayjs(), 'millisecond') - pausedTime);
    const interval = setInterval(() => {
      setTimer(dayjs(start).diff(dayjs(), 'millisecond') - pausedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [start, pausedTime, isPaused]);

  return timer;
}

export function useFormatedTime(time: number, format = 'HH:mm:ss') {
  const formatedTime = useMemo(() => dayjs.duration(time).format(format), [time, format]);
return formatedTime
}