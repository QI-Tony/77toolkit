const allowedOrigins = new Set([
  "https://77toolkit.com",
  "https://color.77toolkit.com",
  "https://jsonfix.77toolkit.com",
  "https://textclean.77toolkit.com",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://77toolkit.com",
    Vary: "Origin",
  };
}

function json(request, data, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders(request),
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json(request, {
        ok: true,
        service: "77toolkit-api",
      });
    }

    return json(request, { error: "Not found" }, 404);
  },
};

