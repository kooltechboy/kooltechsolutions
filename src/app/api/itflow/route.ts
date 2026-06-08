import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient, type ITFlowPayload } from "@/lib/itflow";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isITFlowPayload(value: unknown): value is ITFlowPayload {
  return isRecord(value) && Object.values(value).every((item) => {
    return (
      item == null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    );
  });
}

function normalizeAsset(item: Record<string, unknown>) {
  return {
    id: item.asset_id || item.id,
    type: item.asset_type || "Laptop",
    model: item.asset_model || item.asset_name || "Workstation",
    assignment: item.client_name || (item.asset_client_id === "1" ? "KOOL TECH SOLUTIONS" : "N/A"),
    purchase_date: item.asset_purchase_date || null,
    warranty_expires: item.asset_warranty_expire || null,
    serial: item.asset_serial || "UNKNOWN",
    os: item.asset_os || ""
  };
}

async function getClientAndAuth() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: dbConfig } = await supabase
    .from("integration_configs")
    .select("endpoint, api_key, status")
    .eq("name", "ITFlow")
    .maybeSingle();

  const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
  const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";
  const isConnected = dbConfig?.status === "Connected" || !!process.env.ITFLOW_API_KEY;

  if (!isConnected || !apiKey || !apiUrl) {
    throw new Error("ITFlow not configured");
  }

  return new ITFlowClient({ apiUrl, apiKey });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'assets';
    
    // We can extract other query params to pass to ITFlow
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') params[key] = value;
    });

    try {
      const client = await getClientAndAuth();
      const data = await client.getItems<Record<string, unknown> | unknown[]>(endpoint, params);
      
      // Normalize data fields for client convenience if the endpoint is assets
      if (endpoint === 'assets' && isRecord(data) && Array.isArray(data.data)) {
        data.data = data.data.filter(isRecord).map(normalizeAsset);
      }
      
      return NextResponse.json(data);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      console.warn("ITFlow fetch failed or not configured:", err);
      return NextResponse.json({ 
        data: [], 
        _mock: false, 
        error: err instanceof Error ? err.message : "Fetch failed" 
      });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    if (!endpoint) return NextResponse.json({ error: "Endpoint parameter required" }, { status: 400 });

    const body = await request.json() as unknown;
    if (!isITFlowPayload(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const client = await getClientAndAuth();
    
    const result = await client.createItem(endpoint, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    if (!endpoint) return NextResponse.json({ error: "Endpoint parameter required" }, { status: 400 });

    const body = await request.json() as unknown;
    if (!isITFlowPayload(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const client = await getClientAndAuth();
    
    const result = await client.updateItem(endpoint, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    if (!endpoint) return NextResponse.json({ error: "Endpoint parameter required" }, { status: 400 });

    const body = await request.json() as unknown; // IDs or params for deletion
    if (!isITFlowPayload(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const client = await getClientAndAuth();
    
    const result = await client.deleteItem(endpoint, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
