import { NextRequest, NextResponse } from "next/server";
import { wordpressAPI } from "@/lib/wordpress";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : undefined,
      status: searchParams.get('status') || undefined,
      customer: searchParams.get('customer') ? parseInt(searchParams.get('customer')!) : undefined,
      search: searchParams.get('search') || undefined,
      after: searchParams.get('after') || undefined,
      before: searchParams.get('before') || undefined,
      orderby: searchParams.get('orderby') || undefined,
      order: searchParams.get('order') || undefined,
    };

    const orders = await wordpressAPI.getOrders(params);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", message: error.message },
      { status: 500 }
    );
  }
}