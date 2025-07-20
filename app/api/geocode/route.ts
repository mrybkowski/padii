import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`,
      {
        headers: {
          "User-Agent": "MyApp/1.0 (contact@myapp.com)",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Geocoding service error" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.length > 0) {
      return NextResponse.json({
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      });
    } else {
      return NextResponse.json(
        { error: "No coordinates found for this address" },
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
