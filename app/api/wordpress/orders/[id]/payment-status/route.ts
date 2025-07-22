import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const { status, transactionId, paymentMethod, note } = await req.json();
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Payment status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const updatedOrder = await wordpressAPI.updateOrderPaymentStatus(
      orderId,
      status,
      transactionId,
      paymentMethod,
      note
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order payment status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Error updating order payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status", message: error.message },
      { status: 500 }
    );
  }
}