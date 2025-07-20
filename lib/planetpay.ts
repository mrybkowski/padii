// lib/planetpay.ts
interface PaymentMethod {
  method: string;
  status: string;
  cardGroups?: string;
}

interface PaymentMethodOption {
  provider?: "BM" | "PA";
  bank?: string;
  bankId?: number;
  iconURL?: string;
}

interface AuthRequest {
  resource: "PAYMENT" | "TOKENIZER";
  channel?: "PAYWALL" | "MOBILE" | "WEBAPI" | "EBOK" | "CSS";
  secret: string;
  merchant: {
    merchantId: string;
  };
  agent?: {
    merchantId: string;
  };
  customer?: {
    email: string;
  };
}

interface AuthResponse {
  access_token: string;
}

interface PaymentRequest {
  channel: "PAYWALL" | "MOBILE" | "WEBAPI" | "EBOK" | "CSS";
  method: "CARD" | "PBL" | "BLIK" | "GPAY" | "APAY" | "UNKNOWN";
  instrument?: {
    type:
      | "COF"
      | "CARD"
      | "BLIK"
      | "BLIK_CODE"
      | "BLIK_UID"
      | "BLIK_PAYID"
      | "GPAY"
      | "APAY"
      | "PBL"
      | "SCOF"
      | "VTS";
    instrumentNo?: string;
    encInstrumentNo?: string;
    instrumentRef?: string;
    token?: string;
    expDate?: string;
    encExpDate?: string;
    cvv?: string;
    encCvv?: string;
    code?: string;
    alias?: string;
    app?: string;
    provider?: "BM" | "PA";
    bank?: string;
    bankId?: number;
  };
  merchant: {
    merchantId: string;
    name?: string;
    mcc?: string;
    url?: string;
    redirectURL?: string;
    terminalId?: string;
    location?: {
      street: string;
      postal: string;
      state?: string;
      city: string;
      country: string;
      countryOfOrigin?: string;
    };
    taxId?: string;
    acsNotificationURL?: string;
    amexMerchantId?: string;
  };
  customer: {
    email: string;
    extCustomerId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    billing?: {
      street: string;
      postal: string;
      state?: string;
      city: string;
      country: string;
    };
    phone?: {
      countryCode: string;
      phoneNo: string;
    };
    extAccountNo?: string;
  };
  device?: {
    ip?: string;
    name?: string;
    browserData?: {
      javascriptEnabled: boolean;
      javaEnabled?: boolean;
      language?: string;
      colorDepth?: string;
      screenHeight?: number;
      screenWidth?: number;
      timezone?: number;
    };
  };
  order: {
    amount: number;
    currency: string;
    commission?: number;
    extOrderId?: string;
    shipping?: {
      street: string;
      postal: string;
      state?: string;
      city: string;
      country: string;
    };
    description?: string;
  };
  options?: {
    transKind?: "AUTH" | "PREAUTH" | "ACCT_FUNDING";
    transType?: string;
    tokenize?: boolean;
    recurring?: "INITIAL" | "SUBSEQUENT";
    recurringType?: string;
    refPaymentId?: string;
    validTime?: number;
    iframe?: boolean;
    asyncNotify?: string;
    methods?: string;
    language?: string;
    restore?: boolean;
    repeat?: boolean;
    registerAlias?: boolean;
    recurringExpDate?: string;
    recurringCycle?: string;
    purposeCode?: string;
    fundSource?: "ACCOUNT" | "WALLET" | "PAYMENT" | "MERCHANT";
    fundSourceRef?: string;
  };
  consents?: string;
  restorable?: boolean;
  preAuthRequest?: boolean;
  initialRecurringForZeroAmount?: boolean;
}

