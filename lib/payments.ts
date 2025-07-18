export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  fee?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

class PaymentManager {
  private providers: PaymentProvider[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Karty płatnicze, BLIK, przelewy',
      icon: '💳',
      enabled: true,
    },
    {
      id: 'przelewy24',
      name: 'Przelewy24',
      description: 'Polskie banki i BLIK',
      icon: '🏦',
      enabled: true,
    },
    {
      id: 'payu',
      name: 'PayU',
      description: 'Szybkie płatności online',
      icon: '⚡',
      enabled: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Płatności międzynarodowe',
      icon: '🌍',
      enabled: true,
    },
    {
      id: 'blik',
      name: 'BLIK',
      description: 'Płatność kodem z aplikacji bankowej',
      icon: '📱',
      enabled: true,
    },
    {
      id: 'bank_transfer',
      name: 'Przelew tradycyjny',
      description: 'Przelew na konto bankowe',
      icon: '🏛️',
      enabled: true,
    },
    {
      id: 'cod',
      name: 'Płatność przy odbiorze',
      description: 'Zapłać kurierowi gotówką',
      icon: '💰',
      enabled: true,
    },
  ];

  getAvailableProviders(): PaymentProvider[] {
    return this.providers.filter(provider => provider.enabled);
  }

  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'card',
        provider: 'stripe',
        name: 'Karta płatnicza',
        description: 'Visa, Mastercard, American Express',
      },
      {
        id: 'blik',
        provider: 'blik',
        name: 'BLIK',
        description: 'Kod z aplikacji bankowej',
      },
      {
        id: 'p24',
        provider: 'przelewy24',
        name: 'Przelewy24',
        description: 'Banki polskie',
      },
      {
        id: 'payu',
        provider: 'payu',
        name: 'PayU',
        description: 'Szybkie płatności',
      },
      {
        id: 'paypal',
        provider: 'paypal',
        name: 'PayPal',
        description: 'Konto PayPal',
      },
      {
        id: 'transfer',
        provider: 'bank_transfer',
        name: 'Przelew bankowy',
        description: 'Tradycyjny przelew',
      },
      {
        id: 'cod',
        provider: 'cod',
        name: 'Przy odbiorze',
        description: 'Gotówka kurierowi',
      },
    ];
  }

  async processPayment(
    method: string,
    amount: number,
    orderData: any
  ): Promise<PaymentResult> {
    // Symulacja przetwarzania płatności
    try {
      switch (method) {
        case 'card':
        case 'blik':
        case 'p24':
        case 'payu':
        case 'paypal':
          // Dla płatności online - przekierowanie do bramki
          return {
            success: true,
            transactionId: `txn_${Date.now()}`,
            redirectUrl: `/payment/process?method=${method}&amount=${amount}`,
          };
        
        case 'transfer':
          // Dla przelewu - instrukcje
          return {
            success: true,
            transactionId: `transfer_${Date.now()}`,
          };
        
        case 'cod':
          // Dla płatności przy odbiorze
          return {
            success: true,
            transactionId: `cod_${Date.now()}`,
          };
        
        default:
          return {
            success: false,
            error: 'Nieobsługiwana metoda płatności',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Błąd podczas przetwarzania płatności',
      };
    }
  }

  getPaymentInstructions(method: string, orderData: any): string {
    switch (method) {
      case 'transfer':
        return `
          Dane do przelewu:
          Odbiorca: Padii.pl - Jove Sp. z o.o.
          Numer konta: 12 3456 7890 1234 5678 9012 3456
          Tytuł: Zamówienie #${orderData.id}
          Kwota: ${orderData.total} PLN
        `;
      case 'cod':
        return 'Zapłać kurierowi gotówką przy odbiorze przesyłki.';
      default:
        return 'Instrukcje płatności zostaną wysłane na email.';
    }
  }
}

export const paymentManager = new PaymentManager();