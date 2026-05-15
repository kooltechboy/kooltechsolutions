const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Key Length:", process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : "UNDEFINED");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from('posts').select('id').limit(1);
  if (error) console.log("Error:", error.message);
  else console.log("Success fetching posts count:", data.length);
}

test();
