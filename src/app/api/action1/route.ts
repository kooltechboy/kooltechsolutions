import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch configuration dynamically from database
    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "Action1")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.ACTION1_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.ACTION1_API_URL || "https://app.action1.com/api/3.0";
    const isConnected = dbConfig?.status === "Connected" || !!process.env.ACTION1_API_KEY;

    if (!isConnected || !apiKey) {
      return NextResponse.json({
        _mock: false,
        endpoints: [],
        summary: {
          total_endpoints: 0,
          compliant: 0,
          needs_attention: 0,
          critical: 0,
          total_missing_patches: 0,
        },
      });
    }

    // Real API fetch from Action1
    // Action1 uses HTTP Basic Auth: API Key ID as username, API Secret as password.
    // The api_key field is stored as "keyId:keySecret"
    try {
      const [keyId, keySecret] = apiKey.split(":");
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const response = await fetch(`${apiUrl}/endpoints`, {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Action1 API error: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchErr) {
      console.warn("Action1 fetch failed:", fetchErr);
      return NextResponse.json({
        _mock: false,
        endpoints: [],
        summary: {
          total_endpoints: 0,
          compliant: 0,
          needs_attention: 0,
          critical: 0,
          total_missing_patches: 0,
        },
        error: fetchErr instanceof Error ? fetchErr.message : "Fetch failed"
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Action1 API Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
