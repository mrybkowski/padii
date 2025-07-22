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

    const notes = await wordpressAPI.getOrderNotes(orderId);
    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("Error fetching order notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch order notes", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const { note, customerNote = false } = await req.json();
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const newNote = await wordpressAPI.addOrderNote(orderId, note, customerNote);
    return NextResponse.json(newNote);
  } catch (error: any) {
    console.error("Error adding order note:", error);
    return NextResponse.json(
      { error: "Failed to add order note", message: error.message },
      { status: 500 }
    );
  }
}