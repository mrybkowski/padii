"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package,
  CreditCard,
  Truck,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface OrderDetails {
  id: number;
  number: string;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string;
  date_paid: string;
  cart_hash: string;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
    sku: string;
    price: number;
  }>;
  tax_lines: any[];
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
  }>;
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
}

interface OrderNote {
  id: number;
  date_created: string;
  note: string;
  customer_note: boolean;
  added_by_user: boolean;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const orderId = params.id as string;
        
        const [orderResponse, notesResponse] = await Promise.all([
          fetch(`/api/wordpress/orders/${orderId}`),
          fetch(`/api/wordpress/orders/${orderId}/notes`),
        ]);

        if (!orderResponse.ok) {
          throw new Error("Failed to fetch order details");
        }

        const orderData = await orderResponse.json();
        setOrder(orderData);
        setNewStatus(orderData.status);

        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData);
        }
      } catch (error: any) {
        console.error("Error loading order details:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadOrderDetails();
    }
  }, [params.id]);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      case "on-hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
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

  const updateOrderStatus = async () => {
    if (!order || newStatus === order.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/wordpress/orders/${order.id}/payment-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          note: `Status zamówienia zmieniony z "${getStatusLabel(order.status)}" na "${getStatusLabel(newStatus)}"`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const result = await response.json();
      setOrder({ ...order, status: newStatus });
      
      // Odśwież notatki
      const notesResponse = await fetch(`/api/wordpress/orders/${order.id}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData);
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const addOrderNote = async () => {
    if (!order || !newNote.trim()) return;

    try {
      const response = await fetch(`/api/wordpress/orders/${order.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: newNote,
          customerNote: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add order note");
      }

      setNewNote("");
      
      // Odśwież notatki
      const notesResponse = await fetch(`/api/wordpress/orders/${order.id}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData);
      }
    } catch (error: any) {
      console.error("Error adding order note:", error);
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Błąd</h1>
          <p className="text-muted-foreground mb-8">
            {error || "Nie znaleziono zamówienia"}
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do strony głównej
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót
            </Button>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <h1 className="text-3xl font-bold">Zamówienie #{order.number}</h1>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Złożone {formatDate(order.date_created)} • Ostatnia modyfikacja {formatDate(order.date_modified)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produkty ({order.line_items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.line_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.sku && (
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Ilość: {item.quantity} × {formatPrice(item.price.toString())}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(item.total)}</div>
                        {parseFloat(item.total_tax) > 0 && (
                          <div className="text-sm text-muted-foreground">
                            +{formatPrice(item.total_tax)} VAT
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Produkty:</span>
                    <span>{formatPrice((parseFloat(order.total) - parseFloat(order.shipping_total) - parseFloat(order.total_tax)).toString())}</span>
                  </div>
                  {parseFloat(order.shipping_total) > 0 && (
                    <div className="flex justify-between">
                      <span>Dostawa:</span>
                      <span>{formatPrice(order.shipping_total)}</span>
                    </div>
                  )}
                  {parseFloat(order.total_tax) > 0 && (
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span>{formatPrice(order.total_tax)}</span>
                    </div>
                  )}
                  {parseFloat(order.discount_total) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Rabat:</span>
                      <span>-{formatPrice(order.discount_total)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Razem:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Adres rozliczeniowy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">
                    {order.billing.first_name} {order.billing.last_name}
                  </div>
                  {order.billing.company && (
                    <div className="text-muted-foreground">{order.billing.company}</div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div>{order.billing.address_1}</div>
                      {order.billing.address_2 && <div>{order.billing.address_2}</div>}
                      <div>{order.billing.postcode} {order.billing.city}</div>
                      <div>{order.billing.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${order.billing.email}`} className="text-primary hover:underline">
                      {order.billing.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${order.billing.phone}`} className="text-primary hover:underline">
                      {order.billing.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Adres dostawy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">
                    {order.shipping.first_name} {order.shipping.last_name}
                  </div>
                  {order.shipping.company && (
                    <div className="text-muted-foreground">{order.shipping.company}</div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div>{order.shipping.address_1}</div>
                      {order.shipping.address_2 && <div>{order.shipping.address_2}</div>}
                      <div>{order.shipping.postcode} {order.shipping.city}</div>
                      <div>{order.shipping.country}</div>
                    </div>
                  </div>
                  {order.shipping_lines.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="font-medium text-sm">Metoda dostawy:</div>
                      <div className="text-sm text-muted-foreground">
                        {order.shipping_lines[0].method_title} - {formatPrice(order.shipping_lines[0].total)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notatki zamówienia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-2">
                  <Label htmlFor="new-note">Dodaj notatkę</Label>
                  <Textarea
                    id="new-note"
                    placeholder="Wprowadź notatkę..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={addOrderNote} disabled={!newNote.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj notatkę
                  </Button>
                </div>

                <Separator />

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Brak notatek dla tego zamówienia
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={note.customer_note ? "default" : "secondary"}>
                            {note.customer_note ? "Dla klienta" : "Wewnętrzna"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.date_created)}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Akcje zamówienia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Status zamówienia</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Oczekujące</SelectItem>
                      <SelectItem value="processing">W realizacji</SelectItem>
                      <SelectItem value="on-hold">Wstrzymane</SelectItem>
                      <SelectItem value="completed">Zakończone</SelectItem>
                      <SelectItem value="cancelled">Anulowane</SelectItem>
                      <SelectItem value="refunded">Zwrócone</SelectItem>
                      <SelectItem value="failed">Nieudane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={newStatus === order.status || isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Aktualizowanie...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Aktualizuj status
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Potwierdź zmianę statusu</AlertDialogTitle>
                      <AlertDialogDescription>
                        Czy na pewno chcesz zmienić status zamówienia z "{getStatusLabel(order.status)}" na "{getStatusLabel(newStatus)}"?
                        Ta akcja zostanie zapisana w historii zamówienia.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction onClick={updateOrderStatus}>
                        Potwierdź
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Szczegóły płatności
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metoda:</span>
                  <span className="font-medium">{order.payment_method_title}</span>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID transakcji:</span>
                    <span className="font-mono text-sm">{order.transaction_id}</span>
                  </div>
                )}
                {order.date_paid && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data płatności:</span>
                    <span>{formatDate(order.date_paid)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kwota:</span>
                  <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informacje o zamówieniu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID zamówienia:</span>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numer zamówienia:</span>
                  <span className="font-medium">#{order.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data utworzenia:</span>
                  <span>{formatDate(order.date_created)}</span>
                </div>
                {order.date_completed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data zakończenia:</span>
                    <span>{formatDate(order.date_completed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Źródło:</span>
                  <span>{order.created_via}</span>
                </div>
                {order.customer_note && (
                  <div>
                    <span className="text-muted-foreground">Notatka klienta:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{order.customer_note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}