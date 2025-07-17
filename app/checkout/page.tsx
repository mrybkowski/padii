"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Header } from "@/components/Header";
import { wordpressAPI } from "@/lib/wordpress";
import Link from "next/link";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [shippingToBilling, setShippingToBilling] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<CheckoutFormData>({
    billing: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address_1: "",
      address_2: "",
      city: "",
      postcode: "",
      country: "PL",
      company: "",
    },
    shipping: {},
    payment_method: "cod",
    shipping_method: "standard",
    customer_note: "",
  });

  // Check if cart is empty and redirect only after component mounts
  useEffect(() => {
    setIsLoading(false);

    // Only redirect if cart is empty and we're not showing success
    if (cart.items.length === 0 && !orderSuccess) {
      const timer = setTimeout(() => {
        router.push("/products");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cart.items.length, orderSuccess, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const calculateShipping = () => {
    if (formData.shipping_method === "express") return 25;
    return cart.total >= 200 ? 0 : 15;
  };

  const calculateTotal = () => {
    const shipping = calculateShipping();
    return cart.total + shipping - couponDiscount;
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
            ? (cart.total * parseFloat(coupon.amount)) / 100
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

  const handleInputChange = (
    section: "billing" | "shipping",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
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

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderData = {
        payment_method: formData.payment_method,
        payment_method_title: getPaymentMethodTitle(formData.payment_method),
        set_paid: false,
        billing: formData.billing,
        shipping: shippingToBilling ? formData.billing : formData.shipping,
        line_items: cart.items.map((item) => ({
          product_id: item.product.id,
          variation_id: item.variationId || 0,
          quantity: item.quantity,
        })),
        shipping_lines: [
          {
            method_id: formData.shipping_method,
            method_title: getShippingMethodTitle(formData.shipping_method),
            total: calculateShipping().toString(),
          },
        ],
        coupon_lines: couponCode
          ? [
              {
                code: couponCode,
                discount: couponDiscount.toString(),
              },
            ]
          : [],
        customer_note: formData.customer_note || "",
        meta_data: [
          {
            key: "_order_total",
            value: calculateTotal().toString(),
          },
        ],
      };

      const order = await wordpressAPI.createOrder(orderData);

      if (order.id) {
        clearCart();
        setOrderSuccess(true);

        // Redirect to payment if needed
        if (order.payment_url && formData.payment_method !== "cod") {
          setTimeout(() => {
            window.location.href = order.payment_url;
          }, 2000);
        }
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

  const getPaymentMethodTitle = (method: string) => {
    switch (method) {
      case "cod":
        return "Płatność przy odbiorze";
      case "bacs":
        return "Przelew bankowy";
      case "stripe":
        return "Karta płatnicza";
      default:
        return "Płatność przy odbiorze";
    }
  };

  const getShippingMethodTitle = (method: string) => {
    switch (method) {
      case "standard":
        return "Dostawa standardowa";
      case "express":
        return "Dostawa ekspresowa";
      default:
        return "Dostawa standardowa";
    }
  };

  // Show loading state
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

  // Show success state
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

  // Show empty cart message
  if (cart.items.length === 0) {
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
            {/* Billing & Shipping Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Billing Address */}
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
                            "billing",
                            "first_name",
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
                          handleInputChange(
                            "billing",
                            "last_name",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Firma (opcjonalnie)</Label>
                    <Input
                      id="company"
                      value={formData.billing.company}
                      onChange={(e) =>
                        handleInputChange("billing", "company", e.target.value)
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
                          handleInputChange("billing", "email", e.target.value)
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
                          handleInputChange("billing", "phone", e.target.value)
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
                        handleInputChange(
                          "billing",
                          "address_1",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_2">Adres 2 (opcjonalnie)</Label>
                    <Input
                      id="address_2"
                      value={formData.billing.address_2}
                      onChange={(e) =>
                        handleInputChange(
                          "billing",
                          "address_2",
                          e.target.value
                        )
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
                          handleInputChange("billing", "city", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="postcode">Kod pocztowy *</Label>
                      <Input
                        id="postcode"
                        value={formData.billing.postcode}
                        onChange={(e) =>
                          handleInputChange(
                            "billing",
                            "postcode",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Kraj *</Label>
                      <Select
                        value={formData.billing.country}
                        onValueChange={(value) =>
                          handleInputChange("billing", "country", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kraj" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PL">Polska</SelectItem>
                          <SelectItem value="DE">Niemcy</SelectItem>
                          <SelectItem value="CZ">Czechy</SelectItem>
                          <SelectItem value="SK">Słowacja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                        Formularz adresu dostawy będzie tutaj (podobny do
                        rozliczeniowego)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Metoda dostawy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.shipping_method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        shipping_method: value,
                      }))
                    }
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              Dostawa standardowa
                            </div>
                            <div className="text-sm text-muted-foreground">
                              3-5 dni roboczych
                            </div>
                          </div>
                          <div className="font-medium">
                            {cart.total >= 200 ? "Darmowa" : formatPrice(15)}
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              Dostawa ekspresowa
                            </div>
                            <div className="text-sm text-muted-foreground">
                              1-2 dni robocze
                            </div>
                          </div>
                          <div className="font-medium">{formatPrice(25)}</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metoda płatności
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: value,
                      }))
                    }
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1">
                        <div className="font-medium">
                          Płatność przy odbiorze
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Zapłać gotówką kurierowi
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="bacs" id="bacs" />
                      <Label htmlFor="bacs" className="flex-1">
                        <div className="font-medium">Przelew bankowy</div>
                        <div className="text-sm text-muted-foreground">
                          Tradycyjny przelew na konto
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex-1">
                        <div className="font-medium">Karta płatnicza</div>
                        <div className="text-sm text-muted-foreground">
                          Visa, Mastercard, BLIK
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Uwagi do zamówienia</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Dodatkowe informacje o zamówieniu (opcjonalnie)"
                    value={formData.customer_note}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customer_note: e.target.value,
                      }))
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Podsumowanie zamówienia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.variationId || ""}`}
                        className="flex gap-3"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0]?.src ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {item.product.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">
                              Ilość: {item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              {formatPrice(
                                parseFloat(
                                  item.product.sale_price ||
                                    item.product.regular_price ||
                                    "0"
                                ) * item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon */}
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

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Produkty</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dostawa</span>
                      <span>
                        {calculateShipping() === 0
                          ? "Darmowa"
                          : formatPrice(calculateShipping())}
                      </span>
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
                    disabled={isSubmitting}
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
