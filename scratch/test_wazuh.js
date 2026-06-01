const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const DASHBOARD_URL = process.env.WAZUH_API_URL || "";
const BASIC_AUTH = Buffer.from(
  `${process.env.WAZUH_API_USER || "admin"}:${process.env.WAZUH_API_PASSWORD || ""}`
).toString("base64");

const OPENSEARCH_HEADERS = {
  Authorization: `Basic ${BASIC_AUTH}`,
  "Content-Type": "application/json",
  "osd-xsrf": "true",
};

async function opensearchQuery(index, body) {
  const encodedPath = encodeURIComponent(`/${index}/_search`);
  const url = `${DASHBOARD_URL}/api/console/proxy?path=${encodedPath}&method=GET`;
  console.log("Fetching from:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: OPENSEARCH_HEADERS,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenSearch query failed [${res.status}] on ${index}: ${txt.slice(0, 200)}`);
  }

  return res.json();
}

async function main() {
  console.log("Testing wazuh route logic with native fetch...");
  try {
    const latestDoc = await opensearchQuery("wazuh-monitoring-*", {
      size: 1,
      sort: [{ timestamp: { order: "desc" } }],
      _source: ["timestamp"],
    });
    console.log("Success! Latest Doc:", JSON.stringify(latestDoc, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
