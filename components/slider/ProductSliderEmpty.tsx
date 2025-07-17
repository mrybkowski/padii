import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function ProductSliderEmpty({ className }: Props) {
  return (
    <div className={cn("text-center py-16", className)}>
      <h3 className="text-lg font-semibold mb-2">Brak produktów</h3>
      <p className="text-muted-foreground">
        Nie znaleziono produktów do wyświetlenia.
      </p>
    </div>
  );
}
