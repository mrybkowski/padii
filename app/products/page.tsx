"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Product, Category, wordpressAPI } from "@/lib/wordpress";
import { ProductGrid } from "@/components/product-grid";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          wordpressAPI.getProducts({ per_page: 20 }),
          wordpressAPI.getCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategories =
      selectedCategories.length === 0 ||
      product.categories.some((cat) => selectedCategories.includes(cat.slug));

    const price = parseFloat(
      product.sale_price || product.regular_price || "0"
    );
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesCategories && matchesPrice;
  });

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categorySlug]);
    } else {
      setSelectedCategories((prev) =>
        prev.filter((slug) => slug !== categorySlug)
      );
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Produkty</h1>
          <p className="text-muted-foreground">
            Odkryj naszą pełną ofertę produktów
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj produktów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sortuj według" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularność</SelectItem>
                <SelectItem value="price-low-high">
                  Cena: od najniższej
                </SelectItem>
                <SelectItem value="price-high-low">
                  Cena: od najwyższej
                </SelectItem>
                <SelectItem value="newest">Najnowsze</SelectItem>
                <SelectItem value="name">Nazwa A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={cn(
              "w-full lg:w-64 space-y-6",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filtry</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Wyczyść
                  </Button>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Kategorie</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.slug}
                            checked={selectedCategories.includes(category.slug)}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(
                                category.slug,
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor={category.slug}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name} ({category.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Zakres cen</h4>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) =>
                          setPriceRange(value as [number, number])
                        }
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0]} zł</span>
                        <span>{priceRange[1]} zł</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Znaleziono {filteredProducts.length} produktów
                </span>
                {(selectedCategories.length > 0 || searchQuery) && (
                  <div className="flex gap-2">
                    {selectedCategories.map((slug) => {
                      const category = categories.find((c) => c.slug === slug);
                      return category ? (
                        <Badge key={slug} variant="secondary">
                          {category.name}
                          <button
                            onClick={() => handleCategoryChange(slug, false)}
                            className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    {searchQuery && (
                      <Badge variant="secondary">
                        {searchQuery}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
