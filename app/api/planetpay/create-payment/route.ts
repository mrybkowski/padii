import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const AUTH_URL = "https://api.sandbox.planetpay.pl/v1/ecommerce/auth";
const PAYMENT_URL = "https://api.sandbox.planetpay.pl/v1/ecommerce/payment";

const MERCHANT_SECRET = process.env.PLANET_PAY_SECRET || "TWÓJ_SECRET";
const MERCHANT_ID =
  process.env.NEXT_PUBLIC_PLANET_PAY_MERCHANT_ID || "TWÓJ_MERCHANT_ID";
const CHANNEL = "WEBAPI";

export async function POST(req: NextRequest) {
  try {
    const paymentRequest = await req.json();

    // 1. Pobierz token JWT
    const authResponse = await axios.post(
      AUTH_URL,
      {
        resource: "PAYMENT",
        channel: CHANNEL,
        secret: MERCHANT_SECRET,
        merchant: { merchantId: MERCHANT_ID },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const token = authResponse.data.access_token;
    if (!token) {
      return NextResponse.json(
        { error: "Brak tokenu w odpowiedzi auth" },
        { status: 500 }
      );
    }

    // 2. Wywołaj endpoint płatności z tokenem w headerze Authorization
    const paymentResponse = await axios.post(PAYMENT_URL, paymentRequest, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(paymentResponse.data, {
      status: paymentResponse.status,
    });
  } catch (error: any) {
    // axios error handling
    if (error.response) {
      return NextResponse.json(
        { error: error.response.data || error.message },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: error.message || "Nieznany błąd" },
      { status: 500 }
    );
  }
}
