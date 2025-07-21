// lib/payments.ts

// Interfejsy typów
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  blik_required?: boolean;
  pbl_banks?: Bank[];
}

export interface Bank {
  id: string;
  name: string;
  logo_url: string;
}

export interface PaymentResponse {
  status: "CREATED" | "PENDING" | "COMPLETED" | "FAILED";
  payment_id: string;
  redirect_url?: string;
  error_message?: string;
}

export interface PaymentRequest {
  orderId: number;
  paymentMethod: string;
  billing: any;
  shipping: any;
  total: number; // w groszach
  currency: string;
  redirectUrl: string;
  blikCode?: string;
  bankId?: string;
}

// Klasa zarządzająca płatnościami
export class PaymentManager {
  private planetPayApiUrl: string;
  private planetPayApiKey: string;

  constructor() {
    this.planetPayApiUrl =
      process.env.NEXT_PUBLIC_PLANET_PAY_API_URL ||
      "https://sandbox.planetpay.example/api";
    this.planetPayApiKey = process.env.NEXT_PUBLIC_PLANET_PAY_API_KEY || "";
  }

  // Pobiera dostępne metody płatności
  async getPlanetPayMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(
        `${this.planetPayApiUrl}/v1/ecommerce/payment/methods`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.planetPayApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading payment methods:", error);
      return this.getDefaultMethods();
    }
  }

  // Tworzy płatność w systemie PlanetPay
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Przygotuj dane zgodne z API PlanetPay
      const payload = {
        order_id: paymentData.orderId,
        amount: paymentData.total,
        currency: paymentData.currency,
        method: paymentData.paymentMethod.replace("planetpay_", ""),
        return_url: paymentData.redirectUrl,
        customer: {
          email: paymentData.billing.email,
          first_name: paymentData.billing.first_name,
          last_name: paymentData.billing.last_name,
          phone: paymentData.billing.phone,
        },
        billing_address: {
          line1: paymentData.billing.address_1,
          line2: paymentData.billing.address_2 || "",
          city: paymentData.billing.city,
          postal_code: paymentData.billing.postcode,
          country: paymentData.billing.country,
        },
        shipping_address: {
          line1: paymentData.shipping.address_1,
          line2: paymentData.shipping.address_2 || "",
          city: paymentData.shipping.city,
          postal_code: paymentData.shipping.postcode,
          country: paymentData.shipping.country,
        },
        metadata: {
          order_id: paymentData.orderId,
        },
        blik_code: paymentData.blikCode,
        bank_id: paymentData.bankId,
      };

      const response = await fetch(`${this.planetPayApiUrl}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.planetPayApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("PlanetPay payment error:", data);
        return {
          status: "FAILED",
          payment_id: "",
          error_message: data.error || "Payment processing failed",
        };
      }

      return {
        status: data.status,
        payment_id: data.payment_id,
        redirect_url: data.redirect_url,
      };
    } catch (error) {
      console.error("PlanetPay payment error:", error);
      return {
        status: "FAILED",
        payment_id: "",
        error_message: "Internal server error",
      };
    }
  }

  // Domyślne metody płatności (fallback)
  private getDefaultMethods(): PaymentMethod[] {
    return [
      {
        id: "planetpay_card",
        name: "Karta płatnicza",
        description: "Visa, Mastercard",
      },
      {
        id: "planetpay_blik",
        name: "BLIK",
        description: "Szybka płatność mobilna",
        blik_required: true,
      },
      {
        id: "planetpay_pbl",
        name: "Przelew bankowy",
        description: "Przelew online",
        pbl_banks: [
          { id: "ing", name: "ING Bank Śląski", logo_url: "" },
          { id: "pko", name: "PKO BP", logo_url: "" },
          { id: "mbank", name: "mBank", logo_url: "" },
        ],
      },
    ];
  }
}

// Eksportujemy instancję, aby używać jej w aplikacji
export const paymentManager = new PaymentManager();
