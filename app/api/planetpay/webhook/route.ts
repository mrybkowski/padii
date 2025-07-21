import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PLANET_PAY_WEBHOOK_SECRET = process.env.PLANET_PAY_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("signature");

    // Weryfikuj podpis webhook (jeśli jest skonfigurowany)
    if (PLANET_PAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", PLANET_PAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const webhookData = JSON.parse(body);
    console.log("Planet Pay webhook received:", webhookData);

    const { paymentId, status, extOrderId } = webhookData;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required webhook data" },
        { status: 400 }
      );
    }

    // Mapuj statusy Planet Pay na statusy WooCommerce
    let wpStatus = "pending";
    let note = "";

    switch (status) {
      case "COMPLETED":
        wpStatus = "processing";
        note = `Płatność zakończona sukcesem. Payment ID: ${paymentId}`;
        break;
      case "PENDING":
        wpStatus = "pending";
        note = `Płatność w trakcie przetwarzania. Payment ID: ${paymentId}`;
        break;
      case "REJECTED":
      case "CANCELLED":
        wpStatus = "cancelled";
        note = `Płatność odrzucona lub anulowana. Payment ID: ${paymentId}`;
        break;
      case "ERROR":
        wpStatus = "failed";
        note = `Błąd płatności. Payment ID: ${paymentId}`;
        break;
      default:
        note = `Status płatności: ${status}. Payment ID: ${paymentId}`;
    }

    // Aktualizuj status zamówienia w WordPress
    if (extOrderId) {
      try {
        const updateResponse = await fetch(
          `${req.nextUrl.origin}/api/wordpress/update-order-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: extOrderId,
              status: wpStatus,
              note: note,
            }),
          }
        );

        if (!updateResponse.ok) {
          console.error("Failed to update order status in WordPress");
        } else {
          console.log(`Order ${extOrderId} status updated to ${wpStatus}`);
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", message: error.message },
      { status: 500 }
    );
  }
}