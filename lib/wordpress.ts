export interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stock_status: string;
  stock_quantity: number;
  slug: string;
  status: string;
  featured: boolean;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: {
    id: number;
    src: string;
    alt: string;
  };
}

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL!;
const WP_CONSUMER_KEY = process.env.NEXT_PUBLIC_WP_CONSUMER_KEY!;
const WP_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WP_CONSUMER_SECRET!;

class WordPressAPI {
  private baseUrl: string;
  private auth: string;

  constructor() {
    if (!WP_API_URL || !WP_CONSUMER_KEY || !WP_CONSUMER_SECRET) {
      throw new Error(
        "WordPress API credentials are required. Please check your .env.local file."
      );
    }

    this.baseUrl = WP_API_URL;
    this.auth = Buffer.from(
      `${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`
    ).toString("base64");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${this.auth}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getProducts(
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      category?: string;
      featured?: boolean;
      orderby?: string;
      order?: string;
    } = {}
  ): Promise<Product[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `/products${query ? `?${query}` : ""}`;

    return this.request(endpoint);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug: string): Promise<Product[]> {
    return this.request(`/products?slug=${slug}`);
  }

  async getCategories(): Promise<Category[]> {
    return this.request("/products/categories");
  }

  async createOrder(orderData: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getShippingMethods(): Promise<any[]> {
    return this.request("/shipping/zones");
  }

  async getPaymentMethods(): Promise<any[]> {
    return this.request("/payment_gateways");
  }

  async validateCoupon(code: string): Promise<any> {
    return this.request(`/coupons?code=${code}`);
  }
}

export const wordpressAPI = new WordPressAPI();
