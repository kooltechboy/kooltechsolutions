const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking Supabase tables...");
  
  // Try to query the 'leads' table
  const { data: leads, error: leadsErr } = await supabase.from('leads').select('id').limit(1);
  console.log("Leads table:", leadsErr ? "MISSING: " + leadsErr.message : "EXISTS");

  // Try to query 'tickets'
  const { data: tickets, error: ticketsErr } = await supabase.from('tickets').select('id').limit(1);
  console.log("Tickets table:", ticketsErr ? "MISSING: " + ticketsErr.message : "EXISTS");
  
  // Try to query 'agent_logs'
  const { data: logs, error: logsErr } = await supabase.from('agent_logs').select('id').limit(1);
  console.log("Agent Logs table:", logsErr ? "MISSING: " + logsErr.message : "EXISTS");
}

checkTables();
