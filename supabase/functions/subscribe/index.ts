const allowedOrigins = new Set([
  "https://prayerandfire.org",
  "https://www.prayerandfire.org",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin)
      ? origin
      : "https://prayerandfire.org",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return json(request, { success: false, error: "Method not allowed." }, 405);
  }

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!brevoApiKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Subscription service is missing required server secrets.");
    return json(
      request,
      { success: false, error: "Subscription service is not configured." },
      503,
    );
  }

  try {
    const body = await request.json();
    const honeypot = clean(body.website, 200);

    if (honeypot) {
      return json(request, { success: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const country = clean(body.country, 120);

    if (!name || !validEmail(email)) {
      return json(
        request,
        { success: false, error: "Please enter a valid name and email." },
        400,
      );
    }

    const existingResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Accept": "application/json",
        },
      },
    );

    if (!existingResponse.ok) {
      throw new Error(`Subscriber lookup failed (${existingResponse.status}).`);
    }

    const existing = await existingResponse.json();
    const alreadySubscribed = Array.isArray(existing) && existing.length > 0;

    const databaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?on_conflict=email`,
      {
        method: "POST",
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ name, email, country }),
      },
    );

    if (!databaseResponse.ok) {
      const details = await databaseResponse.text();
      console.error("Supabase subscriber save failed:", details);
      throw new Error(`Subscriber save failed (${databaseResponse.status}).`);
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name,
        },
        updateEnabled: true,
      }),
    });

    if (!brevoResponse.ok) {
      const details = await brevoResponse.text();
      console.error("Brevo contact sync failed:", details);
      throw new Error(`Email service failed (${brevoResponse.status}).`);
    }

    return json(request, { success: true, alreadySubscribed });
  } catch (error) {
    console.error("Subscribe function error:", error);
    return json(
      request,
      { success: false, error: "Unable to subscribe right now." },
      500,
    );
  }
});
