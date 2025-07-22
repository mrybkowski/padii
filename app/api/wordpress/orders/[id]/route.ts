import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order = await wordpressAPI.getOrderById(orderId);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const updateData = await req.json();
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const updatedOrder = await wordpressAPI.updateOrder(orderId, updateData);
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order", message: error.message },
      { status: 500 }
    );
  }
}