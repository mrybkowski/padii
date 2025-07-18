export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    src: string;
    alt: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: Date;
  updatedAt: Date;
  categories: string[];
  tags: string[];
  readTime: number;
  featured: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

class BlogManager {
  private posts: BlogPost[] = [
    {
      id: 1,
      title: 'Jak wybrać odpowiedni rozmiar podkładów dla swojego psa?',
      slug: 'jak-wybrac-rozmiar-podkladow-dla-psa',
      excerpt: 'Wybór odpowiedniego rozmiaru podkładów higienicznych to kluczowa kwestia dla komfortu Twojego pupila. Dowiedz się, na co zwrócić uwagę.',
      content: `
        <p>Wybór odpowiedniego rozmiaru podkładów higienicznych dla psa to jedna z najważniejszych decyzji, które musisz podjąć jako odpowiedzialny właściciel.</p>
        
        <h2>Rozmiary dostępne na rynku</h2>
        <p>Na rynku dostępne są różne rozmiary podkładów:</p>
        <ul>
          <li><strong>60x40 cm</strong> - idealne dla małych psów (do 10 kg)</li>
          <li><strong>60x60 cm</strong> - uniwersalne dla średnich psów (10-25 kg)</li>
          <li><strong>60x90 cm</strong> - dla dużych psów (powyżej 25 kg)</li>
        </ul>
        
        <h2>Jak mierzyć psa?</h2>
        <p>Zmierz długość psa od nosa do ogona oraz szerokość w najszerszym miejscu. Dodaj 10-15 cm zapasu z każdej strony.</p>
        
        <h2>Dodatkowe wskazówki</h2>
        <p>Pamiętaj, że lepiej wybrać większy rozmiar niż za mały. Pies powinien mieć komfort podczas korzystania z podkładu.</p>
      `,
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
        alt: 'Pies na podkładzie higienicznym',
      },
      author: {
        name: 'Anna Kowalska',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      publishedAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      categories: ['Poradniki', 'Higiena'],
      tags: ['podkłady', 'rozmiary', 'psy'],
      readTime: 5,
      featured: true,
    },
    {
      id: 2,
      title: 'Trenowanie szczeniaka do korzystania z podkładów',
      slug: 'trenowanie-szczeniaka-podklady',
      excerpt: 'Skuteczne metody nauczenia szczeniaka korzystania z podkładów higienicznych. Praktyczne porady dla początkujących właścicieli.',
      content: `
        <p>Trenowanie szczeniaka do korzystania z podkładów wymaga cierpliwości i konsekwencji. Oto sprawdzone metody.</p>
        
        <h2>Podstawowe zasady</h2>
        <ul>
          <li>Regularność - wyznacz stałe pory</li>
          <li>Pozytywne wzmocnienie - nagradzaj za sukces</li>
          <li>Cierpliwość - nie karaj za błędy</li>
        </ul>
        
        <h2>Krok po kroku</h2>
        <p>1. Umieść podkład w stałym miejscu<br>
        2. Prowadź szczeniaka na podkład po posiłkach<br>
        3. Nagrodź za każde użycie podkładu<br>
        4. Stopniowo zwiększaj odstępy między wizytami</p>
      `,
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=400&fit=crop',
        alt: 'Szczeniak podczas treningu',
      },
      author: {
        name: 'Piotr Nowak',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      publishedAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      categories: ['Trening', 'Szczenięta'],
      tags: ['trening', 'szczenięta', 'podkłady'],
      readTime: 7,
      featured: true,
    },
    {
      id: 3,
      title: 'Ekologiczne podkłady - czy warto?',
      slug: 'ekologiczne-podklady-czy-warto',
      excerpt: 'Porównanie tradycyjnych i ekologicznych podkładów higienicznych. Zalety, wady i wpływ na środowisko.',
      content: `
        <p>Coraz więcej właścicieli psów zastanawia się nad wyborem ekologicznych podkładów. Czy rzeczywiście są lepsze?</p>
        
        <h2>Zalety podkładów ekologicznych</h2>
        <ul>
          <li>Biodegradowalne materiały</li>
          <li>Brak szkodliwych chemikaliów</li>
          <li>Lepsze dla skóry wrażliwej</li>
          <li>Mniejszy wpływ na środowisko</li>
        </ul>
        
        <h2>Wady</h2>
        <ul>
          <li>Wyższa cena</li>
          <li>Mniejsza dostępność</li>
          <li>Czasem gorsza chłonność</li>
        </ul>
        
        <h2>Nasze rekomendacje</h2>
        <p>Jeśli zależy Ci na środowisku i masz psa z wrażliwą skórą, ekologiczne podkłady to dobry wybór.</p>
      `,
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
        alt: 'Natura i ekologia',
      },
      author: {
        name: 'Maria Zielińska',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
      publishedAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      categories: ['Ekologia', 'Produkty'],
      tags: ['ekologia', 'podkłady', 'środowisko'],
      readTime: 6,
      featured: false,
    },
    {
      id: 4,
      title: 'Higiena w domu z psem - praktyczne porady',
      slug: 'higiena-w-domu-z-psem',
      excerpt: 'Jak utrzymać czystość w domu, gdy masz psa? Sprawdzone metody i produkty do codziennej higieny.',
      content: `
        <p>Utrzymanie czystości w domu z psem wymaga odpowiedniej organizacji i dobrych produktów.</p>
        
        <h2>Codzienne rutyny</h2>
        <ul>
          <li>Regularne odkurzanie</li>
          <li>Wietrzenie pomieszczeń</li>
          <li>Mycie łap po spacerach</li>
          <li>Wymiana podkładów</li>
        </ul>
        
        <h2>Niezbędne produkty</h2>
        <ul>
          <li>Podkłady higieniczne</li>
          <li>Środki do dezynfekcji</li>
          <li>Neutralizatory zapachów</li>
          <li>Ręczniki dla psa</li>
        </ul>
      `,
      featuredImage: {
        src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
        alt: 'Czysty dom z psem',
      },
      author: {
        name: 'Tomasz Wiśniewski',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      publishedAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      categories: ['Higiena', 'Dom'],
      tags: ['higiena', 'czystość', 'dom'],
      readTime: 4,
      featured: false,
    },
  ];

  private categories: BlogCategory[] = [
    {
      id: 1,
      name: 'Poradniki',
      slug: 'poradniki',
      description: 'Praktyczne porady dla właścicieli psów',
      count: 15,
    },
    {
      id: 2,
      name: 'Higiena',
      slug: 'higiena',
      description: 'Wszystko o higienie psów',
      count: 12,
    },
    {
      id: 3,
      name: 'Trening',
      slug: 'trening',
      description: 'Trenowanie i wychowanie psów',
      count: 8,
    },
    {
      id: 4,
      name: 'Produkty',
      slug: 'produkty',
      description: 'Recenzje i porównania produktów',
      count: 10,
    },
    {
      id: 5,
      name: 'Ekologia',
      slug: 'ekologia',
      description: 'Ekologiczne rozwiązania dla psów',
      count: 5,
    },
  ];

  async getPosts(params: {
    page?: number;
    per_page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  } = {}): Promise<BlogPost[]> {
    let filteredPosts = [...this.posts];

    // Filtrowanie po kategorii
    if (params.category) {
      filteredPosts = filteredPosts.filter(post =>
        post.categories.some(cat => 
          cat.toLowerCase().includes(params.category!.toLowerCase())
        )
      );
    }

    // Filtrowanie polecanych
    if (params.featured) {
      filteredPosts = filteredPosts.filter(post => post.featured);
    }

    // Wyszukiwanie
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    // Sortowanie po dacie (najnowsze pierwsze)
    filteredPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Paginacja
    const page = params.page || 1;
    const perPage = params.per_page || 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return filteredPosts.slice(startIndex, endIndex);
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return this.posts.find(post => post.slug === slug) || null;
  }

  async getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    return this.posts
      .filter(post => post.featured)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async getCategories(): Promise<BlogCategory[]> {
    return this.categories;
  }

  async getRelatedPosts(postId: number, limit: number = 3): Promise<BlogPost[]> {
    const currentPost = this.posts.find(p => p.id === postId);
    if (!currentPost) return [];

    return this.posts
      .filter(post => 
        post.id !== postId &&
        post.categories.some(cat => currentPost.categories.includes(cat))
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }
}

export const blogManager = new BlogManager();