// deep_rmm_probe.js — finds the correct Tactical RMM endpoint + auth combo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE = "https://rmm.kooltechsolutions.com";
const KEY  = "MYBNORE9AYHRHFWLWO2I9CD9R3XKUWSI";

async function probe(label, url, headers = {}) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      redirect: "follow",
    });
    const text = await res.text();
    const isHTML = text.trim().startsWith("<");
    const preview = isHTML ? "[HTML page]" : text.slice(0, 300);
    console.log(`[${res.status}] ${label}`);
    if (!isHTML) console.log(`       → ${preview}`);
    return { status: res.status, isHTML, text };
  } catch (e) {
    console.log(`[ERR]  ${label} → ${e.message}`);
    return null;
  }
}

async function main() {
  console.log("=== Tactical RMM Deep Probe ===\n");

  // 1. Try different auth header styles
  console.log("--- Auth header variants ---");
  await probe("X-API-KEY header", `${BASE}/api/v3/agents/`, { "X-API-KEY": KEY });
  await probe("Authorization: Token", `${BASE}/api/v3/agents/`, { "Authorization": `Token ${KEY}` });
  await probe("Authorization: Bearer", `${BASE}/api/v3/agents/`, { "Authorization": `Bearer ${KEY}` });
  await probe("X-Api-Key (lowercase dash)", `${BASE}/api/v3/agents/`, { "X-Api-Key": KEY });

  // 2. Try different API path formats
  console.log("\n--- API path variants ---");
  await probe("GET /api/v3/agents/", `${BASE}/api/v3/agents/`, { "X-API-KEY": KEY });
  await probe("GET /api/v3/agents (no slash)", `${BASE}/api/v3/agents`, { "X-API-KEY": KEY });
  await probe("GET /agents/", `${BASE}/agents/`, { "X-API-KEY": KEY });

  // 3. Check if the API responds at all without auth (should get 401)
  console.log("\n--- No auth (expect 401 if reachable) ---");
  await probe("GET /api/v3/agents/ (no auth)", `${BASE}/api/v3/agents/`);

  // 4. Try the schema / swagger endpoint to confirm the API version
  console.log("\n--- Discovery endpoints ---");
  await probe("GET /api/schema/", `${BASE}/api/schema/`, { "X-API-KEY": KEY });
  await probe("GET /api/v3/", `${BASE}/api/v3/`, { "X-API-KEY": KEY });
  await probe("GET /api/", `${BASE}/api/`, { "X-API-KEY": KEY });
  await probe("GET /docs/ (swagger)", `${BASE}/docs/`, { "X-API-KEY": KEY });

  // 5. Check if we need to go through a different port
  console.log("\n--- Port variants ---");
  await probe("Port 8080", `http://rmm.kooltechsolutions.com:8080/api/v3/agents/`, { "X-API-KEY": KEY });
}

main().catch(console.error);
