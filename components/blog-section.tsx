"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";
import { BlogPost, blogManager } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface BlogSectionProps {
  className?: string;
  showTitle?: boolean;
  limit?: number;
}

export function BlogSection({
  className,
  showTitle = true,
  limit = 3,
}: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const featuredPosts = await blogManager.getFeaturedPosts(limit);
        setPosts(featuredPosts);
      } catch (error) {
        console.error("Error loading blog posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [limit]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <section className={cn("py-16", className)}>
        <div className="max-w-7xl mx-auto px-4">
          {showTitle && (
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-300 animate-pulse rounded-lg h-[400px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <Badge className="mb-4">Blog</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Porady dla właścicieli psów
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Praktyczne wskazówki, porady ekspertów i najnowsze informacje o
              higienie i pielęgnacji psów.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              className={cn(
                "group overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-white/80 backdrop-blur-sm",
                index === 0 && limit > 1 && "md:col-span-2 lg:col-span-1"
              )}
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={
                      post.featuredImage?.src ||
                      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=400&fit=crop"
                    }
                    alt={post.featuredImage?.alt || post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Categories */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {post.categories.slice(0, 2).map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-white/90 text-gray-900"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>

                  {/* Featured badge */}
                  {post.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="destructive">Polecane</Badge>
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} min</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-bold text-xl leading-tight line-clamp-2 hover:text-primary transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      {post.author.avatar && (
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {post.author.name}
                        </div>
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Czytaj
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              Zobacz wszystkie artykuły
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}