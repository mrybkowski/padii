'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { Product, wordpressAPI } from '@/lib/wordpress';
import { ProductSlider } from '@/components/product-slider';
import { Header } from '@/components/header';

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
            orderby: 'date',
            order: 'desc'
          }),
          wordpressAPI.getProducts({
            featured: true,
            per_page: 8,
            orderby: 'popularity',
            order: 'desc'
          })
        ]);
        
        setAllProducts(allProductsData);
        setFeaturedProducts(featuredProductsData);
      } catch (error) {
        console.error('Error loading products:', error);
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
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              Nowa kolekcja 2024
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Odkryj najlepsze produkty dla siebie
            </h1>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Szeroki wybór wysokiej jakości produktów w najlepszych cenach. 
              Darmowa dostawa od 200 zł i 30 dni na zwrot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">
                  Przeglądaj produkty
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/categories">
                  Zobacz kategorie
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Darmowa dostawa</h3>
                <p className="text-muted-foreground">Bezpłatna dostawa od 200 zł na terenie całego kraju</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Najwyższa jakość</h3>
                <p className="text-muted-foreground">Starannie wyselekcjonowane produkty od najlepszych marek</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">30 dni na zwrot</h3>
                <p className="text-muted-foreground">Pełne prawo zwrotu w ciągu 30 dni od zakupu</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Products Slider */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Nasza kolekcja</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Wszystkie produkty</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Przeglądaj naszą pełną kolekcję produktów w wygodnym sliderze
            </p>
          </div>
          
          <ProductSlider 
            products={allProducts} 
            isLoading={isLoading}
          />
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                Zobacz wszystkie produkty
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
              <Badge className="mb-4">Polecane produkty</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Najlepsze produkty tego miesiąca</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Odkryj nasze najpopularniejsze produkty wybrane specjalnie dla Ciebie
              </p>
            </div>
            
            <ProductSlider 
              products={featuredProducts} 
              isLoading={isLoading}
            />
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bądź na bieżąco!</h2>
          <p className="text-lg mb-8 text-white/90">
            Zapisz się do newslettera i otrzymuj informacje o nowościach i promocjach
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
              <h3 className="text-xl font-bold mb-4">ShopWP</h3>
              <p className="text-gray-400 mb-4">
                Twój zaufany partner w zakupach online. Najlepsze produkty w najlepszych cenach.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sklep</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">Produkty</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Kategorie</Link></li>
                <li><Link href="/sale" className="hover:text-white transition-colors">Promocje</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Pomoc</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Dostawa</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Zwroty</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Konto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/wishlist" className="hover:text-white transition-colors">Lista życzeń</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Koszyk</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ShopWP. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}