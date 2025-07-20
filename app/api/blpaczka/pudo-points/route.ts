import { NextRequest, NextResponse } from "next/server";

const BL_API_URL = process.env.NEXT_PUBLIC_BL_API_URL || "";
const BL_LOGIN = process.env.NEXT_PUBLIC_BL_LOGIN || "";
const BL_API_KEY = process.env.NEXT_PUBLIC_BL_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { postalCode, courierCode } = await req.json();

    if (!postalCode) {
      return NextResponse.json(
        { error: "Postal code is required" },
        { status: 400 }
      );
    }

    const payload = {
      auth: {
        login: BL_LOGIN,
        api_key: BL_API_KEY,
      },
      PudoPoint: {
        postal_code: postalCode,
        courier_code: courierCode,
      },
    };

    const response = await fetch(`${BL_API_URL}/api/getPudoPoints.json`, {
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

    if (data.success && data.data?.PudoPoints) {
      const pointsArray = Object.values(data.data.PudoPoints) as any[];

      // Ogranicz do 20 punktów i wybierz tylko potrzebne pola
      const limitedPoints = pointsArray.slice(0, 20).map((point) => ({
        point_id: point.point_id,
        description: point.description,
        address: point.address,
        city: point.city,
        postal_code: point.postal_code,
        opening_hours: point.opening_hours,
        courier_code: point.courier_code,
        country: point.country,
      }));

      return NextResponse.json({ success: true, points: limitedPoints });
    } else {
      return NextResponse.json(
        { error: data.message || "No points found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
