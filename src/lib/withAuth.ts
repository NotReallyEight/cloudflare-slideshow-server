import { NextRequest } from "next/server";

export function withBearerAuth(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async function (request: NextRequest): Promise<Response> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return Response.json(
        { message: "Unauthorized: Missing or invalid Authorization header" },
        { status: 401 }
      );

    const token = authHeader.split(" ")[1];

    if (token !== process.env.BEARER_TOKEN)
      return Response.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );

    return handler(request);
  };
}
