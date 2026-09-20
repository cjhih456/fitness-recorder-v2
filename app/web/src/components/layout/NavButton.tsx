import type { LucideIcon } from "lucide-react";
import { Button, cn } from "@fitness-recoder/ui";

export default function NavButton({
  icon: Icon,
  label,
  onClick,
  isActive = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-xl"
      className={cn(
        "p-2 flex flex-col items-center gap-1",
        isActive ? "text-brand-text" : "text-muted-foreground",
      )}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={20} fill={isActive ? "currentColor" : "none"} />
      <span className="text-[10px] font-medium">{label}</span>
    </Button>
  )
}
