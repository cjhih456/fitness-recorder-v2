import type { LucideIcon } from "lucide-react";
import { Button } from "@fitness-recoder/ui";

export default function NavButton({ icon: Icon, label, onClick }: { icon: LucideIcon, label: string, onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-xl" className="p-2 flex flex-col items-center gap-1" onClick={onClick}>
      <Icon size={20} />
      <span className="text-[10px] font-medium">{label}</span>
    </Button>
  )
}