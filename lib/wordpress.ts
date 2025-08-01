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

export interface Order {
  id?: number;
  status: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
    price: string;
  }>;
  shipping_method: string;
  payment_method: string;
  meta_data: Array<{
    key: string;
    value: string;
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

export interface BLPaczkaPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: "inpost" | "orlen" | "dpd" | "ups" | "fedex" | "poczta";
  available_24h: boolean;
  services: string[];
}

export interface PlanetPayMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
  settings: {
    enabled: string;
    title: string;
    description: string;
    [key: string]: any;
  };
}

export interface ShippingZone {
  id: number;
  name: string;
  order: number;
  locations: Array<{
    code: string;
    type: string;
  }>;
  methods: Array<{
    instance_id: number;
    title: string;
    order: number;
    enabled: boolean;
    method_id: string;
    method_title: string;
    settings: {
      [key: string]: any;
    };
  }>;
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

  // WooCommerce Store API methods
  async addToCart(productId: number, quantity: number = 1, variationId?: number): Promise<any> {
    const payload = {
      id: productId,
      quantity: quantity,
      ...(variationId && { variation_id: variationId })
    };

    return this.request("/wc/store/v1/cart/add-item", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getCart(): Promise<any> {
    return this.request("/wc/store/v1/cart");
  }

  async updateCartItem(key: string, quantity: number): Promise<any> {
    return this.request(`/wc/store/v1/cart/items/${key}`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(key: string): Promise<any> {
    return this.request(`/wc/store/v1/cart/items/${key}`, {
      method: "DELETE",
    });
  }

  async clearCart(): Promise<any> {
    return this.request("/wc/store/v1/cart/items", {
      method: "DELETE",
    });
  }

  // WooCommerce Store API Checkout
  async createStoreCheckout(checkoutData: {
    billing_address: {
      first_name: string;
      last_name: string;
      company?: string;
      address_1: string;
      address_2?: string;
      city: string;
      state?: string;
      postcode: string;
      country: string;
      email: string;
      phone?: string;
    };
    shipping_address?: {
      first_name: string;
      last_name: string;
      company?: string;
      address_1: string;
      address_2?: string;
      city: string;
      state?: string;
      postcode: string;
      country: string;
      phone?: string;
    };
    payment_method: string;
    payment_data?: Array<{
      key: string;
      value: any;
    }>;
    customer_note?: string;
    create_account?: boolean;
    customer_password?: string;
    additional_fields?: Record<string, any>;
    extensions?: {
      blpaczka?: {
        "blpaczka-point"?: string;
      };
      "woocommerce/order-attribution"?: {
        source_type?: string;
        referrer?: string;
        utm_campaign?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_content?: string;
        utm_id?: string;
        utm_term?: string;
        utm_source_platform?: string;
        utm_creative_format?: string;
        utm_marketing_tactic?: string;
        session_entry?: string;
        session_start_time?: string;
        session_pages?: string;
        session_count?: string;
        user_agent?: string;
      };
    };
  }): Promise<any> {
    return this.request("/wc/store/v1/checkout?_locale=site", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    });
  }

  async createOrder(orderData: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  // BLPaczka integration
  async getBLPaczkaPoints(
    params: {
      city?: string;
      postal_code?: string;
      type?: string;
      limit?: number;
    } = {}
  ): Promise<BLPaczkaPoint[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request(`/blpaczka/points${query ? `?${query}` : ""}`);
  }

  async getShippingZones(): Promise<ShippingZone[]> {
    return this.request("/shipping/zones");
  }

  async getShippingMethods(zoneId?: number): Promise<any[]> {
    const endpoint = zoneId
      ? `/shipping/zones/${zoneId}/methods`
      : "/shipping/zones";
    return this.request(endpoint);
  }

  // Planet Pay integration
  async getPlanetPayMethods(): Promise<PlanetPayMethod[]> {
    return this.request("/payment_gateways");
  }

  async getPlanetPayMethod(methodId: string): Promise<PlanetPayMethod> {
    return this.request(`/payment_gateways/${methodId}`);
  }

  async createPlanetPayPayment(paymentData: {
    order_id: number;
    payment_method: string;
    amount: number;
    currency: string;
    return_url: string;
    cancel_url: string;
    [key: string]: any;
  }) {
    return this.request("/planet-pay/create-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getPlanetPayStatus(transactionId: string) {
    return this.request(`/planet-pay/status/${transactionId}`);
  }

  async validateCoupon(code: string): Promise<any> {
    return this.request(`/coupons?code=${code}`);
  }

  // BLPaczka shipping methods
  async createBLPaczkaShipment(shipmentData: {
    order_id: number;
    point_id?: string;
    service_type: string;
    sender: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      postal_code: string;
    };
    receiver: {
      name: string;
      phone: string;
      email: string;
      address?: string;
      city?: string;
      postal_code?: string;
    };
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
    };
  }) {
    return this.request("/blpaczka/shipments", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    });
  }

  async trackBLPaczkaShipment(trackingNumber: string) {
    return this.request(`/blpaczka/track/${trackingNumber}`);
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order> {
    return this.request(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(id: number, status: string, note?: string): Promise<Order> {
    const updateData: any = {
      status: status,
    };

    if (note) {
      updateData.customer_note = note;
    }

    // Dodaj meta dane o płatności
    updateData.meta_data = [
      {
        key: "_payment_completed_date",
        value: new Date().toISOString(),
      },
      {
        key: "_payment_method_title",
        value: "Planet Pay",
      },
    ];

    return this.request(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async getOrderById(id: number): Promise<Order> {
    return this.request(`/orders/${id}`);
  }

  async getOrders(params: {
    page?: number;
    per_page?: number;
    status?: string;
    customer?: number;
    search?: string;
    after?: string;
    before?: string;
    orderby?: string;
    order?: string;
  } = {}): Promise<Order[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `/orders${query ? `?${query}` : ""}`;

    return this.request(endpoint);
  }

  async updateOrderPaymentStatus(
    id: number, 
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    transactionId?: string,
    paymentMethod?: string,
    note?: string
  ): Promise<Order> {
    const updateData: any = {
      status: paymentStatus,
    };

    const metaData = [
      {
        key: "_payment_status_updated",
        value: new Date().toISOString(),
      },
    ];

    if (transactionId) {
      metaData.push({
        key: "_transaction_id",
        value: transactionId,
      });
    }

    if (paymentMethod) {
      metaData.push({
        key: "_payment_method",
        value: paymentMethod,
      });
      metaData.push({
        key: "_payment_method_title",
        value: paymentMethod,
      });
    }

    if (paymentStatus === 'completed') {
      metaData.push({
        key: "_paid_date",
        value: new Date().toISOString(),
      });
    }

    updateData.meta_data = metaData;

    if (note) {
      updateData.customer_note = note;
    }

    return this.request(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async addOrderNote(id: number, note: string, customerNote: boolean = false): Promise<any> {
    return this.request(`/orders/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: note,
        customer_note: customerNote,
      }),
    });
  }

  async getOrderNotes(id: number): Promise<any[]> {
    return this.request(`/orders/${id}/notes`);
  }
}

export const wordpressAPI = new WordPressAPI();
