import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient } from "@/lib/itflow";

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
      const data = await client.getItems(endpoint, params);
      
      // Normalize data fields for client convenience if the endpoint is assets
      if (endpoint === 'assets' && data && Array.isArray(data.data)) {
        data.data = data.data.map((item: any) => ({
          id: item.asset_id || item.id,
          type: item.asset_type || "Laptop",
          model: item.asset_model || item.asset_name || "Workstation",
          assignment: item.client_name || (item.asset_client_id === "1" ? "KOOL TECH SOLUTIONS" : "N/A"),
          purchase_date: item.asset_purchase_date || null,
          warranty_expires: item.asset_warranty_expire || null,
          serial: item.asset_serial || "UNKNOWN",
          os: item.asset_os || ""
        }));
      }
      
      return NextResponse.json(data);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Fallback for demo/missing config
      console.warn("ITFlow fetch failed or not configured, using fallback:", err);
      if (endpoint === 'assets') {
        return NextResponse.json({
          data: [
            { id: "A-001", type: "Laptop", model: "Dell Latitude 5520", assignment: "John Doe", purchase_date: "2023-01-15", warranty_expires: "2026-01-15", note: "Fallback mock data" }
          ]
        });
      }
      return NextResponse.json({ data: [] });
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

    const body = await request.json();
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

    const body = await request.json();
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

    const body = await request.json(); // IDs or params for deletion
    const client = await getClientAndAuth();
    
    const result = await client.deleteItem(endpoint, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
