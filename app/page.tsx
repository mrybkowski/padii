"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, ShieldCheck, SprayCan, ArrowRight } from "lucide-react";
import { Product, wordpressAPI } from "@/lib/wordpress";
import { ProductSlider } from "@/components/product-slider";
import { Header } from "@/components/header";

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [allProductsData, featuredProductsData] = await Promise.all([
          wordpressAPI.getProducts({
            per_page: 20,
            orderby: "date",
            order: "desc",
          }),
          wordpressAPI.getProducts({
            featured: true,
            per_page: 8,
            orderby: "popularity",
            order: "desc",
          }),
        ]);

        setAllProducts(allProductsData);
        setFeaturedProducts(featuredProductsData);
      } catch (error) {
        console.error("Error loading products:", error);
        setAllProducts([]);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white">
        {/* <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4587991/pexels-photo-4587991.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10" /> */}
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              Nowość 2024 – Podkłady dla psów
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Higiena Twojego psa pod pełną kontrolą
            </h1>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Superchłonne, bezpieczne i wygodne podkłady higieniczne dla psów.
              Darmowa dostawa od 200 zł!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/#products">
                  Zobacz ofertę
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Super chłonność</h3>
                <p className="text-muted-foreground">
                  Zatrzymują wilgoć w kilka sekund – idealne do domu i w
                  podróży.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Bezpieczne i wygodne
                </h3>
                <p className="text-muted-foreground">
                  Miękka powierzchnia, która nie podrażnia łap – dla szczeniąt i
                  starszych psów.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SprayCan className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Neutralizacja zapachów
                </h3>
                <p className="text-muted-foreground">
                  Innowacyjna warstwa chłonna niweluje nieprzyjemne zapachy
                  przez cały dzień.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Products Slider */}
      <section id="products" className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Podkłady higieniczne</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nasze podkłady dla psów
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wybierz idealny rozmiar podkładów dla swojego pupila.
            </p>
          </div>

          <ProductSlider products={allProducts} isLoading={isLoading} />

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                Zobacz wszystkie podkłady
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Najczęściej wybierane</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Polecane przez właścicieli psów
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sprawdź, które podkłady są najczęściej wybierane przez naszych
                klientów.
              </p>
            </div>

            <ProductSlider products={featuredProducts} isLoading={isLoading} />
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Zadbaj o czystość – z nami!
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Dołącz do newslettera i zgarnij 10% zniżki na pierwsze zakupy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Twój adres email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <Button className="bg-white text-primary hover:bg-white/90">
              Zapisz się
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">padii.pl</h3>
              <p className="text-gray-400 mb-4">
                Specjalistyczny sklep z podkładami higienicznymi dla psów.
                Jakość, której możesz zaufać.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Oferta</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition-colors"
                  >
                    Wszystkie podkłady
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="hover:text-white transition-colors"
                  >
                    Rodzaje
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sale"
                    className="hover:text-white transition-colors"
                  >
                    Promocje
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Pomoc</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="hover:text-white transition-colors"
                  >
                    Dostawa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-white transition-colors"
                  >
                    Zwroty
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Twoje konto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/wishlist"
                    className="hover:text-white transition-colors"
                  >
                    Lista życzeń
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-white transition-colors"
                  >
                    Koszyk
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DogPads. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
