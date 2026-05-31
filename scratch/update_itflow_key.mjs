// update_itflow_key.js — updates ITFlow key in Supabase integration_configs
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const NEW_ITFLOW_KEY = "3vo3PZowixF4J4fxnVLjU8dlFrjPycBS";

  // Update ITFlow key in integration_configs
  const { data, error } = await supabase
    .from("integration_configs")
    .update({ api_key: NEW_ITFLOW_KEY })
    .eq("name", "ITFlow")
    .select();

  if (error) {
    console.error("❌ Failed to update ITFlow key:", error.message);
  } else if (data?.length === 0) {
    // Row doesn't exist yet, insert it
    const { error: insertError } = await supabase
      .from("integration_configs")
      .insert({
        name: "ITFlow",
        endpoint: "https://itflow.kooltechsolutions.com",
        api_key: NEW_ITFLOW_KEY,
        status: "Connected",
      });
    if (insertError) console.error("❌ Insert failed:", insertError.message);
    else console.log("✅ ITFlow row inserted with new key");
  } else {
    console.log("✅ ITFlow key updated in Supabase:", data);
  }

  // Verify current state of all integrations
  const { data: allConfigs } = await supabase
    .from("integration_configs")
    .select("name, endpoint, status, api_key");

  console.log("\n📋 Current integration_configs:");
  for (const c of allConfigs || []) {
    console.log(`  [${c.status}] ${c.name} → ${c.endpoint}`);
    console.log(`           key: ${c.api_key?.slice(0, 12)}...`);
  }
}

run();
