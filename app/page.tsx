"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PawPrint,
  ShieldCheck,
  SprayCan,
  ArrowRight,
  Star,
  Shield,
  Truck,
  Heart,
  Award,
  Phone,
  Recycle,
} from "lucide-react";
import { Product, wordpressAPI } from "@/lib/wordpress";
import { ProductSlider } from "@/components/product-slider";
import { Header } from "@/components/Header";
import Image from "next/image";
import { Footer } from "@/components/Footer";

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

  const benefits = [
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Bezpieczeństwo",
      description:
        "Wszystkie nasze produkty są wykonane z materiałów bezpiecznych dla zwierząt i przetestowane dermatologicznie.",
      emoji: "🛡️",
      gradient: "from-primary to-primary",
    },
    {
      icon: <Truck className="h-10 w-10" />,
      title: "Szybka dostawa",
      description:
        "Darmowa dostawa od 99 zł. Zamówienia złożone do 14:00 wysyłamy tego samego dnia.",
      emoji: "🚚",
      gradient: "from-primary to-primary",
    },
    {
      icon: <Heart className="h-10 w-10" />,
      title: "Dbamy o zwierzęta",
      description:
        "Jesteśmy firmą zarządzaną przez miłośników zwierząt. Część zysków przekazujemy schroniskom.",
      emoji: "❤️",
      gradient: "from-primary to-primary",
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Najwyższa jakość",
      description:
        "Współpracujemy tylko z renomowanymi producentami. Każdy produkt przechodzi kontrolę jakości.",
      emoji: "🏆",
      gradient: "from-primary to-primary",
    },
    {
      icon: <Phone className="h-10 w-10" />,
      title: "Wsparcie klienta",
      description:
        "Nasz zespół ekspertów pomoże Ci wybrać odpowiedni produkt. Kontakt 7 dni w tygodniu.",
      emoji: "📞",
      gradient: "from-primary to-primary",
    },
    {
      icon: <Recycle className="h-10 w-10" />,
      title: "Ekologia",
      description:
        "Oferujemy szeroką gamę produktów biodegradowalnych. Dbamy o środowisko.",
      emoji: "🌱",
      gradient: "from-primary to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-balance">
                  Najlepsze podkłady higieniczne dla Twojego pupila
                </h1>
                <p className="text-lg text-gray-600 text-balance">
                  Odkryj naszą szeroką gamę wysokiej jakości podkładów
                  higienicznych, które zapewnią czystość i komfort Twojemu
                  czworonożnemu przyjacielowi.
                </p>
              </div>

              {/* Features list */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    100% bezpieczne materiały, certyfikat CE
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Zadowolenie gwarantowane – zwroty do 30 dni
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Szybka dostawa w całej Polsce popularnymi kurierami
                  </span>
                </div>
              </div>

              {/* Reviews */}
              {/* <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600">4.9/5 z 2,847 opinii</span>
              </div> */}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="text-lg px-8">
                  <Link href="/#products">Zobacz produkty</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/#features">Dowiedz się więcej</Link>
                </Button>
              </div>
            </div>

            {/* Right image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop&crop=center"
                  alt="Szczęśliwy pies z podkładami higienicznymi"
                  className="w-full h-96 object-cover"
                  width={600}
                  height={400}
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 xl:-left-6 left-6 bg-white rounded-lg shadow-lg p-4 border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ponad 1,000</p>
                    <p className="text-sm text-gray-600">
                      zadowolonych klientów w całej Polsce 🇵🇱
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
        {/* Playful background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-8xl text-primary transform rotate-12">
            🐾
          </div>
          <div className="absolute top-40 right-20 text-6xl text-primary transform -rotate-12">
            🦴
          </div>
          <div className="absolute bottom-32 left-1/3 text-7xl text-primary transform rotate-45">
            🏠
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* <div className="inline-flex items-center px-6 py-3 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <span className="text-2xl mr-3">⭐</span>
              <span className="text-primary font-bold">Dlaczego my?</span>
            </div> */}

            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              <span className="">PawPads to więcej niż sklep</span>
              <br />
              <span className="text-foreground">
                To rodzina miłośników zwierząt!
              </span>
              <span className="text-3xl ml-2">🐕‍🦺</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
              Od ponad 2 lat tworzymy produkty z pasją i miłością do zwierząt.
              Zaufało nam już ponad 1,000 właścicieli psów w całej Polsce! 🇵🇱
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white/80 backdrop-blur-sm hover:scale-105 group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
                  ></div>

                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300`}
                    ></div>
                    <div className="relative text-white">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        {benefit.icon}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 text-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {benefit.emoji}
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-foreground mb-4 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced stats section */}
          <div className="mt-20 bg-gradient-to-r rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Nasze osiągnięcia w liczbach 📊
              </h3>
              <p className="text-muted-foreground">
                To co nas napędza każdego dnia!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "1,000+",
                  label: "Zadowolonych klientów",
                  emoji: "😊",
                },
                { number: "3", label: "Lata doświadczenia", emoji: "🎂" },
                { number: "99.2%", label: "Pozytywnych opinii", emoji: "⭐" },
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    {stat.emoji}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Products Slider */}
      <section id="products" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Podkłady higieniczne</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Nasze podkłady
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
          <div className="max-w-7xl mx-auto px-4">
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
      <Footer />
    </div>
  );
}
