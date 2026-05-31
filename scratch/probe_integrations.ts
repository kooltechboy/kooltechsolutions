import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ITFLOW_URL = "https://itflow.kooltechsolutions.com";
const ITFLOW_KEY = "9-ssk0SbGqBMbVIkjRgiQUXDJTvLJMWv";
const RMM_URL = "https://rmm.kooltechsolutions.com";
const RMM_KEY = "MYBNORE9AYHRHFWLWO2I9CD9R3XKUWSI";

async function probe(label: string, url: string, headers?: Record<string,string>) {
  console.log(`\n>> ${label}`);
  console.log(`   URL: ${url}`);
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json", ...(headers || {}) } });
    const text = await res.text();
    console.log(`   Status: ${res.status}`);
    console.log(`   Body: ${text.slice(0, 400)}`);
  } catch (e: any) {
    console.log(`   ERROR: ${e.message}`);
  }
}

async function probeITFlow() {
  console.log("\n============ ITFlow Probe ============");

  // Try different endpoints to see which ones work with this key scope
  await probe("company/read (global info)", `${ITFLOW_URL}/api/v1/company/read.php?api_key=${ITFLOW_KEY}`);
  await probe("clients/read (all)", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}`);
  await probe("clients/read limit=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&limit=1`);
  // Try with company_id guesses
  await probe("clients/read company_id=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
  await probe("tickets/read company_id=1", `${ITFLOW_URL}/api/v1/tickets/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
  await probe("assets/read company_id=1", `${ITFLOW_URL}/api/v1/assets/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
  // Try client_id variants
  await probe("clients/read client_id=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
  await probe("tickets/read client_id=1", `${ITFLOW_URL}/api/v1/tickets/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
  await probe("assets/read client_id=1", `${ITFLOW_URL}/api/v1/assets/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
}

async function probeTacticalRMM() {
  console.log("\n============ Tactical RMM Probe ============");

  // Test different API paths and versions
  await probe("v3/agents", `${RMM_URL}/api/v3/agents/`, { "X-API-KEY": RMM_KEY });
  await probe("v3/agents (no trailing slash)", `${RMM_URL}/api/v3/agents`, { "X-API-KEY": RMM_KEY });
  await probe("v2/agents", `${RMM_URL}/api/v2/agents/`, { "X-API-KEY": RMM_KEY });
  await probe("v1/agents", `${RMM_URL}/api/v1/agents/`, { "X-API-KEY": RMM_KEY });
  // Test auth - try token header variant
  await probe("v3/agents (Authorization Bearer)", `${RMM_URL}/api/v3/agents/`, { "Authorization": `Token ${RMM_KEY}` });
  // Test if the API root responds at all with any JSON
  await probe("API root", `${RMM_URL}/api/`, { "X-API-KEY": RMM_KEY });
}

async function run() {
  await probeITFlow();
  await probeTacticalRMM();
}

run();
