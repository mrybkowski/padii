import { NextRequest, NextResponse } from "next/server";

const PLANET_PAY_API_URL = process.env.NEXT_PUBLIC_PLANET_PAY_API_URL || "";
const PLANET_PAY_SECRET = process.env.PLANET_PAY_SECRET || "";
const PLANET_PAY_MERCHANT_ID =
  process.env.NEXT_PUBLIC_PLANET_PAY_MERCHANT_ID || "";

export async function POST(req: NextRequest) {
  try {
    const { customerEmail } = await req.json();

    const authRequest = {
      resource: "PAYMENT",
      channel: "WEBAPI",
      secret: PLANET_PAY_SECRET,
      merchant: {
        merchantId: PLANET_PAY_MERCHANT_ID,
      },
      ...(customerEmail && {
        customer: {
          email: customerEmail,
        },
      }),
    };

    const response = await fetch(`${PLANET_PAY_API_URL}/v1/ecommerce/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(authRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Planet Pay API Error: ${response.status} - ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
