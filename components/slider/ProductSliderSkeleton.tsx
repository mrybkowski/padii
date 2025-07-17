import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  className?: string;
}

export function ProductSliderSkeleton({ title, className }: Props) {
  return (
    <div className={cn("space-y-6", className)}>
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted animate-pulse rounded-lg h-[400px]"
          />
        ))}
      </div>
    </div>
  );
}
