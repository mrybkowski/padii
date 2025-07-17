'use client';

import { Product } from '@/lib/wordpress';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  className?: string;
  isLoading?: boolean;
}

export function ProductGrid({ products, className, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-[400px]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold mb-2">
          {isLoading ? 'Ładowanie produktów...' : 'Brak produktów'}
        </h3>
        <p className="text-muted-foreground">
          {isLoading 
            ? 'Pobieranie danych z WordPress...' 
            : 'Nie znaleziono produktów spełniających kryteria wyszukiwania.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}