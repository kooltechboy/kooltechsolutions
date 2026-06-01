const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching integration_configs from Supabase...");
  const { data, error } = await supabase.from('integration_configs').select('*');
  if (error) {
    console.error("Error fetching integration_configs:", error);
  } else {
    console.log("Integration Configs:");
    data.forEach(item => {
      console.log(`- ID: ${item.id}, Name: ${item.name}, Category: ${item.category}, Status: ${item.status}`);
      console.log(`  Endpoint: ${item.endpoint}`);
      console.log(`  API Key: ${item.api_key ? '***[Present]***' : '[None]'}`);
    });
  }
}

main().catch(console.error);
