const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log("Fetching profiles...");
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*');

  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("Profiles in database:", profiles);
  }

  console.log("\nFetching auth users...");
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error("Error fetching auth users:", uError);
  } else {
    console.log("Auth users:", users.map(u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata })));
  }
}

listUsers();
