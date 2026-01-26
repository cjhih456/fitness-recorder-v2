import { Button } from "@fitness-recoder/ui";
import { LayoutDashboard, History, Plus, Camera, Play } from "lucide-react";
import { useCallback } from 'react'
import { useHref, useNavigate } from "react-router-dom";
import NavButton from "./NavButton";

export default function LayoutFooter() {
  const navigate = useNavigate();
  const homeHref = useHref("/");
  const historyHref = useHref("/history");
  const routinesHref = useHref("/routines");
  const photoHref = useHref("/photo");
  const workoutHref = useHref("/workout/1");

  const gotoHome = useCallback(() => {
    navigate(homeHref);
  }, [navigate, homeHref]);

  const gotoHistory = useCallback(() => {
    navigate(historyHref);
  }, [navigate, historyHref]);

  const gotoRoutines = useCallback(() => {
    navigate(routinesHref);
  }, [navigate, routinesHref]);

  const gotoPhoto = useCallback(() => {
    navigate(photoHref);
  }, [navigate, photoHref]);

  const gotoWorkout = useCallback(() => {
    navigate(workoutHref);
  }, [navigate, workoutHref]);
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-zinc-950/80 backdrop-blur-md px-4 py-2 shadow-lg z-40">
      <nav className="max-w-md mx-auto flex justify-around items-center">
        <NavButton icon={LayoutDashboard} label="홈" onClick={gotoHome} />
        <NavButton icon={History} label="기록" onClick={gotoHistory} />
        <div className="relative -top-6">
          <Button variant="default" size="icon-xl" className="rounded-full" onClick={gotoWorkout}>
            <Play fill="white" size={24} />
          </Button>
        </div>
        <NavButton icon={Plus} label="루틴" onClick={gotoRoutines} />
        <NavButton icon={Camera} label="인증" onClick={gotoPhoto} />
      </nav>
    </footer>
  );
}