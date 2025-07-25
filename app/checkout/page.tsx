"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Truck,
  User,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  MapPin,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWCCart } from "@/hooks/use-wc-cart";
import { Header } from "@/components/Header";
import { wordpressAPI } from "@/lib/wordpress";
import { paymentManager } from "@/lib/payments";
import { shippingManager } from "@/lib/shipping";
import Link from "next/link";
import { PaymentMethods } from "@/components/payment-methods";
import { ShippingMethods } from "@/components/shipping-methods";
import { ParcelLocker } from "@/lib/shipping";
import { planetPayAPI } from "@/lib/planetpay";

interface CheckoutFormData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    company?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    company?: string;
  };
  payment_method: string;
  shipping_method: string;
  customer_note?: string;
}
import type { DeliveryPoint } from "@/lib/blpaczka";
import type { PaymentMethod } from "@/lib/planetpay";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: localCart, clearCart: clearLocalCart } = useCart();
  const { cart: wcCart, clearCart: clearWCCart, formatPrice: wcFormatPrice } = useWCCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [shippingToBilling, setShippingToBilling] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState<
    ParcelLocker | undefined
  >();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<string>("dhl");
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(
    null
  );

  const [formData, setFormData] = useState({
    billing: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address_1: "",
      address_2: "",
      city: "",
      postcode: "",
      country: "POL",
      company: "",
    },
    shipping: {},
    payment_method: "planetpay_card",
    shipping_method: "blpaczka",
    customer_note: "",
    delivery_point: "",
    blpaczka_courier: "dhl",
    instrument: {
      type: "",
      code: "",
    },
  });

  const parsePointData = (
    html: string
  ): Omit<DeliveryPoint, "courier_code"> => {
    // Usuwamy tagi HTML i dzielimy tekst na linie
    const text = html.replace(/<[^>]*>/g, "");
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    // Inicjalizujemy obiekt z domyślnymi wartościami
    const point: any = {
      id: "",
      name: "",
      address: "",
      city: "",
      postal_code: "",
      opening_hours: "",
    };

    // Parsujemy poszczególne linie
    lines.forEach((line) => {
      if (line.startsWith("Kod punktu:")) {
        point.id = line.replace("Kod punktu:", "").trim();
      } else if (line.startsWith("Godziny otwarcia:")) {
        point.opening_hours = line.replace("Godziny otwarcia:", "").trim();
      } else if (/^\d{2}-\d{3}$/.test(line)) {
        point.postal_code = line;
      }
      // Jeśli linia zawiera tylko tekst (bez dwukropka), to może to być miasto lub adres
      else if (!line.includes(":")) {
        if (!point.city) {
          point.city = line;
        } else if (!point.address) {
          point.address = line;
        }
      }
    });

    // Nazwa punktu to pierwsza linia po usunięciu tagów
    point.name = lines[0] || "";

    return {
      point_id: point.id,
      address: point.address,
      city: point.city,
      postal_code: point.postal_code,
      opening_hours: point.opening_hours,
      description: point.name,
    };
  };

  useEffect(() => {
    // Setup message listener for iframe communication
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SELECT_CHANGE") {
        const pointData = event.data.value.pointData;

        const parsedPoint =
          typeof pointData === "string" ? parsePointData(pointData) : pointData;

        const point: DeliveryPoint = {
          point_id: parsedPoint.point_id,
          courier_code: parsedPoint.point_id,
          address: parsedPoint.address,
          city: parsedPoint.city,
          postal_code: parsedPoint.postal_code,
          opening_hours: parsedPoint.opening_hours,
          description: parsedPoint.description,
        };

        setSelectedPoint(point);
        handleInputChange("delivery_point", point.point_id);
        handleInputChange("shipping_method", point.courier_code);
        handleInputChange("blpaczka_courier", point.courier_code);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourier]);

  const fetchPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true);
    setOrderError(null);

    try {
      const methodsResponse = await fetch("/api/planetpay/methods");

      if (!methodsResponse.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      const methodsData = await methodsResponse.json();

      if (methodsData?.methods) {
        setPaymentMethods(methodsData.methods);
        if (methodsData.methods.length > 0) {
          setFormData((prev) => ({
            ...prev,
            payment_method: `planetpay_${methodsData.methods[0].method.toLowerCase()}`,
          }));
        }
      } else {
        setOrderError("Brak dostępnych metod płatności");
      }
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      setOrderError(error.message || "Błąd podczas pobierania metod płatności");
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const formatPrice = (price: number) => {
    if (wcCart) {
      return wcFormatPrice(price.toString());
    }
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const calculateShipping = () => {
    if (wcCart) {
      return parseFloat(wcCart.totals.total_shipping) / Math.pow(10, wcCart.totals.currency_minor_unit);
    }
    return shippingManager.calculateShippingCost(
      formData.shipping_method,
      2,
      localCart.total
    );
  };

  const calculateTotal = () => {
    if (wcCart) {
      return parseFloat(wcCart.totals.total_price) / Math.pow(10, wcCart.totals.currency_minor_unit);
    }
    const shipping = calculateShipping();
    return localCart.total + shipping - couponDiscount;
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setOrderError(null);

    try {
      const coupons = await wordpressAPI.validateCoupon(couponCode);
      if (coupons.length > 0) {
        const coupon = coupons[0];
        const discount =
          coupon.discount_type === "percent"
            ? (getCurrentCartTotal() * parseFloat(coupon.amount)) / 100
            : parseFloat(coupon.amount);
        setCouponDiscount(discount);
      } else {
        setOrderError("Nieprawidłowy kod kuponu");
      }
    } catch (error) {
      setOrderError("Nieprawidłowy kod kuponu");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const getCurrentCartTotal = () => {
    return wcCart ? parseFloat(wcCart.totals.total_items) / Math.pow(10, wcCart.totals.currency_minor_unit) : localCart.total;
  };

  const getCurrentCartItems = () => {
    return wcCart ? wcCart.items : localCart.items;
  };

  const handleInputChange = (
    field: keyof typeof formData | string,
    value: string
  ) => {
    if (field.includes(".")) {
      const [section, subField] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as "billing" | "shipping"],
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field as keyof typeof formData]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { billing } = formData;
    if (
      !billing.first_name ||
      !billing.last_name ||
      !billing.email ||
      !billing.phone ||
      !billing.address_1 ||
      !billing.city ||
      !billing.postcode
    ) {
      setOrderError("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    if (!formData.payment_method || !formData.shipping_method) {
      setOrderError("Proszę wybrać metodę płatności i dostawy");
      return;
    }

    // Sprawdź czy metoda dostawy wymaga punktu odbioru
    const shippingMethod = shippingManager
      .getShippingMethods()
      .find((m) => m.id === formData.shipping_method);
    if (shippingMethod?.requires_point && !selectedLocker) {
      setOrderError("Proszę wybrać punkt odbioru dla wybranej metody dostawy");
      return;
    }
    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Przygotuj dane dla WooCommerce Store API
      const checkoutData = {
        billing: formData.billing,
        billing_address: {
          first_name: formData.billing.first_name,
          last_name: formData.billing.last_name,
          company: formData.billing.company || "",
          address_1: formData.billing.address_1,
          address_2: formData.billing.address_2 || "",
          city: formData.billing.city,
          state: "",
          postcode: formData.billing.postcode,
          country: formData.billing.country,
          email: formData.billing.email,
          phone: formData.billing.phone,
        },
        shipping_address: shippingToBilling ? {
          first_name: formData.billing.first_name,
          last_name: formData.billing.last_name,
          company: formData.billing.company || "",
          address_1: formData.billing.address_1,
          address_2: formData.billing.address_2 || "",
          city: formData.billing.city,
          state: "",
          postcode: formData.billing.postcode,
          country: formData.billing.country,
          phone: formData.billing.phone,
        } : formData.shipping,
        payment_method: formData.payment_method,
        payment_data: [
          {
            key: `wc-${formData.payment_method}-new-payment-method`,
            value: false,
          },
        ],
        customer_note: formData.customer_note || "",
        create_account: false,
        customer_password: "",
        additional_fields: {},
        extensions: {
          "woocommerce/order-attribution": {
            source_type: "typein",
            referrer: document.referrer || "(none)",
            utm_campaign: "(none)",
            utm_source: "(direct)",
            utm_medium: "(none)",
            utm_content: "(none)",
            utm_id: "(none)",
            utm_term: "(none)",
            utm_source_platform: "(none)",
            utm_creative_format: "(none)",
            utm_marketing_tactic: "(none)",
            session_entry: window.location.origin,
            session_start_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            session_pages: "1",
            session_count: "1",
            user_agent: navigator.userAgent,
          },
          blpaczka: {
            "blpaczka-point": formData.delivery_point || "",
          },
        },
      };

      // Użyj WooCommerce Store API
      const response = await fetch('/api/wordpress/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const order = await response.json();

      if (order.id) {
        // Utwórz przesyłkę w BLPaczka jeśli potrzeba
        if (shippingMethod?.blpaczka_service) {
          try {
            await createBLPaczkaShipment(order, selectedPoint);
          } catch (error) {
            console.error("Error creating shipment:", error);
            // Nie przerywaj procesu zamówienia z powodu błędu przesyłki
          }
        }

        // Przetwórz płatność przez Planet Pay
        if (
          formData.payment_method !== "planetpay_cod" &&
          formData.payment_method !== "planetpay_transfer"
        ) {
          try {
            const paymentResult = await processPlanetPayPayment(order);

            console.log("Payment result:", paymentResult);
                  // Aktualizuj status zamówienia
                  await fetch(`/api/wordpress/orders/${order.id}/payment-status`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      status: "processing",
                      paymentMethod: "Planet Pay",
                      note: "Płatność zakończona sukcesem",
                    }),
                  });


            if (paymentResult.success && paymentResult.redirectUrl) {
              // Przekieruj do bramki płatności
              window.location.href = paymentResult.redirectUrl;
              return;
            } else if (paymentResult.success) {
                // Aktualizuj status zamówienia na failed
                await fetch(`/api/wordpress/orders/${order.id}/payment-status`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    status: "failed",
                    paymentMethod: "Planet Pay",
                    note: "Błąd podczas przetwarzania płatności",
                  }),
                });

              // Płatność zakończona sukcesem
              clearLocalCart();
              clearWCCart();
              setOrderSuccess(true);
              return;
            }
          } catch (error) {
            console.error("Payment processing error:", error);
            setOrderError(
            // Aktualizuj status zamówienia dla płatności przy odbiorze
            if (formData.payment_method === "planetpay_cod") {
              await fetch(`/api/wordpress/orders/${order.id}/payment-status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "processing",
                  paymentMethod: "Płatność przy odbiorze",
                  note: "Zamówienie z płatnością przy odbiorze",
                }),
              });
            }

              "Błąd podczas przetwarzania płatności. Zamówienie zostało złożone, ale płatność wymaga ręcznego przetworzenia."
            );
          }
        }

        // Jeśli dotarliśmy tutaj, oznacza to sukces (np. płatność przy odbiorze)
        clearLocalCart();
        clearWCCart();
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      setOrderError(
        "Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const createBLPaczkaShipment = async (
    order: any,
    deliveryPoint: DeliveryPoint | null
  ) => {
    try {
      const shipmentData = {
        courierSearch: {
          courier_code: formData.blpaczka_courier,
          type: "package",
          weight: 0.5, // Domyślna waga dla podkładów
          side_x: 30,
          side_y: 20,
          side_z: 5,
          postal_sender: formData.billing.postcode.replace(/\D/g, ""),
          postal_delivery: formData.billing.postcode.replace(/\D/g, ""),
          foreign: "local",
        },
        cartOrder: {
          payment: "bank", // Domyślnie bank, można dostosować
        },
        cart: [
          {
            Order: {
              name: `${formData.billing.first_name} ${formData.billing.last_name}`,
              email: formData.billing.email,
              phone: formData.billing.phone,
              street: formData.billing.address_1,
              house_no: formData.billing.address_2 || "",
              postal: formData.billing.postcode,
              city: formData.billing.city,
              account: "", // Można dodać numer konta jeśli potrzebny
              taker_name: `${formData.billing.first_name} ${formData.billing.last_name}`,
              taker_email: formData.billing.email,
              taker_phone: formData.billing.phone,
              taker_street: formData.billing.address_1,
              taker_house_no: formData.billing.address_2 || "",
              taker_postal: formData.billing.postcode,
              taker_city: formData.billing.city,
              taker_point: deliveryPoint?.point_id || "",
              package_content: "Podkłady higieniczne dla psów",
              ref_number: order.id.toString(),
            },
          },
        ],
      };

      const response = await fetch("/api/blpaczka/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to create BLPaczka shipment");
      }

      const result = await response.json();
      console.log("BLPaczka shipment created:", result);
      return result;
    } catch (error) {
      console.error("Error creating BLPaczka shipment:", error);
      throw error;
    }
  };

  const processPlanetPayPayment = async (order: any) => {
    try {
      const paymentMethod = formData.payment_method
        .replace("planetpay_", "")
        .toUpperCase();

      const paymentRequest = {
        device: {
          browserData: {
            javascriptEnabled: true,
            language: navigator.language || "pl-PL",
            colorDepth: "24",
            screenHeight: window.screen.height,
            screenWidth: window.screen.width,
            timezone: new Date().getTimezoneOffset(),
          },
        },
        channel: "PAYWALL" as const,
        method: paymentMethod as any,
        merchant: {
          merchantId: process.env.NEXT_PUBLIC_PLANET_PAY_MERCHANT_ID!,
          name: "Padii",
          url: window.location.origin,
          redirectURL: `${window.location.origin}/order-received/${order.id}`,
          location: {
            street: "ul. Prosta 21",
            postal: "05-825",
            city: "Szczęsne",
            country: "POL",
          },
        },
        customer: {
          email: formData.billing.email,
          name: `${formData.billing.first_name} ${formData.billing.last_name}`,
          firstName: formData.billing.first_name,
          lastName: formData.billing.last_name,
          billing: {
            street: formData.billing.address_1,
            postal: formData.billing.postcode,
            city: formData.billing.city,
            country: formData.billing.country,
          },
          phone: {
            countryCode:
              formData.billing.phone.match(/^\+?(\d{1,3})/)?.[1] || "",
            phoneNo: formData.billing.phone
              .replace(/^\+\d{1,3}\s*/, "")
              .replace(/\s+/g, ""),
          },
        },
        order: {
          amount: Math.round(calculateTotal()), // Planet Pay wymaga kwoty w groszach
          currency: "PLN",
          extOrderId: order.id.toString(),
          description: `Zamówienie #${order.id} - Padii.pl`,
          shipping: {
            street: formData.billing.address_1,
            city: formData.billing.city,
            postal: formData.billing.postcode,
            country: "POL",
          },
        },
        options: {
          validTime: 1800, // 30 minut na płatność
          language: "pl",
          // asyncNotify: `http://localhost:3000/api/planetpay/webhook`,
        },
      };

      // Dodaj instrument dla BLIK jeśli potrzebny
      // if (paymentMethod === "BLIK" && formData.instrument?.code) {
      //   paymentRequest.instrument = {
      //     type: "BLIK_CODE",
      //     code: formData.instrument.code,
      //   };
      // }

      const createResponse = await fetch("/api/planetpay/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Payment processing failed");
      }

      const createData = await createResponse.json();

      if (createData.status === "COMPLETED") {
        // Aktualizuj status zamówienia na "processing"
        await updateOrderStatus(
          order.id,
          "processing",
          "Płatność zakończona sukcesem"
        );
        return { success: true };
      } else if (createData.redirectURL) {
        // Zapisz payment ID w localStorage dla późniejszej weryfikacji
        localStorage.setItem(`payment_${order.id}`, createData.paymentId);
        return { success: true, redirectUrl: createData.redirectURL };
      } else if (
        createData.status === "NEW" ||
        createData.status === "PENDING"
      ) {
        // Aktualizuj status zamówienia na "pending"
        await updateOrderStatus(
          order.id,
          "pending",
          "Płatność w trakcie przetwarzania"
        );
        return { success: true };
      } else {
        throw new Error("Płatność odrzucona lub nieprawidłowa");
      }
    } catch (error) {
      console.error("Planet Pay payment error:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: string,
    note?: string
  ) => {
    try {
      const response = await fetch("/api/wordpress/update-order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
          note,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getPaymentMethodTitle = (method: string) => {
    if (method.startsWith("planetpay_")) {
      const methodType = method.split("_")[1];
      switch (methodType) {
        case "card":
          return "Karta płatnicza (PlanetPay)";
        case "blik":
          return "BLIK (PlanetPay)";
        case "pbl":
          return "Przelew bankowy (PlanetPay)";
        default:
          return "PlanetPay";
      }
    }
    return "PlanetPay";
  };

  const getShippingMethodTitle = (method: string) => {
    const shippingMethod = shippingManager
      .getShippingMethods()
      .find((m) => m.id === method);
    if (shippingMethod) {
      return shippingMethod.name;
    }

    switch (method) {
      case "paczkomaty":
        return "Paczkomat InPost";
      case "orlen":
        return "Orlen Paczka";
      case "dhl":
        return "DHL";
      case "dpd":
        return "DPD";
      default:
        return "BLPaczka";
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Zamówienie złożone!</h1>
            <p className="text-muted-foreground mb-8">
              Dziękujemy za zakupy. Zamówienie zostało przyjęte do realizacji.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/products")}
                className="w-full"
              >
                Kontynuuj zakupy
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Powrót do strony głównej
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCart = wcCart || localCart;
  const currentCartItems = getCurrentCartItems();

  if (currentCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Koszyk jest pusty</h1>
            <p className="text-muted-foreground mb-8">
              Dodaj produkty do koszyka, aby przejść do kasy
            </p>
            <Button onClick={() => router.push("/products")} size="lg">
              Przeglądaj produkty
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kasa</h1>
          <p className="text-muted-foreground">Dokończ swoje zamówienie</p>
        </div>

        {orderError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {orderError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Adres rozliczeniowy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Imię *</Label>
                      <Input
                        id="first_name"
                        value={formData.billing.first_name}
                        onChange={(e) =>
                          handleInputChange(
                            "billing.first_name",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nazwisko *</Label>
                      <Input
                        id="last_name"
                        value={formData.billing.last_name}
                        onChange={(e) =>
                          handleInputChange("billing.last_name", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Firma (opcjonalnie)</Label>
                    <Input
                      id="company"
                      value={formData.billing.company || ""}
                      onChange={(e) =>
                        handleInputChange("billing.company", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.billing.email}
                        onChange={(e) =>
                          handleInputChange("billing.email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        value={formData.billing.phone}
                        onChange={(e) =>
                          handleInputChange("billing.phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address_1">Adres *</Label>
                    <Input
                      id="address_1"
                      value={formData.billing.address_1}
                      onChange={(e) =>
                        handleInputChange("billing.address_1", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_2">Adres 2 (opcjonalnie)</Label>
                    <Input
                      id="address_2"
                      value={formData.billing.address_2 || ""}
                      onChange={(e) =>
                        handleInputChange("billing.address_2", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Miasto *</Label>
                      <Input
                        id="city"
                        value={formData.billing.city}
                        onChange={(e) =>
                          handleInputChange("billing.city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode">Kod pocztowy *</Label>
                      <Input
                        id="postcode"
                        value={formData.billing.postcode}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/[^\d-]/g, "");
                          if (value.length > 2 && !value.includes("-")) {
                            value = `${value.slice(0, 2)}-${value.slice(2, 5)}`;
                          }
                          handleInputChange("billing.postcode", value);
                        }}
                        required
                        maxLength={6}
                        placeholder="00-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Kraj *</Label>
                      <Select
                        value={formData.billing.country}
                        onValueChange={(value) =>
                          handleInputChange("billing.country", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kraj" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POL">Polska</SelectItem>
                          <SelectItem value="DEU">Niemcy</SelectItem>
                          <SelectItem value="CZE">Czechy</SelectItem>
                          <SelectItem value="SVK">Słowacja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Adres dostawy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="shipping-to-billing"
                      checked={shippingToBilling}
                      onCheckedChange={(checked) =>
                        setShippingToBilling(checked === true)
                      }
                    />
                    <Label htmlFor="shipping-to-billing">
                      Dostawa na adres rozliczeniowy
                    </Label>
                  </div>
                  {!shippingToBilling && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Formularz adresu dostawy będzie tutaj
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Metoda dostawy (BLPaczka)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.billing.postcode.replace(/\D/g, "").length === 5 ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Kurier</Label>
                        <Select
                          value={selectedCourier}
                          onValueChange={(value) => {
                            setSelectedCourier(value);
                            handleInputChange("blpaczka_courier", value);
                            handleInputChange("shipping_method", value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz kuriera" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dhl">DHL</SelectItem>
                            <SelectItem value="inpost">
                              Paczkomat InPost
                            </SelectItem>
                            <SelectItem value="orlen">Orlen Paczka</SelectItem>
                            <SelectItem value="dpd">DPD</SelectItem>
                            <SelectItem value="inpost_international">
                              InPost International
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mt-4">
                        <Label>Wybierz punkt dostawy na mapie</Label>
                        <div className="rounded-lg overflow-hidden border">
                          <iframe
                            id="pudoMap"
                            src={`${
                              process.env.NEXT_PUBLIC_BL_API_URL
                            }/pudo-map?api_type=${selectedCourier}&postalCode=${formData.billing.postcode.replace(
                              /\D/g,
                              ""
                            )}`}
                            width="100%"
                            height="500"
                          ></iframe>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Wybrany punkt odbioru</Label>
                        {selectedPoint ? (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium">
                                  {selectedPoint.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedPoint.address}, {selectedPoint.city}
                                </p>
                                <p className="text-xs mt-1">
                                  <span className="font-medium">
                                    Godziny otwarcia:
                                  </span>{" "}
                                  {selectedPoint.opening_hours}
                                </p>
                                <p className="text-xs mt-1">
                                  <span className="font-medium">Kurier:</span>{" "}
                                  {getShippingMethodTitle(
                                    selectedPoint.courier_code
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Wybierz punkt na mapie powyżej
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Wprowadź kod pocztowy w formacie 00-000
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metoda płatności (PlanetPay)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPaymentMethods ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Ładowanie metod płatności...</span>
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <RadioGroup
                      value={formData.payment_method}
                      onValueChange={(value) =>
                        handleInputChange("payment_method", value)
                      }
                    >
                      <div className="space-y-3">
                        {paymentMethods
                          .map((method) => (
                            <div
                              key={`planetpay_${method.method}`}
                              className="flex items-center space-x-2 p-3 border rounded-lg"
                            >
                              <RadioGroupItem
                                value={`planetpay_${method.method.toLowerCase()}`}
                                id={`planetpay_${method.method}`}
                              />
                              <Label
                                htmlFor={`planetpay_${method.method}`}
                                className="flex-1"
                              >
                                <div className="font-medium">
                                  {method.method === "CARD"
                                    ? "Karta płatnicza"
                                    : method.method === "BLIK"
                                    ? "BLIK"
                                    : method.method === "GPAY"
                                    ? "Google Pay"
                                    : method.method === "APAY"
                                    ? "Apple Pay"
                                    : method.method === "PBL"
                                    ? "Przelew bankowy"
                                    : method.method}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {method.method === "CARD"
                                    ? "Visa, Mastercard"
                                    : method.method === "BLIK"
                                    ? "Szybka płatność mobilna"
                                    : method.method === "GPAY"
                                    ? "Google Pay"
                                    : method.method === "PBL"
                                    ? "Przelew online"
                                    : ""}
                                </div>
                              </Label>
                            </div>
                          ))
                          .filter((item) => item.props.status !== "ENABLED")}

                        {/* BLIK Code Input */}
                        {/* {formData.payment_method === "planetpay_blik" && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-medium text-blue-900">
                                Kod BLIK
                              </span>
                            </div>
                            <Input
                              id="blik-code"
                              placeholder="Wprowadź 6-cyfrowy kod BLIK"
                              maxLength={6}
                              className="text-center text-lg tracking-widest font-mono"
                              value={formData.instrument?.code || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "instrument.code",
                                  e.target.value
                                )
                              }
                            />
                            <p className="text-sm text-blue-700 mt-2">
                              Wygeneruj kod w aplikacji bankowej i wprowadź go
                              powyżej
                            </p>
                          </div>
                        )} */}
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="text-muted-foreground">
                      Brak dostępnych metod płatności
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uwagi do zamówienia</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Dodatkowe informacje (opcjonalnie)"
                    value={formData.customer_note || ""}
                    onChange={(e) =>
                      handleInputChange("customer_note", e.target.value)
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Podsumowanie zamówienia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {currentCartItems.map((item) => (
                      <div
                        key={wcCart ? item.key : `${item.product.id}-${item.variationId || ""}`}
                        className="flex gap-3"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={
                              (wcCart ? item.images[0]?.src : item.product.images[0]?.src) ||
                              "/placeholder-product.jpg"
                            }
                            alt={wcCart ? item.name : item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {wcCart ? (
                              item.name
                            ) : (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: item.product.name,
                                }}
                              />
                            )}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">
                              Ilość: {item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              {formatPrice(
                                wcCart 
                                  ? parseFloat(item.totals.line_total) / Math.pow(10, wcCart.totals.currency_minor_unit)
                                  : parseFloat(item.product.sale_price || item.product.regular_price || "0") * item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Kod kuponu"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={validateCoupon}
                        disabled={isValidatingCoupon}
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Zastosuj"
                        )}
                      </Button>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Rabat ({couponCode})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Produkty</span>
                      <span>{formatPrice(getCurrentCartTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dostawa (BLPaczka)</span>
                      <span>{formatPrice(calculateShipping())}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Rabat</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Razem</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      isSubmitting ||
                      (formData.shipping_method !== "blpaczka" &&
                        !formData.delivery_point)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Składanie zamówienia...
                      </>
                    ) : (
                      "Złóż zamówienie"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Klikając Złóż zamówienie akceptujesz naszą&nbsp;
                    <Link className="hover:underline" href="/privacy-policy">
                      politykę prywatności
                    </Link>
                    &nbsp;oraz&nbsp;
                    <Link className="hover:underline" href="/terms">
                      warunki sprzedaży.
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}