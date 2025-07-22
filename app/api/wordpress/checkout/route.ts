import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function POST(req: NextRequest) {
  try {
    const checkoutData = await req.json();

    // Walidacja wymaganych pól
    if (!checkoutData.billing_address) {
      return NextResponse.json(
        { error: "Billing address is required" },
        { status: 400 }
      );
    }

    if (!checkoutData.payment_method) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Dodaj domyślne wartości dla order attribution jeśli nie ma
    if (!checkoutData.extensions) {
      checkoutData.extensions = {};
    }

    if (!checkoutData.extensions["woocommerce/order-attribution"]) {
      checkoutData.extensions["woocommerce/order-attribution"] = {
        source_type: "typein",
        referrer: "(none)",
        utm_campaign: "(none)",
        utm_source: "(direct)",
        utm_medium: "(none)",
        utm_content: "(none)",
        utm_id: "(none)",
        utm_term: "(none)",
        utm_source_platform: "(none)",
        utm_creative_format: "(none)",
        utm_marketing_tactic: "(none)",
        session_entry: req.headers.get("referer") || "https://padii.pl/",
        session_start_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        session_pages: "1",
        session_count: "1",
        user_agent: req.headers.get("user-agent") || "",
      };
    }

    // Dodaj domyślne wartości dla BLPaczka jeśli nie ma
    if (!checkoutData.extensions.blpaczka) {
      checkoutData.extensions.blpaczka = {
        "blpaczka-point": checkoutData.delivery_point || "",
      };
    }

    // Ustaw domyślne wartości
    checkoutData.create_account = checkoutData.create_account || false;
    checkoutData.customer_note = checkoutData.customer_note || "";
    checkoutData.customer_password = checkoutData.customer_password || "";
    checkoutData.additional_fields = checkoutData.additional_fields || {};

    // Jeśli nie ma shipping_address, użyj billing_address
    if (!checkoutData.shipping_address) {
      checkoutData.shipping_address = { ...checkoutData.billing_address };
      delete checkoutData.shipping_address.email; // Shipping address nie potrzebuje email
    }

    const result = await wordpressAPI.createStoreCheckout(checkoutData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Failed to process checkout", message: error.message },
      { status: 500 }
    );
  }
}