// app/api/geocode-batch/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { addresses } = await req.json();

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: "Addresses array is required" },
        { status: 400 }
      );
    }

    // Ogranicz do 20 adresów na żądanie
    const limitedAddresses = addresses.slice(0, 20);

    const results = await Promise.all(
      limitedAddresses.map(async (address) => {
        try {
          const searchQuery = encodeURIComponent(address);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`,
            {
              headers: {
                "User-Agent": "MyApp/1.0 (contact@myapp.com)",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              return {
                address,
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              };
            }
          }
        } catch (error) {
          console.error(`Geocoding failed for address: ${address}`, error);
        }
        return {
          address,
          latitude: null,
          longitude: null,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
