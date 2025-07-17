import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeaderProps {
  title: string;
  scrollPrev: () => void;
  scrollNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
}

export function ProductSliderHeader({
  title,
  scrollPrev,
  scrollNext,
  prevDisabled,
  nextDisabled,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={prevDisabled}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={nextDisabled}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
