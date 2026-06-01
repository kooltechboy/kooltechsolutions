const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const apiKey = "3vo3PZowixF4J4fxnVLjU8dlFrjPycBS";
const apiUrl = "https://itflow.kooltechsolutions.com";

async function testITFlow(endpoint) {
  const url = `${apiUrl}/api/v1/${endpoint}/read.php?api_key=${apiKey}`;
  console.log(`Fetching from ITFlow: ${url}`);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log(`Success [${res.status}] for ${endpoint}:`, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(`Error for ${endpoint}:`, err);
  }
}

async function main() {
  await testITFlow("assets");
  await testITFlow("clients");
  await testITFlow("tickets");
}

main();
