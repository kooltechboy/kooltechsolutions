import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration env variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testTacticalRMM() {
  console.log("\n--- Testing Tactical RMM Integration ---");
  const { data: dbConfig, error } = await supabase
    .from("integration_configs")
    .select("*")
    .eq("name", "Tactical RMM")
    .maybeSingle();

  const { data: allConfigs } = await supabase.from("integration_configs").select("*");
  console.log("All Supabase Configs:", allConfigs?.map(c => ({ name: c.name, endpoint: c.endpoint, has_key: !!c.api_key, status: c.status })));

  const apiKey = dbConfig?.api_key || process.env.RMM_API_KEY;
  const apiUrl = (dbConfig?.endpoint || process.env.RMM_API_URL || "").replace(/\/$/, "");

  if (!apiUrl || !apiKey) {
    console.log("Skipping check: Credentials missing.");
    return;
  }

  try {
    const url = `${apiUrl}/api/v3/agents/`;
    console.log(`Fetching from: ${url}`);
    const res = await fetch(url, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log(`Response HTTP Status: ${res.status} ${res.statusText}`);
    const bodyText = await res.text();
    console.log("Raw Response Snippet (First 500 chars):", bodyText.slice(0, 500));
  } catch (err) {
    console.error("Fetch Exception:", err);
  }
}

async function testITFlow() {
  console.log("\n--- Testing ITFlow PSA Integration ---");
  const { data: dbConfig, error } = await supabase
    .from("integration_configs")
    .select("*")
    .eq("name", "ITFlow")
    .maybeSingle();

  if (error) {
    console.error("Supabase query error:", error);
    return;
  }

  console.log("DB Config Status:", dbConfig?.status);
  console.log("DB Config Endpoint:", dbConfig?.endpoint);
  console.log("DB Config API Key Present:", !!dbConfig?.api_key);

  const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
  let apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "";

  if (!apiUrl || !apiKey) {
    console.log("Skipping check: Credentials missing.");
    return;
  }

  try {
    apiUrl = apiUrl.replace(/\/$/, "");
    
    // Test client list
    const clientsUrl = `${apiUrl}${apiUrl.endsWith('/api') ? "/v1/clients/read.php" : "/api/v1/clients/read.php"}?api_key=${apiKey}`;
    console.log(`Fetching clients from: ${clientsUrl}`);
    const clientRes = await fetch(clientsUrl);
    console.log(`Clients Response: ${clientRes.status}`);
    console.log("Snippet:", (await clientRes.text()).slice(0, 300));

    // Test ticket list
    const ticketsUrl = `${apiUrl}${apiUrl.endsWith('/api') ? "/v1/tickets/read.php" : "/api/v1/tickets/read.php"}?api_key=${apiKey}`;
    console.log(`Fetching tickets from: ${ticketsUrl}`);
    const ticketRes = await fetch(ticketsUrl);
    console.log(`Tickets Response: ${ticketRes.status}`);
    console.log("Snippet:", (await ticketRes.text()).slice(0, 300));
  } catch (err) {
    console.error("ITFlow Fetch Exception:", err);
  }
}

async function run() {
  await testTacticalRMM();
  await testITFlow();
}

run();
