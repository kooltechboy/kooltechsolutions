import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from("integration_configs")
    .update({ endpoint: "https://api.kooltechsolutions.com" })
    .eq("name", "Tactical RMM")
    .select();

  if (error) {
    console.error("❌ Failed to update TRMM URL:", error.message);
  } else {
    console.log("✅ Tactical RMM URL updated in Supabase:", data);
  }
}

run();
