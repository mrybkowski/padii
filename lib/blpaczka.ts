// lib/blpaczka.ts
import { NextRequest, NextResponse } from "next/server";

export type DeliveryPoint = {
  description: string;
  opening_hours: string;
  courier_code: string;
  point_id: string;
  address: string;
  city: string;
  postal_code: string;
};

const BL_API_URL = process.env.NEXT_PUBLIC_BL_API_URL || "";
const BL_LOGIN = process.env.NEXT_PUBLIC_BL_LOGIN || "";
const BL_API_KEY = process.env.NEXT_PUBLIC_BL_API_KEY || "";

async function blFetch(endpoint: string, data: any) {
  const payload = {
    ...data,
    auth: {
      login: BL_LOGIN,
      api_key: BL_API_KEY,
    },
  };

  const response = await fetch(`${BL_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`BLPaczka API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Endpoint dla kurierów
export async function getCouriersHandler(req: NextRequest) {
  try {
    const data = await blFetch("/api/couriers", {});
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla punktów PUDO
export async function getPudoPointsHandler(req: NextRequest) {
  try {
    const { postalCode, courierCode } = await req.json();
    const data = await blFetch("/api/getPudoPoints.json", {
      PudoPoint: {
        postal_code: postalCode,
        courier_code: courierCode,
      },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla wyceny przesyłki
export async function getValuationHandler(req: NextRequest) {
  try {
    const params = await req.json();
    const data = await blFetch("/api/getValuation.json", {
      CourierSearch: {
        courier_code: params.courierCode,
        type: params.type,
        weight: params.weight,
        side_x: params.sideX,
        side_y: params.sideY,
        side_z: params.sideZ,
        postal_sender: params.postalSender,
        postal_delivery: params.postalDelivery,
        uptake: params.uptake,
        cover: params.cover,
        foreign: "local",
      },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla tworzenia zamówienia
export async function createOrderHandler(req: NextRequest) {
  try {
    const orderData = await req.json();
    const data = await blFetch("/api/createOrderV2.json", {
      CourierSearch: orderData.courierSearch,
      CartOrder: orderData.cartOrder,
      Cart: orderData.cart,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla śledzenia przesyłki
export async function trackPackageHandler(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const data = await blFetch("/api/getWaybillTracking.json", {
      Order: { id: orderId },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla szczegółów zamówienia
export async function getOrderDetailsHandler(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const data = await blFetch("/api/getOrderDetails.json", {
      Order: [{ id: orderId }],
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla anulowania zamówienia
export async function cancelOrderHandler(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const data = await blFetch("/api/cancelOrder.json", {
      Order: { id: orderId },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla opcji płatności
export async function getPaymentOptionsHandler(req: NextRequest) {
  try {
    const { cartSum } = await req.json();
    const data = await blFetch("/api/getPaymentOptions.json", {
      cart_sum: cartSum,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla opcji odbioru
export async function getPickupDateOptionsHandler() {
  try {
    const data = await blFetch("/api/getPickupDateOptions.json", {});
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla salda bankowego
export async function getBankBalanceHandler() {
  try {
    const data = await blFetch("/api/getBankSaldo.json", {});
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla danych profilu
export async function getProfileHandler() {
  try {
    const data = await blFetch("/api/getProfile.json", {});
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint dla krajów
export async function getCountriesHandler() {
  try {
    const data = await blFetch("/api/getCountriesOptions.json", {});
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
