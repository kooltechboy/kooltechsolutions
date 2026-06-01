const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: dbConfig } = await supabase
    .from("integration_configs")
    .select("endpoint, api_key, status")
    .eq("name", "Tactical RMM")
    .maybeSingle();

  console.log("DB Config:", JSON.stringify(dbConfig, null, 2));

  const apiKey = dbConfig?.api_key || process.env.RMM_API_KEY;
  const apiUrl = (dbConfig?.endpoint || process.env.RMM_API_URL || "").replace(/\/$/, "");
  const isConnected = dbConfig?.status === "Connected" || !!process.env.RMM_API_KEY;

  console.log("isConnected:", isConnected);
  console.log("apiKey:", apiKey ? "Present" : "Missing");
  console.log("apiUrl:", apiUrl);

  try {
    const url = `${apiUrl}/agents/`;
    console.log("Fetching from:", url);
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("Status:", response.status);
    if (!response.ok) {
      console.log("Error response text:", await response.text());
    } else {
      const data = await response.json();
      console.log("Data length:", Array.isArray(data) ? data.length : data.agents?.length);
      console.log("First agent:", JSON.stringify(data[0] || data.agents?.[0], null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

main();
