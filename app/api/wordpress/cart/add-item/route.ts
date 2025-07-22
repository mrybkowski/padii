import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity = 1, variationId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = await wordpressAPI.addToCart(productId, quantity, variationId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart", message: error.message },
      { status: 500 }
    );
  }
}