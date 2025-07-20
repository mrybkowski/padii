export async function POST(req: Request) {
  try {
    const authPayload = {
      auth: {
        login: process.env.NEXT_PUBLIC_BL_LOGIN || "",
        api_key: process.env.NEXT_PUBLIC_BL_API_KEY || "",
      },
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BL_API_URL}/api/couriers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(authPayload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
