"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  CreditCard,
  Truck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface OrderDetails {
  id: number;
  status: string;
  total: string;
  payment_method_title: string;
  shipping_method: string;
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
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: string;
  }>;
  date_created: string;
}

export default function OrderReceivedPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("checking");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = params.id as string;
    if (!orderId) return;

    const checkPaymentAndOrder = async () => {
      try {
        // Sprawdź status płatności Planet Pay jeśli jest paymentId w URL
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get("paymentId");

        // Lub sprawdź w localStorage
        const storedPaymentId = localStorage.getItem(`payment_${orderId}`);
        const finalPaymentId = paymentId || storedPaymentId;

        if (finalPaymentId) {
          const paymentResponse = await fetch(
            `/api/planetpay/payment/${finalPaymentId}/status`
          );

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            setPaymentStatus(paymentData.status);

            // Aktualizuj status zamówienia w WordPress na podstawie statusu płatności
            if (paymentData.status === "COMPLETED") {
              await fetch("/api/wordpress/update-order-status", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: parseInt(orderId),
                  status: "processing",
                  note: `Płatność zakończona sukcesem. Payment ID: ${finalPaymentId}`,
                }),
              });
            } else if (paymentData.status === "PENDING") {
              await fetch(`/api/wordpress/orders/${orderId}/payment-status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "pending",
                  transactionId: finalPaymentId,
                  paymentMethod: "Planet Pay",
                  note: `Płatność w trakcie przetwarzania. Payment ID: ${finalPaymentId}`,
                }),
              });
            } else if (
              paymentData.status === "REJECTED" ||
              paymentData.status === "CANCELLED"
            ) {
              await fetch(`/api/wordpress/orders/${orderId}/payment-status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: "failed",
                  transactionId: finalPaymentId,
                  paymentMethod: "Planet Pay",
                  note: `Płatność odrzucona lub anulowana. Payment ID: ${finalPaymentId}`,
                }),
              });
            }

            // Usuń payment ID z localStorage po sprawdzeniu
            if (storedPaymentId) {
              localStorage.removeItem(`payment_${orderId}`);
            }
          }
        }

        // Pobierz szczegóły zamówienia z WordPress API
        const orderResponse = await fetch(`/api/wordpress/orders/${orderId}`);

        if (!orderResponse.ok) {
          throw new Error("Nie udało się pobrać zamówienia");
        }

        const orderData = await orderResponse.json();

        // Mapuj dane z WooCommerce na nasz interfejs
        const mappedOrder: OrderDetails = {
          id: orderData.id,
          status: orderData.status,
          total: orderData.total,
          payment_method_title: orderData.payment_method_title,
          shipping_method:
            orderData.shipping_lines[0]?.method_title || "Brak danych",
          billing: {
            first_name: orderData.billing.first_name,
            last_name: orderData.billing.last_name,
            email: orderData.billing.email,
            phone: orderData.billing.phone,
            address_1: orderData.billing.address_1,
            city: orderData.billing.city,
            postcode: orderData.billing.postcode,
            country: orderData.billing.country,
          },
          line_items: orderData.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          date_created: orderData.date_created,
        };

        setOrder(mappedOrder);
      } catch (error) {
        console.error("Error loading order:", error);
        setError("Nie udało się załadować szczegółów zamówienia");
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentAndOrder();
  }, [params.id, paymentStatus]);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(numPrice);
  };

  const getPaymentStatusIcon = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "PENDING":
        return <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />;
      case "REJECTED":
      case "ERROR":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />;
    }
  };

  const getPaymentStatusText = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return "Płatność zakończona sukcesem";
      case "PENDING":
        return "Płatność w trakcie przetwarzania";
      case "REJECTED":
        return "Płatność odrzucona";
      case "ERROR":
        return "Błąd płatności";
      default:
        return "Sprawdzanie statusu płatności...";
    }
  };

  const mapOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Oczekujące",
      processing: "W realizacji",
      "on-hold": "Wstrzymane",
      completed: "Zakończone",
      cancelled: "Anulowane",
      refunded: "Zwrócone",
      failed: "Nieudane",
    };

    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Ładowanie szczegółów zamówienia...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Błąd</h1>
          <p className="text-muted-foreground mb-8">
            {error || "Nie znaleziono zamówienia"}
          </p>
          <Button onClick={() => router.push("/")}>
            Powrót do strony głównej
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Dziękujemy za zamówienie!</h1>
          <p className="text-muted-foreground">
            Zamówienie #{order.id} zostało przyjęte do realizacji
          </p>
        </div>

        {/* Payment Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Status płatności
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getPaymentStatusIcon()}
              <div>
                <div className="font-medium">{getPaymentStatusText()}</div>
                {paymentStatus === "PENDING" && (
                  <div className="text-sm text-muted-foreground">
                    Płatność może potrwać kilka minut
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Szczegóły zamówienia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numer zamówienia:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data zamówienia:</span>
                <span className="font-medium">
                  {new Date(order.date_created).toLocaleDateString("pl-PL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">
                  {mapOrderStatus(order.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metoda płatności:</span>
                <span className="font-medium">
                  {order.payment_method_title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dostawa:</span>
                <span className="font-medium">{order.shipping_method}</span>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Produkty:</h4>
                {order.line_items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Ilość: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">{formatPrice(item.total)}</div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Razem:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Adres dostawy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">
                  {order.billing.first_name} {order.billing.last_name}
                </div>
                <div>{order.billing.address_1}</div>
                <div>
                  {order.billing.postcode} {order.billing.city}
                </div>
                <div>{order.billing.phone}</div>
                <div>{order.billing.email}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Co dalej?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Potwierdzenie email</div>
                <div className="text-sm text-muted-foreground">
                  Wysłaliśmy potwierdzenie zamówienia na Twój adres email
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Przygotowanie zamówienia</div>
                <div className="text-sm text-muted-foreground">
                  Zamówienie zostanie przygotowane w ciągu 24h
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Wysyłka</div>
                <div className="text-sm text-muted-foreground">
                  Otrzymasz numer do śledzenia przesyłki
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={() => router.push("/products")} className="flex-1">
            Kontynuuj zakupy
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            Powrót do strony głównej
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
