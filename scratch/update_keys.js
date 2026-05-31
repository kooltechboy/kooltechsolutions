"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase configuration env variables.");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const TACTICAL_RMM_KEY = "MYBNORE9AYHRHFWLWO2I9CD9R3XKUWSI";
const ITFLOW_API_KEY = "9-ssk0SbGqBMbVIkjRgiQUXDJTvLJMWv";
async function run() {
    console.log("Updating Integration API Keys in Supabase...");
    // 1. Update Tactical RMM
    const rmmUpdate = await supabase
        .from("integration_configs")
        .update({ api_key: TACTICAL_RMM_KEY, status: "Connected" })
        .eq("name", "Tactical RMM");
    if (rmmUpdate.error) {
        console.error("Error updating Tactical RMM:", rmmUpdate.error);
    }
    else {
        console.log("Tactical RMM API Key successfully updated!");
    }
    // 2. Update ITFlow
    const itflowUpdate = await supabase
        .from("integration_configs")
        .update({ api_key: ITFLOW_API_KEY, status: "Connected" })
        .eq("name", "ITFlow");
    if (itflowUpdate.error) {
        console.error("Error updating ITFlow:", itflowUpdate.error);
    }
    else {
        console.log("ITFlow API Key successfully updated!");
    }
    // Double check configs
    const { data: configs } = await supabase.from("integration_configs").select("name, endpoint, status, api_key");
    console.log("\nUpdated Integration Table State:");
    console.log(configs?.map(c => ({
        name: c.name,
        endpoint: c.endpoint,
        status: c.status,
        has_key: !!c.api_key,
        key_snippet: c.api_key ? `${c.api_key.slice(0, 5)}...` : null
    })));
}
run();
