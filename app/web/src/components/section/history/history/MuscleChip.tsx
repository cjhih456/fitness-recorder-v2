interface MuscleChipProps {
  label: string;
  muted?: boolean;
}

export default function MuscleChip({ label, muted = false }: MuscleChipProps) {
  return (
    <span
      className={
        muted
          ? 'rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-400 dark:bg-zinc-800'
          : 'rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
      }
    >
      {label}
    </span>
  );
}
