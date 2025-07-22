import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function GET(req: NextRequest) {
  try {
    const cart = await wordpressAPI.getCart();
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const result = await wordpressAPI.clearCart();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart", message: error.message },
      { status: 500 }
    );
  }
}