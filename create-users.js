const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Fetching users...");
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) return console.error('Error fetching users:', userError);
  
  const adminUser = users.users.find(u => u.email === 'danieljwilliams2401@gmail.com');
  if (adminUser) {
    const { error: profileError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id);
    if (profileError) console.error('Error updating profile:', profileError);
    else console.log('Successfully updated danieljwilliams2401@gmail.com to admin role in profiles table!');
  } else {
    console.log('Admin user not found. Creating user...');
    const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
      email: 'danieljwilliams2401@gmail.com',
      password: 'daniel2480',
      email_confirm: true
    });
    if (createError) console.error('Error creating user:', createError);
    else {
      console.log('Created user. Updating profile...');
      await new Promise(r => setTimeout(r, 2000)); // wait for trigger
      await supabase.from('profiles').update({ role: 'admin', first_name: 'Daniel', last_name: 'Williams' }).eq('id', newUserData.user.id);
      console.log('Successfully created admin user!');
    }
  }

  const clientUser = users.users.find(u => u.email === 'kooltechtalks@gmail.com');
  if (!clientUser) {
    console.log('Client user not found. Creating user...');
    const { data: newClientData, error: createError } = await supabase.auth.admin.createUser({
      email: 'kooltechtalks@gmail.com',
      password: 'kttalks2025',
      email_confirm: true
    });
    if (createError) console.error('Error creating client user:', createError);
    else {
      console.log('Created client user. Updating profile...');
      await new Promise(r => setTimeout(r, 2000));
      await supabase.from('profiles').update({ role: 'client', first_name: 'KoolTech', last_name: 'Talks' }).eq('id', newClientData.user.id);
      console.log('Successfully created client user!');
    }
  } else {
    console.log('Client user already exists. Updating role...');
    await supabase.from('profiles').update({ role: 'client' }).eq('id', clientUser.id);
    console.log('Successfully updated client user!');
  }
}

run();
