import { EmblaViewportRefType } from "embla-carousel-react";
import { Product } from "@/lib/wordpress";
import { ProductCard } from "../product-card";

interface Props {
  emblaRef: EmblaViewportRefType;
  products: Product[];
}

export function ProductSliderTrack({ emblaRef, products }: Props) {
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
