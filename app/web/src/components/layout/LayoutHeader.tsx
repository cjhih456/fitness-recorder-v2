import { Button } from "@fitness-recoder/ui";
import { Dumbbell, Settings } from "lucide-react";

export default function LayoutHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Dumbbell size={24} /> FITLOG
        </h1>
        <Button variant="ghost" className="p-2">
          <Settings size={20} />
        </Button>
      </div>
    </header>
  );
}