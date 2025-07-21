import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const AUTH_URL = "https://api.sandbox.planetpay.pl/v1/ecommerce/auth";

const MERCHANT_SECRET = process.env.PLANET_PAY_SECRET || "TWÓJ_SECRET";
const MERCHANT_ID =
  process.env.NEXT_PUBLIC_PLANET_PAY_MERCHANT_ID || "TWÓJ_MERCHANT_ID";
const CHANNEL = "WEBAPI";

export async function PUT(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const paymentId = params.paymentId;
  const body = await req.json();

  const { instrument } = body;

  if (!paymentId || !instrument?.code) {
    return NextResponse.json(
      { error: "Brakuje paymentId lub kodu BLIK" },
      { status: 400 }
    );
  }

  try {
    // 1. Pobierz token JWT
    const authResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_PLANET_PAY_API_URL}/v1/ecommerce/auth`,
      {
        resource: "PAYMENT",
        channel: "PAYWALL",
        secret: process.env.PLANET_PAY_SECRET,
        merchant: { merchantId: process.env.NEXT_PUBLIC_PLANET_PAY_MERCHANT_ID },
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

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_PLANET_PAY_API_URL}/v1/ecommerce/payment/${paymentId}/instrument`,
      {
        instrument: {
          type: "BLIK_CODE",
          code: instrument.code,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Błąd przy wysyłaniu kodu BLIK";

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
