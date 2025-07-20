import { NextRequest, NextResponse } from "next/server";
import { paymentManager } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const { method, amount, order } = await req.json();

    const paymentResult = await paymentManager.processPayment(
      method,
      amount,
      order
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || "Payment processing failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(paymentResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
