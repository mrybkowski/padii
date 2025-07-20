import { NextRequest, NextResponse } from "next/server";

const BL_API_URL = process.env.NEXT_PUBLIC_BL_API_URL || "";
const BL_LOGIN = process.env.NEXT_PUBLIC_BL_LOGIN || "";
const BL_API_KEY = process.env.NEXT_PUBLIC_BL_API_KEY || "";

export async function POST() {
  try {
    const payload = {
      auth: {
        login: BL_LOGIN,
        api_key: BL_API_KEY,
      },
    };

    const response = await fetch(`${BL_API_URL}/api/getCountriesOptions.json`, {
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
