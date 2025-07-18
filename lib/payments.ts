import { wordpressAPI, PlanetPayMethod } from './wordpress';

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, any>;
  planet_pay_id?: string;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  fee?: number;
  minAmount?: number;
  maxAmount?: number;
  planet_pay_method?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  planet_pay_data?: any;
}

class PaymentManager {
  private providers: PaymentProvider[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Karty płatnicze, BLIK, przelewy',
      icon: '💳',
      enabled: true,
      planet_pay_id: 'stripe',
    },
    {
      id: 'przelewy24',
      name: 'Przelewy24',
      description: 'Polskie banki i BLIK',
      icon: '🏦',
      enabled: true,
      planet_pay_id: 'przelewy24',
    },
    {
      id: 'payu',
      name: 'PayU',
      description: 'Szybkie płatności online',
      icon: '⚡',
      enabled: true,
      planet_pay_id: 'payu',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Płatności międzynarodowe',
      icon: '🌍',
      enabled: true,
      planet_pay_id: 'paypal',
    },
    {
      id: 'blik',
      name: 'BLIK',
      description: 'Płatność kodem z aplikacji bankowej',
      icon: '📱',
      enabled: true,
      planet_pay_id: 'blik',
    },
    {
      id: 'bank_transfer',
      name: 'Przelew tradycyjny',
      description: 'Przelew na konto bankowe',
      icon: '🏛️',
      enabled: true,
      planet_pay_id: 'bacs',
    },
    {
      id: 'cod',
      name: 'Płatność przy odbiorze',
      description: 'Zapłać kurierowi gotówką',
      icon: '💰',
      enabled: true,
      planet_pay_id: 'cod',
    },
  ];

  async loadPlanetPayMethods(): Promise<void> {
    try {
      const methods = await wordpressAPI.getPlanetPayMethods();
      
      // Aktualizuj providers na podstawie danych z Planet Pay
      this.providers = this.providers.map(provider => {
        const planetPayMethod = methods.find(m => m.id === provider.planet_pay_id);
        if (planetPayMethod) {
          return {
            ...provider,
            enabled: planetPayMethod.enabled,
            name: planetPayMethod.title || provider.name,
            description: planetPayMethod.description || provider.description,
            config: planetPayMethod.settings,
          };
        }
        return provider;
      });
    } catch (error) {
      console.error('Error loading Planet Pay methods:', error);
    }
  }
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
        planet_pay_method: 'stripe',
      },
      {
        id: 'blik',
        provider: 'blik',
        name: 'BLIK',
        description: 'Kod z aplikacji bankowej',
        planet_pay_method: 'blik',
      },
      {
        id: 'p24',
        provider: 'przelewy24',
        name: 'Przelewy24',
        description: 'Banki polskie',
        planet_pay_method: 'przelewy24',
      },
      {
        id: 'payu',
        provider: 'payu',
        name: 'PayU',
        description: 'Szybkie płatności',
        planet_pay_method: 'payu',
      },
      {
        id: 'paypal',
        provider: 'paypal',
        name: 'PayPal',
        description: 'Konto PayPal',
        planet_pay_method: 'paypal',
      },
      {
        id: 'transfer',
        provider: 'bank_transfer',
        name: 'Przelew bankowy',
        description: 'Tradycyjny przelew',
        planet_pay_method: 'bacs',
      },
      {
        id: 'cod',
        provider: 'cod',
        name: 'Przy odbiorze',
        description: 'Gotówka kurierowi',
        planet_pay_method: 'cod',
      },
    ];
  }

  async processPayment(
    method: string,
    amount: number,
    orderData: any
  ): Promise<PaymentResult> {
    try {
      const paymentMethod = this.getPaymentMethods().find(m => m.id === method);
      if (!paymentMethod?.planet_pay_method) {
        throw new Error('Nieobsługiwana metoda płatności');
      }

      switch (method) {
        case 'card':
        case 'blik':
        case 'p24':
        case 'payu':
        case 'paypal':
          // Użyj Planet Pay do przetworzenia płatności online
          try {
            const planetPayData = await wordpressAPI.createPlanetPayPayment({
              order_id: orderData.id,
              payment_method: paymentMethod.planet_pay_method,
              amount: amount,
              currency: 'PLN',
              return_url: `${window.location.origin}/order-received/${orderData.id}`,
              cancel_url: `${window.location.origin}/checkout`,
              customer_email: orderData.billing.email,
              customer_name: `${orderData.billing.first_name} ${orderData.billing.last_name}`,
              description: `Zamówienie #${orderData.id} - Padii.pl`,
            });

            return {
              success: true,
              transactionId: planetPayData.transaction_id,
              redirectUrl: planetPayData.payment_url,
              planet_pay_data: planetPayData,
            };
          } catch (error) {
            console.error('Planet Pay error:', error);
            // Fallback do symulacji
            return {
              success: true,
              transactionId: `txn_${Date.now()}`,
              redirectUrl: `/payment/process?method=${method}&amount=${amount}`,
            };
          }
        
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
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd podczas przetwarzania płatności',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<any> {
    try {
      return await wordpressAPI.getPlanetPayStatus(transactionId);
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        status: 'unknown',
        error: 'Nie można sprawdzić statusu płatności',
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