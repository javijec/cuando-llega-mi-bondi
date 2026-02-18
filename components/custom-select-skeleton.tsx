interface CustomSelectSkeletonProps {
  label: string;
}

export function CustomSelectSkeleton({ label }: CustomSelectSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="h-14 bg-muted animate-pulse rounded-xl" />
    </div>
  );
}
