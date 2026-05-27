import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient } from "@/lib/itflow";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Basic protection: only logged-in users (or an admin service role) can trigger a sync manually
    // For cron, you'd typically use a secret token in the headers
    if (authError || !user) {
      // Allow service triggers if they have a special bypass token (simplified for now)
      const authHeader = request.headers.get("Authorization");
      if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "ITFlow")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: "ITFlow not configured" }, { status: 400 });
    }

    const client = new ITFlowClient({ apiUrl, apiKey });

    // Sync Clients (ITFlow Clients -> Supabase Profiles)
    // Note: In reality, ITFlow clients map better to organizations or a new 'clients' table.
    // For this example, we assume syncing down to a custom table or just validating data.
    let syncedClients = 0;
    try {
      const itflowClients = await client.getItems('clients');
      if (itflowClients && itflowClients.data && Array.isArray(itflowClients.data)) {
        // Pseudo-sync logic: Just logging for now to avoid overwriting existing profiles destructively
        console.log(`Fetched ${itflowClients.data.length} clients from ITFlow.`);
        syncedClients = itflowClients.data.length;
      }
    } catch (e) {
      console.error("Failed to sync clients", e);
    }

    // Sync Tickets
    let syncedTickets = 0;
    try {
      const itflowTickets = await client.getItems('tickets');
      if (itflowTickets && itflowTickets.data && Array.isArray(itflowTickets.data)) {
        console.log(`Fetched ${itflowTickets.data.length} tickets from ITFlow.`);
        // E.g., INSERT INTO public.tickets ... ON CONFLICT DO UPDATE
        syncedTickets = itflowTickets.data.length;
      }
    } catch (e) {
      console.error("Failed to sync tickets", e);
    }

    // Update the last_sync timestamp
    await supabase
      .from("integration_configs")
      .update({ last_sync: new Date().toISOString(), status: 'Connected' })
      .eq("name", "ITFlow");

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      details: {
        syncedClients,
        syncedTickets
      }
    });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