interface PaymentResponse {
  paymentId: string;
  status:
    | "NEW"
    | "PENDING"
    | "COMPLETED"
    | "REJECTED"
    | "SETTLED"
    | "CANCELLED"
    | "ERROR";
  dataRequest?:
    | "INSTRUMENT"
    | "CARD_CVV"
    | "CARD_3DS"
    | "CARD_OTP"
    | "CAPTURE"
    | "BLIK_APP"
    | "DEVICE"
    | "CUSTOMER"
    | "EMAIL"
    | "BLIK_CODE";
  acsData?: {
    tdsServerTxnId?: string;
    acsTxnId?: string;
    acsRefNumber?: string;
    acsSignedContent?: string;
    acsURL?: string;
    challengeWindowSize?: string;
    messageType?: string;
    messageVersion?: string;
    creqPayload?: string;
    acsStartProtocol?: string;
    acsEndProtocol?: string;
    dsStartProtocol?: string;
    dsEndProtocol?: string;
  };
  redirectURL?: string;
  rejectCode?: string;
  rejectInfo?: string;
  tokenizerId?: string;
  channel: "PAYWALL" | "MOBILE" | "WEBAPI" | "EBOK" | "CSS";
  method: "CARD" | "PBL" | "BLIK" | "GPAY" | "APAY" | "UNKNOWN";
  apaySession?: string;
}

interface PaymentStatusResponse {
  paymentId: string;
  status:
    | "NEW"
    | "PENDING"
    | "COMPLETED"
    | "REJECTED"
    | "SETTLED"
    | "CANCELLED"
    | "ERROR";
  rejectCode?: string;
  rejectInfo?: string;
  redirectURL?: string;
  dataRequest?: string;
  statusPresentation?: boolean;
}

interface PaymentRefundRequest {
  subpaymentId?: string;
  amount?: number;
  description?: string;
  extRefundId?: string;
}

interface PaymentRefundResponse {
  paymentId: string;
  subpaymentId?: string;
  refundId: string;
  status: string;
  rejectCode?: string;
  rejectInfo?: string;
}

interface PaymentCancelRequest {
  reason?: "FRAUD" | "CLIENT" | "TIMEOUT" | "SYSTEM";
}

interface CancelStatusResponse {
  paymentId: string;
  status: string;
  rejectCode?: string;
  rejectInfo?: string;
  redirectURL?: string;
}

const PLANET_PAY_API_URL = process.env.NEXT_PUBLIC_PLANET_PAY_API_URL || "";
const PLANET_PAY_SECRET = process.env.PLANET_PAY_SECRET || "";
const PLANET_PAY_MERCHANT_ID = process.env.PLANET_PAY_MERCHANT_ID || "";

class PlanetPayAPI {
  private baseUrl: string;
  private secret: string;
  private merchantId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = PLANET_PAY_API_URL;
    this.secret = PLANET_PAY_SECRET;
    this.merchantId = PLANET_PAY_MERCHANT_ID;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const payload = {
      endpoint,
      method: options.method || "GET",
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(
        `Planet Pay API Error: ${response.status} - ${
          errorData.message || errorData.description || errorText
        }`
      );
    }

