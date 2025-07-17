"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { wordpressAPI, Product } from "@/lib/wordpress";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";

export function HeaderSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const products = await wordpressAPI.getProducts({
          search: debouncedQuery,
          per_page: 5,
        });
        setResults(products);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  return (
    <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj produktów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-4 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-12 z-50 w-full bg-white border shadow-lg rounded-md overflow-hidden">
          {loading && (
            <div className="p-4 text-sm text-muted-foreground">
              Ładowanie...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              Brak wyników dla: <strong>{searchQuery}</strong>
            </div>
          )}

          {!loading &&
            results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center px-4 py-2 hover:bg-muted transition-colors"
              >
                <Image
                  src={product.images[0]?.src || "/placeholder.png"}
                  alt={product.images[0]?.alt || product.name}
                  width={40}
                  height={40}
                  className="object-cover rounded mr-3"
                />
                <div className="text-sm">
                  <div className="font-medium">
                    <span dangerouslySetInnerHTML={{ __html: product.name }} />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {product.price} zł
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
