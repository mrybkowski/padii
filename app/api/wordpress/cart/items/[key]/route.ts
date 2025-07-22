import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { quantity } = await req.json();
    const key = params.key;

    if (!key) {
      return NextResponse.json(
        { error: "Cart item key is required" },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );
    }

    const result = await wordpressAPI.updateCartItem(key, quantity);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = params.key;

    if (!key) {
      return NextResponse.json(
        { error: "Cart item key is required" },
        { status: 400 }
      );
    }

    const result = await wordpressAPI.removeCartItem(key);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item", message: error.message },
      { status: 500 }
    );
  }
}