    return response.json();
  }

  private isTokenValid(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  async authenticate(customerEmail?: string): Promise<AuthResponse> {
    const authRequest: AuthRequest = {
      resource: "PAYMENT",
      channel: "WEBAPI",
      secret: this.secret,
      merchant: {
        merchantId: this.merchantId,
      },
    };

    if (customerEmail) {
      authRequest.customer = {
        email: customerEmail,
      };
    }

    const response = await this.request("/v1/ecommerce/auth", {
      method: "POST",
      body: JSON.stringify(authRequest),
    });

    this.accessToken = response.access_token;
    this.tokenExpiry = Date.now() + 10 * 60 * 1000;

    return response;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.request("/v1/ecommerce/payment/methods");
    return response.methods || [];
  }

  async getPaymentMethodOptions(
    paymentMethod: string
  ): Promise<PaymentMethodOption[]> {
    return this.request(`/v1/ecommerce/payment/methods/${paymentMethod}`);
  }

  async createPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    if (paymentRequest.customer?.email) {
      await this.authenticate(paymentRequest.customer.email);
    }

    return this.request("/v1/ecommerce/payment", {
      method: "POST",
      body: JSON.stringify(paymentRequest),
    });
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request(`/v1/ecommerce/payment/${paymentId}/status`);
  }

  async getPaymentInfo(paymentId: string) {
    return this.request(`/v1/ecommerce/payment/${paymentId}`);
  }

  async cancelPayment(
    paymentId: string,
    reason?: PaymentCancelRequest["reason"]
  ): Promise<CancelStatusResponse> {
    const cancelRequest: PaymentCancelRequest = {};
    if (reason) {
      cancelRequest.reason = reason;
    }

    return this.request(`/v1/ecommerce/payment/${paymentId}/cancel`, {
      method: "POST",
      body: JSON.stringify(cancelRequest),
    });
  }

  async refundPayment(
    paymentId: string,
    refundRequest: PaymentRefundRequest
  ): Promise<PaymentRefundResponse> {
    return this.request(`/v1/ecommerce/payment/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify(refundRequest),
    });
  }

  async getRefunds(paymentId: string) {
    return this.request(`/v1/ecommerce/payment/${paymentId}/refunds`);
  }

  async getRefundDetails(paymentId: string, refundId: string) {
    return this.request(
      `/v1/ecommerce/payment/${paymentId}/refund/${refundId}`
    );
  }

  async searchPayment(extOrderId: string) {
    return this.request("/v1/ecommerce/payment/search", {
      method: "POST",
      body: JSON.stringify({
        extOrderId,
        merchant: {
          merchantId: this.merchantId,
        },
      }),
    });
  }

  async restorePayment(paymentId: string): Promise<PaymentResponse> {
    return this.request(`/v1/ecommerce/payment/${paymentId}/restore`, {
      method: "POST",
    });
  }

  async retryPayment(paymentId: string): Promise<PaymentResponse> {
    return this.request(`/v1/ecommerce/payment/${paymentId}/retry`, {
      method: "POST",
    });
  }

  async createBlikPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "BLIK_CODE";
        code: string;
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  async createBlikAliasPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "BLIK_UID" | "BLIK_PAYID";
        alias: string;
        app?: string;
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  async createCardPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "CARD";
        instrumentNo: string;
        expDate: string;
        cvv: string;
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  async createPblPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "PBL";
        bank: string;
        bankId: number;
        provider?: "BM" | "PA";
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  async createGooglePayPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "GPAY";
        token: string;
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  async createApplePayPayment(
    paymentRequest: PaymentRequest & {
      instrument: {
        type: "APAY";
        token: string;
      };
    }
  ): Promise<PaymentResponse> {
    return this.createPayment(paymentRequest);
  }

  formatAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  validatePaymentRequest(request: PaymentRequest): string[] {
    const errors: string[] = [];

    if (!request.channel) errors.push("Channel is required");
    if (!request.method) errors.push("Method is required");
    if (!request.merchant?.merchantId) errors.push("Merchant ID is required");
    if (!request.customer?.email) errors.push("Customer email is required");
    if (!request.order?.amount || request.order.amount <= 0)
      errors.push("Order amount must be greater than 0");
    if (!request.order?.currency) errors.push("Order currency is required");

    if (request.method === "CARD" && request.instrument?.type === "CARD") {
      if (!request.instrument.instrumentNo)
        errors.push("Card number is required for card payments");
      if (!request.instrument.expDate)
        errors.push("Expiry date is required for card payments");
      if (!request.instrument.cvv)
        errors.push("CVV is required for card payments");
    }

    if (request.method === "BLIK" && request.instrument?.type === "BLIK_CODE") {
      if (!request.instrument.code || request.instrument.code.length !== 6) {
        errors.push("BLIK code must be 6 digits");
      }
    }

    if (request.method === "PBL" && request.instrument?.type === "PBL") {
      if (!request.instrument.bank && !request.instrument.bankId) {
        errors.push("Bank or bank ID is required for PBL payments");
      }
    }

    return errors;
  }
}

export const planetPayAPI = new PlanetPayAPI();
export type {
  PaymentMethod,
  PaymentMethodOption,
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentRefundRequest,
  PaymentRefundResponse,
  PaymentCancelRequest,
  CancelStatusResponse,
};
