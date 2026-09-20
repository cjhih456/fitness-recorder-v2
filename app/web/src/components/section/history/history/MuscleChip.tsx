interface MuscleChipProps {
  label: string;
  muted?: boolean;
}

export default function MuscleChip({ label, muted = false }: MuscleChipProps) {
  return (
    <span
      className={
        muted
          ? 'rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground'
          : 'rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-text'
      }
    >
      {label}
    </span>
  );
}
