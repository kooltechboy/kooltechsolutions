const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const apiKey = "MYBNORE9AYHRHFWLWO2I9CD9R3XKUWSI";
const apiUrl = "https://api.kooltechsolutions.com";

async function main() {
  const url = `${apiUrl}/agents/`;
  console.log(`Fetching from Tactical RMM: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "X-API-KEY": apiKey,
        "Accept": "application/json",
      }
    });
    const json = await res.json();
    console.log(`Success [${res.status}]:`, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
