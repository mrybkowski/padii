"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Product } from "@/lib/wordpress";
import { cn } from "@/lib/utils";
import { ProductSliderSkeleton } from "./ProductSliderSkeleton";
import { ProductSliderEmpty } from "./ProductSliderEmpty";
import { ProductSliderHeader } from "./ProductSliderHeader";
import { ProductSliderTrack } from "./ProductSliderTrack";

interface ProductSliderProps {
  products: Product[];
  title?: string;
  className?: string;
  isLoading?: boolean;
}

export function ProductSlider({
  products,
  title,
  className,
  isLoading,
}: ProductSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 1280px)": { slidesToScroll: 4 },
    },
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((embla: any) => {
    setPrevBtnDisabled(!embla.canScrollPrev());
    setNextBtnDisabled(!embla.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading)
    return <ProductSliderSkeleton title={title} className={className} />;
  if (products.length === 0)
    return <ProductSliderEmpty className={className} />;

  return (
    <div className={cn("space-y-6", className)}>
      {title && (
        <ProductSliderHeader
          title={title}
          scrollPrev={scrollPrev}
          scrollNext={scrollNext}
          prevDisabled={prevBtnDisabled}
          nextDisabled={nextBtnDisabled}
        />
      )}
      <ProductSliderTrack emblaRef={emblaRef} products={products} />
    </div>
  );
}
