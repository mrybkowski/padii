import { NextRequest, NextResponse } from "next/server";

const PLANET_PAY_API_URL = process.env.PLANET_PAY_API_URL || "";
const PLANET_PAY_SECRET = process.env.PLANET_PAY_SECRET || "";
const PLANET_PAY_MERCHANT_ID = process.env.PLANET_PAY_MERCHANT_ID || "";

export async function POST(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    const refundRequest = await req.json();

    // Najpierw uzyskaj token dostępu
    const authResponse = await fetch(
      `${PLANET_PAY_API_URL}/v1/ecommerce/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          resource: "PAYMENT",
          channel: "WEBAPI",
          secret: PLANET_PAY_SECRET,
          merchant: { merchantId: PLANET_PAY_MERCHANT_ID },
        }),
      }
    );

    if (!authResponse.ok) {
      const error = await authResponse.text();
      return NextResponse.json(
        { error: `Authentication failed: ${authResponse.status} - ${error}` },
        { status: authResponse.status }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Wykonaj zwrot
    const response = await fetch(
      `${PLANET_PAY_API_URL}/v1/ecommerce/payment/${paymentId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(refundRequest),
      }
    );

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
