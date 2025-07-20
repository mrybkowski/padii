"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { BlogPost, blogManager } from "@/lib/blog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await blogManager.getPost(params.slug as string);
        setPost(postData);

        if (postData) {
          const related = await blogManager.getRelatedPosts(postData.id, 3);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error("Error loading blog post:", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      loadPost();
    }
  }, [params.slug]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.title || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Artykuł nie znaleziony</h1>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do bloga
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Strona główna
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do bloga
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          {/* Categories */}
          <div className="flex gap-2 mb-4">
            {post.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
            {post.featured && <Badge variant="destructive">Polecane</Badge>}
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min czytania</span>
            </div>
            <div className="flex items-center gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <User className="h-4 w-4" />
              <span>{post.author.name}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Udostępnij:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl
                    )}`,
                    "_blank"
                  )
                }
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      shareUrl
                    )}&text=${encodeURIComponent(shareTitle)}`,
                    "_blank"
                  )
                }
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      shareUrl
                    )}`,
                    "_blank"
                  )
                }
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <span dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Tagi:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-12" />

        {/* Author Bio */}
        <div className="mb-12 p-6 bg-white rounded-lg border">
          <div className="flex items-start gap-4">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="font-bold text-lg mb-2">{post.author.name}</h3>
              <p className="text-muted-foreground">
                Ekspert w dziedzinie higieny i pielęgnacji psów. Autor wielu
                artykułów i poradników dla właścicieli czworonogów.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Powiązane artykuły</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={
                          relatedPost.featuredImage?.src ||
                          "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop"
                        }
                        alt={
                          relatedPost.featuredImage?.alt || relatedPost.title
                        }
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {relatedPost.categories.slice(0, 1).map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <Link href={`/blog/${relatedPost.slug}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        <Clock className="h-3 w-3" />
                        <span>{relatedPost.readTime} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wszystkie artykuły
            </Link>
          </Button>

          <Button asChild>
            <Link href="/products">
              Zobacz produkty
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>

      <Footer />
    </div>
  );
}
