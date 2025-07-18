"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Star,
  Search,
  Navigation,
} from "lucide-react";
import { shippingManager, ParcelLocker } from "@/lib/shipping";

interface ShippingMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  cartValue: number;
  selectedLocker?: ParcelLocker;
  onLockerChange?: (locker: ParcelLocker | undefined) => void;
}

export function ShippingMethods({
  selectedMethod,
  onMethodChange,
  cartValue,
  selectedLocker,
  onLockerChange,
}: ShippingMethodsProps) {
  const [lockers, setLockers] = useState<ParcelLocker[]>([]);
  const [lockerSearch, setLockerSearch] = useState("");
  const [showLockerMap, setShowLockerMap] = useState(false);
  const methods = shippingManager.getShippingMethods();

  useEffect(() => {
    if (selectedMethod.includes("locker") || selectedMethod.includes("point")) {
      loadLockers();
    }
  }, [selectedMethod]);

  const loadLockers = async () => {
    try {
      const provider = selectedMethod.includes("inpost") ? "inpost" : "orlen";
      const lockersData = await shippingManager.getParcelLockers(
        "Warszawa",
        provider
      );
      setLockers(lockersData);
    } catch (error) {
      console.error("Error loading lockers:", error);
    }
  };

  const getMethodIcon = (methodId: string) => {
    if (methodId.includes("locker") || methodId.includes("point")) {
      return <Package className="h-5 w-5" />;
    }
    return <Truck className="h-5 w-5" />;
  };

  const calculateShippingCost = (methodId: string) => {
    const method = methods.find((m) => m.id === methodId);
    if (!method) return 0;

    // Darmowa dostawa od 200 zł (oprócz ekspresowych)
    if (
      cartValue >= 200 &&
      !methodId.includes("express") &&
      !methodId.includes("fedex")
    ) {
      return 0;
    }

    return method.price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const filteredLockers = lockers.filter(
    (locker) =>
      locker.name.toLowerCase().includes(lockerSearch.toLowerCase()) ||
      locker.address.toLowerCase().includes(lockerSearch.toLowerCase())
  );

  const needsLockerSelection =
    selectedMethod.includes("locker") || selectedMethod.includes("point");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Metoda dostawy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="space-y-3">
            {methods.map((method) => {
              const cost = calculateShippingCost(method.id);
              const isFree = cost === 0 && cartValue >= 200;

              return (
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          <span className="text-2xl">
                            {method.provider === "inpost" && "📦"}
                            {method.provider === "orlen" && "⛽"}
                            {method.provider === "dpd" && "🚚"}
                            {method.provider === "ups" && "📋"}
                            {method.provider === "fedex" && "✈️"}
                            {method.provider === "poczta" && "📮"}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {method.features.slice(0, 3).map((feature, index) => (
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
                      <div className="font-medium">
                        {isFree ? (
                          <span className="text-green-600">Darmowa</span>
                        ) : (
                          formatPrice(cost)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.estimatedDays}
                      </div>
                      {isFree && (
                        <div className="text-xs text-green-600 mt-1">
                          🎉 Darmowa dostawa!
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {/* Free Shipping Info */}
        {cartValue < 200 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              💡 Dodaj produkty za{" "}
              <strong>{formatPrice(200 - cartValue)}</strong> aby otrzymać
              darmową dostawę!
            </div>
          </div>
        )}

        {/* Locker Selection */}
        {needsLockerSelection && (
          <div className="mt-6 space-y-4">
            <Separator />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">
                Wybierz{" "}
                {selectedMethod.includes("inpost") ? "paczkomat" : "punkt"}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po adresie lub nazwie..."
                value={lockerSearch}
                onChange={(e) => setLockerSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Locker */}
            {selectedLocker && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-900">
                      {selectedLocker.name}
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedLocker.address}, {selectedLocker.city}
                    </div>
                    {selectedLocker.available24h && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        24/7
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLockerChange?.(undefined)}
                  >
                    Zmień
                  </Button>
                </div>
              </div>
            )}

            {/* Locker List */}
            {!selectedLocker && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredLockers.map((locker) => (
                  <div
                    key={locker.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onLockerChange?.(locker)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{locker.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {locker.address}, {locker.city}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {locker.available24h && (
                            <Badge variant="outline" className="text-xs">
                              24/7
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {locker.provider === "inpost"
                              ? "InPost"
                              : "Orlen Paczka"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          4.8
                        </div>
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLockers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Brak punktów w wybranej lokalizacji</p>
                  </div>
                )}
              </div>
            )}

            {/* Map Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowLockerMap(!showLockerMap)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {showLockerMap ? "Ukryj mapę" : "Pokaż na mapie"}
            </Button>
          </div>
        )}

        <Separator className="my-6" />

        {/* Delivery Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Wysyłka w ciągu 24h od potwierdzenia płatności</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Bezpieczne pakowanie i ubezpieczenie przesyłki</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Śledzenie przesyłki SMS i email</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}