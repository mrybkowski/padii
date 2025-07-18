"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Globe,
  Banknote,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import { paymentManager } from "@/lib/payments";

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  amount: number;
}

export function PaymentMethods({
  selectedMethod,
  onMethodChange,
  amount,
}: PaymentMethodsProps) {
  const [blikCode, setBlikCode] = useState("");
  const methods = paymentManager.getPaymentMethods();

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "blik":
        return <Smartphone className="h-5 w-5" />;
      case "p24":
        return <Building2 className="h-5 w-5" />;
      case "payu":
        return <Wallet className="h-5 w-5" />;
      case "paypal":
        return <Globe className="h-5 w-5" />;
      case "transfer":
        return <Banknote className="h-5 w-5" />;
      case "cod":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodFeatures = (methodId: string) => {
    switch (methodId) {
      case "card":
        return ["Natychmiastowa płatność", "Bezpieczne", "Wszystkie karty"];
      case "blik":
        return ["6-cyfrowy kod", "Aplikacja bankowa", "Natychmiast"];
      case "p24":
        return ["Polskie banki", "Bezpieczne", "Popularne"];
      case "payu":
        return ["Szybkie płatności", "Wiele opcji", "Zaufane"];
      case "paypal":
        return ["Międzynarodowe", "Konto PayPal", "Bezpieczne"];
      case "transfer":
        return ["Tradycyjny", "Bez opłat", "2-3 dni"];
      case "cod":
        return ["Gotówka", "Przy odbiorze", "Bez ryzyka"];
      default:
        return [];
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Metoda płatności
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getMethodIcon(method.id)}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.description}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {getMethodFeatures(method.id)
                          .slice(0, 2)
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {method.id === "cod" && (
                      <div className="text-sm text-muted-foreground">
                        +5 zł opłata
                      </div>
                    )}
                    {method.id === "transfer" && (
                      <div className="text-sm text-green-600">Darmowe</div>
                    )}
                    {["card", "blik", "p24", "payu", "paypal"].includes(
                      method.id
                    ) && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Clock className="h-3 w-3" />
                        Natychmiast
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* BLIK Code Input */}
        {selectedMethod === "blik" && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Kod BLIK</span>
            </div>
            <Input
              placeholder="Wprowadź 6-cyfrowy kod BLIK"
              value={blikCode}
              onChange={(e) => setBlikCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
            />
            <p className="text-sm text-blue-700 mt-2">
              Wygeneruj kod w aplikacji bankowej i wprowadź go powyżej
            </p>
          </div>
        )}

        {/* Transfer Instructions */}
        {selectedMethod === "transfer" && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-900">
                Dane do przelewu
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odbiorca:</span>
                <span className="font-medium">Padii.pl - Jove Sp. z o.o.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numer konta:</span>
                <span className="font-mono">12 3456 7890 1234 5678 9012 3456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kwota:</span>
                <span className="font-medium">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tytuł:</span>
                <span className="font-medium">Zamówienie #{Date.now()}</span>
              </div>
            </div>
            <p className="text-sm text-amber-700 mt-3">
              Zamówienie zostanie zrealizowane po zaksięgowaniu płatności (2-3
              dni robocze)
            </p>
          </div>
        )}

        {/* COD Info */}
        {selectedMethod === "cod" && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">
                Płatność przy odbiorze
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Zapłać kurierowi gotówką</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Dodatkowa opłata: 5 zł</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Brak ryzyka płatności online</span>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-3">
              Przygotuj dokładną kwotę: {formatPrice(amount + 5)}
            </p>
          </div>
        )}

        <Separator className="my-6" />

        {/* Security Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>
            Wszystkie płatności są zabezpieczone certyfikatem SSL i chronione
            przez najnowsze systemy bezpieczeństwa
          </span>
        </div>
      </CardContent>
    </Card>
  );
}