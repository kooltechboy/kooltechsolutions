const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const apiKey = "3vo3PZowixF4J4fxnVLjU8dlFrjPycBS";
const apiUrl = "https://itflow.kooltechsolutions.com";

async function createClient() {
  const url = `${apiUrl}/api/v1/clients/create.php`;
  console.log("Creating client in ITFlow via:", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        client_name: 'KOOL TECH SOLUTIONS',
        client_phone: '809-555-0199',
        client_email: 'billing@kooltechsolutions.com'
      })
    });
    const json = await res.json();
    console.log("Create client response:", JSON.stringify(json, null, 2));
    return json;
  } catch (err) {
    console.error("Create client error:", err);
  }
}

async function createAsset(clientId) {
  const url = `${apiUrl}/api/v1/assets/create.php`;
  console.log("Creating asset in ITFlow via:", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        asset_name: 'KOOLTECHTALKS',
        asset_type: 'Laptop',
        asset_make: 'HP',
        asset_model: 'Laptop 15-ef2xxx',
        asset_serial: '5CD4011N05',
        client_id: clientId || 1
      })
    });
    const json = await res.json();
    console.log("Create asset response:", JSON.stringify(json, null, 2));
    return json;
  } catch (err) {
    console.error("Create asset error:", err);
  }
}

async function main() {
  const clientRes = await createClient();
  const clientId = clientRes && clientRes.id ? clientRes.id : 1;
  await createAsset(clientId);
}

main();
