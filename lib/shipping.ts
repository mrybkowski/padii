export interface ShippingProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  trackingUrl: string;
  enabled: boolean;
}

export interface ShippingMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  features: string[];
}

export interface ParcelLocker {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  available24h: boolean;
  provider: string;
}

class ShippingManager {
  private providers: ShippingProvider[] = [
    {
      id: 'inpost',
      name: 'InPost',
      description: 'Paczkomaty i kurier',
      logo: '📦',
      trackingUrl: 'https://inpost.pl/sledzenie-przesylek',
      enabled: true,
    },
    {
      id: 'orlen',
      name: 'Orlen Paczka',
      description: 'Punkty Orlen i kurier',
      logo: '⛽',
      trackingUrl: 'https://orlenpaczka.pl/sledzenie',
      enabled: true,
    },
    {
      id: 'dpd',
      name: 'DPD',
      description: 'Kurier i punkty odbioru',
      logo: '🚚',
      trackingUrl: 'https://tracktrace.dpd.com.pl',
      enabled: true,
    },
    {
      id: 'ups',
      name: 'UPS',
      description: 'Kurier międzynarodowy',
      logo: '📋',
      trackingUrl: 'https://www.ups.com/track',
      enabled: true,
    },
    {
      id: 'fedex',
      name: 'FedEx',
      description: 'Ekspresowa dostawa',
      logo: '✈️',
      trackingUrl: 'https://www.fedex.com/apps/fedextrack',
      enabled: true,
    },
    {
      id: 'poczta',
      name: 'Poczta Polska',
      description: 'Tradycyjna poczta',
      logo: '📮',
      trackingUrl: 'https://emonitoring.poczta-polska.pl',
      enabled: true,
    },
  ];

  getAvailableProviders(): ShippingProvider[] {
    return this.providers.filter(provider => provider.enabled);
  }

  getShippingMethods(): ShippingMethod[] {
    return [
      // InPost
      {
        id: 'inpost_locker',
        provider: 'inpost',
        name: 'Paczkomat InPost',
        description: 'Odbiór z paczkomatu 24/7',
        price: 12.99,
        estimatedDays: '1-2 dni',
        features: ['24/7', 'Bezpieczne', 'Wygodne'],
      },
      {
        id: 'inpost_courier',
        provider: 'inpost',
        name: 'Kurier InPost',
        description: 'Dostawa pod wskazany adres',
        price: 15.99,
        estimatedDays: '1-2 dni',
        features: ['Do drzwi', 'Elastyczne godziny'],
      },
      
      // Orlen Paczka
      {
        id: 'orlen_point',
        provider: 'orlen',
        name: 'Punkt Orlen',
        description: 'Odbiór ze stacji Orlen',
        price: 11.99,
        estimatedDays: '1-3 dni',
        features: ['Długie godziny', 'Wiele lokalizacji'],
      },
      {
        id: 'orlen_courier',
        provider: 'orlen',
        name: 'Kurier Orlen',
        description: 'Dostawa kurierem',
        price: 14.99,
        estimatedDays: '1-3 dni',
        features: ['Do drzwi', 'Śledzenie przesyłki'],
      },
      
      // DPD
      {
        id: 'dpd_courier',
        provider: 'dpd',
        name: 'Kurier DPD',
        description: 'Profesjonalna dostawa',
        price: 16.99,
        estimatedDays: '1-2 dni',
        features: ['Profesjonalny kurier', 'SMS powiadomienia'],
      },
      {
        id: 'dpd_pickup',
        provider: 'dpd',
        name: 'Punkt DPD',
        description: 'Odbiór z punktu DPD',
        price: 13.99,
        estimatedDays: '1-3 dni',
        features: ['Wygodne punkty', 'Elastyczny odbiór'],
      },
      
      // Pozostali
      {
        id: 'ups_standard',
        provider: 'ups',
        name: 'UPS Standard',
        description: 'Niezawodna dostawa',
        price: 19.99,
        estimatedDays: '2-3 dni',
        features: ['Międzynarodowy', 'Ubezpieczenie'],
      },
      {
        id: 'fedex_express',
        provider: 'fedex',
        name: 'FedEx Express',
        description: 'Szybka dostawa',
        price: 24.99,
        estimatedDays: '1 dzień',
        features: ['Ekspresowa', 'Premium'],
      },
      {
        id: 'poczta_standard',
        provider: 'poczta',
        name: 'Poczta Polska',
        description: 'Ekonomiczna dostawa',
        price: 9.99,
        estimatedDays: '3-5 dni',
        features: ['Ekonomiczna', 'Tradycyjna'],
      },
    ];
  }

  async getParcelLockers(city: string, provider?: string): Promise<ParcelLocker[]> {
    // Symulacja API do pobierania paczkomatów
    const mockLockers: ParcelLocker[] = [
      {
        id: 'WAW001',
        name: 'Paczkomat WAW001',
        address: 'ul. Marszałkowska 1',
        city: 'Warszawa',
        coordinates: { lat: 52.2297, lng: 21.0122 },
        available24h: true,
        provider: 'inpost',
      },
      {
        id: 'WAW002',
        name: 'Paczkomat WAW002',
        address: 'ul. Nowy Świat 15',
        city: 'Warszawa',
        coordinates: { lat: 52.2319, lng: 21.0224 },
        available24h: true,
        provider: 'inpost',
      },
      {
        id: 'ORL001',
        name: 'Orlen Paczka - Stacja Orlen',
        address: 'ul. Puławska 100',
        city: 'Warszawa',
        coordinates: { lat: 52.1951, lng: 21.0258 },
        available24h: false,
        provider: 'orlen',
      },
    ];

    return mockLockers.filter(locker => 
      locker.city.toLowerCase().includes(city.toLowerCase()) &&
      (!provider || locker.provider === provider)
    );
  }

  calculateShippingCost(method: string, weight: number, value: number): number {
    const shippingMethod = this.getShippingMethods().find(m => m.id === method);
    if (!shippingMethod) return 0;

    let cost = shippingMethod.price;

    // Dodatkowe opłaty za wagę
    if (weight > 5) {
      cost += (weight - 5) * 2;
    }

    // Darmowa dostawa od 200 zł
    if (value >= 200 && !method.includes('express') && !method.includes('fedex')) {
      cost = 0;
    }

    return cost;
  }

  async trackPackage(trackingNumber: string, provider: string): Promise<any> {
    // Symulacja śledzenia przesyłki
    return {
      trackingNumber,
      provider,
      status: 'W drodze',
      estimatedDelivery: '2024-01-20',
      events: [
        {
          date: '2024-01-18 10:00',
          status: 'Przesyłka nadana',
          location: 'Warszawa',
        },
        {
          date: '2024-01-18 15:30',
          status: 'W transporcie',
          location: 'Centrum sortownicze',
        },
        {
          date: '2024-01-19 08:00',
          status: 'W doręczeniu',
          location: 'Oddział lokalny',
        },
      ],
    };
  }
}

export const shippingManager = new ShippingManager();