import { wordpressAPI, BLPaczkaPoint } from './wordpress';

export interface ShippingProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  trackingUrl: string;
  enabled: boolean;
  blpaczka_enabled?: boolean;
}

export interface ShippingMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  features: string[];
  blpaczka_service?: string;
  requires_point?: boolean;
}

export interface ParcelLocker extends BLPaczkaPoint {
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
      blpaczka_enabled: true,
    },
    {
      id: 'orlen',
      name: 'Orlen Paczka',
      description: 'Punkty Orlen i kurier',
      logo: '⛽',
      trackingUrl: 'https://orlenpaczka.pl/sledzenie',
      enabled: true,
      blpaczka_enabled: true,
    },
    {
      id: 'dpd',
      name: 'DPD',
      description: 'Kurier i punkty odbioru',
      logo: '🚚',
      trackingUrl: 'https://tracktrace.dpd.com.pl',
      enabled: true,
      blpaczka_enabled: true,
    },
    {
      id: 'ups',
      name: 'UPS',
      description: 'Kurier międzynarodowy',
      logo: '📋',
      trackingUrl: 'https://www.ups.com/track',
      enabled: true,
      blpaczka_enabled: true,
    },
    {
      id: 'fedex',
      name: 'FedEx',
      description: 'Ekspresowa dostawa',
      logo: '✈️',
      trackingUrl: 'https://www.fedex.com/apps/fedextrack',
      enabled: true,
      blpaczka_enabled: false,
    },
    {
      id: 'poczta',
      name: 'Poczta Polska',
      description: 'Tradycyjna poczta',
      logo: '📮',
      trackingUrl: 'https://emonitoring.poczta-polska.pl',
      enabled: true,
      blpaczka_enabled: true,
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
        blpaczka_service: 'inpost_locker',
        requires_point: true,
      },
      {
        id: 'inpost_courier',
        provider: 'inpost',
        name: 'Kurier InPost',
        description: 'Dostawa pod wskazany adres',
        price: 15.99,
        estimatedDays: '1-2 dni',
        features: ['Do drzwi', 'Elastyczne godziny'],
        blpaczka_service: 'inpost_courier',
        requires_point: false,
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
        blpaczka_service: 'orlen_point',
        requires_point: true,
      },
      {
        id: 'orlen_courier',
        provider: 'orlen',
        name: 'Kurier Orlen',
        description: 'Dostawa kurierem',
        price: 14.99,
        estimatedDays: '1-3 dni',
        features: ['Do drzwi', 'Śledzenie przesyłki'],
        blpaczka_service: 'orlen_courier',
        requires_point: false,
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
        blpaczka_service: 'dpd_courier',
        requires_point: false,
      },
      {
        id: 'dpd_pickup',
        provider: 'dpd',
        name: 'Punkt DPD',
        description: 'Odbiór z punktu DPD',
        price: 13.99,
        estimatedDays: '1-3 dni',
        features: ['Wygodne punkty', 'Elastyczny odbiór'],
        blpaczka_service: 'dpd_pickup',
        requires_point: true,
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
        blpaczka_service: 'ups_standard',
        requires_point: false,
      },
      {
        id: 'fedex_express',
        provider: 'fedex',
        name: 'FedEx Express',
        description: 'Szybka dostawa',
        price: 24.99,
        estimatedDays: '1 dzień',
        features: ['Ekspresowa', 'Premium'],
        blpaczka_service: 'fedex_express',
        requires_point: false,
      },
      {
        id: 'poczta_standard',
        provider: 'poczta',
        name: 'Poczta Polska',
        description: 'Ekonomiczna dostawa',
        price: 9.99,
        estimatedDays: '3-5 dni',
        features: ['Ekonomiczna', 'Tradycyjna'],
        blpaczka_service: 'poczta_standard',
        requires_point: false,
      },
    ];
  }

  async getParcelLockers(city: string, provider?: string): Promise<ParcelLocker[]> {
    try {
      // Pobierz punkty z BLPaczka API
      const blpaczkaPoints = await wordpressAPI.getBLPaczkaPoints({
        city,
        type: provider,
        limit: 50,
      });

      // Konwertuj na format ParcelLocker
      return blpaczkaPoints.map(point => ({
        ...point,
        available24h: point.available_24h,
        provider: point.type,
      }));
    } catch (error) {
      console.error('Error fetching BLPaczka points:', error);
      
      // Fallback do mock danych
      const mockLockers: ParcelLocker[] = [
        {
          id: 'WAW001',
          name: 'Paczkomat WAW001',
          address: 'ul. Marszałkowska 1',
          city: 'Warszawa',
          postal_code: '00-001',
          coordinates: { lat: 52.2297, lng: 21.0122 },
          type: 'inpost',
          available_24h: true,
          available24h: true,
          provider: 'inpost',
          services: ['paczkomat'],
        },
        {
          id: 'WAW002',
          name: 'Paczkomat WAW002',
          address: 'ul. Nowy Świat 15',
          city: 'Warszawa',
          postal_code: '00-002',
          coordinates: { lat: 52.2319, lng: 21.0224 },
          type: 'inpost',
          available_24h: true,
          available24h: true,
          provider: 'inpost',
          services: ['paczkomat'],
        },
        {
          id: 'ORL001',
          name: 'Orlen Paczka - Stacja Orlen',
          address: 'ul. Puławska 100',
          city: 'Warszawa',
          postal_code: '02-595',
          coordinates: { lat: 52.1951, lng: 21.0258 },
          type: 'orlen',
          available_24h: false,
          available24h: false,
          provider: 'orlen',
          services: ['punkt_odbioru'],
        },
      ];

      return mockLockers.filter(locker => 
        locker.city.toLowerCase().includes(city.toLowerCase()) &&
        (!provider || locker.provider === provider)
      );
    }
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
    try {
      // Użyj BLPaczka API do śledzenia
      return await wordpressAPI.trackBLPaczkaShipment(trackingNumber);
    } catch (error) {
      console.error('Error tracking package:', error);
      
      // Fallback do mock danych
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

  async createShipment(orderData: any, selectedPoint?: ParcelLocker): Promise<any> {
    try {
      const shipmentData = {
        order_id: orderData.id,
        point_id: selectedPoint?.id,
        service_type: orderData.shipping_method,
        sender: {
          name: 'Padii.pl',
          phone: '+48519439762',
          email: 'biuro@padii.pl',
          address: 'ul. Prosta 21',
          city: 'Szczęsne',
          postal_code: '05-825',
        },
        receiver: {
          name: `${orderData.billing.first_name} ${orderData.billing.last_name}`,
          phone: orderData.billing.phone,
          email: orderData.billing.email,
          address: selectedPoint ? undefined : orderData.shipping.address_1,
          city: selectedPoint ? undefined : orderData.shipping.city,
          postal_code: selectedPoint ? undefined : orderData.shipping.postcode,
        },
        package: {
          weight: 0.5, // Domyślna waga dla podkładów
          dimensions: {
            length: 30,
            width: 20,
            height: 5,
          },
        },
      };

      return await wordpressAPI.createBLPaczkaShipment(shipmentData);
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }
}

export const shippingManager = new ShippingManager();