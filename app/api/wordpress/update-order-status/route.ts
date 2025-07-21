import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "";
const WP_CONSUMER_KEY = process.env.NEXT_PUBLIC_WP_CONSUMER_KEY || "";
const WP_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WP_CONSUMER_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const { orderId, status, note } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString("base64");

    // Aktualizuj status zamówienia w WordPress
    const updateData: any = {
      status: status,
    };

    // Dodaj notatkę jeśli została podana
    if (note) {
      updateData.customer_note = note;
    }

    // Dodaj meta dane o płatności
    updateData.meta_data = [
      {
        key: "_payment_completed_date",
        value: new Date().toISOString(),
      },
      {
        key: "_payment_method_title",
        value: "Planet Pay",
      },
    ];

    const response = await fetch(`${WP_API_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `WordPress API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const updatedOrder = await response.json();

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}