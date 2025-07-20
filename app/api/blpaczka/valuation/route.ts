import { NextRequest, NextResponse } from "next/server";

const BL_API_URL = process.env.NEXT_PUBLIC_BL_API_URL || "";
const BL_LOGIN = process.env.NEXT_PUBLIC_BL_LOGIN || "";
const BL_API_KEY = process.env.NEXT_PUBLIC_BL_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();

    const requiredParams = [
      "weight",
      "postalSender",
      "postalDelivery",
      "sideX",
      "sideY",
      "sideZ",
      "type",
    ];

    const missing = requiredParams.filter((p) => !(p in params));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required parameters: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const payload = {
      auth: {
        login: BL_LOGIN,
        api_key: BL_API_KEY,
      },
      CourierSearch: {
        courier_code: params.courierCode,
        type: params.type,
        weight: params.weight,
        side_x: params.sideX,
        side_y: params.sideY,
        side_z: params.sideZ,
        postal_sender: params.postalSender,
        postal_delivery: params.postalDelivery,
        uptake: params.uptake,
        cover: params.cover,
        foreign: "local",
      },
    };

    const response = await fetch(`${BL_API_URL}/api/getValuation.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `BL API Error: ${response.status} - ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
