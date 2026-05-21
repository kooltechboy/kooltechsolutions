const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  {
    email: 'danieljwilliams2401@gmail.com',
    password: 'daniel2480',
    role: 'admin',
    firstName: 'Daniel',
    lastName: 'Williams',
    companyName: 'Kool Tech Solutions'
  },
  {
    email: 'kooltechtalks@gmail.com',
    password: 'kttalks2025',
    role: 'client',
    firstName: 'Kool Tech',
    lastName: 'Talks',
    companyName: 'Kool Tech Talks Client'
  }
];

async function setupUsers() {
  console.log("Starting users setup...");
  
  for (const userSpec of usersToCreate) {
    console.log(`Processing user: ${userSpec.email}`);
    
    // 1. Check if user already exists in auth.users by getting their details
    // We can list users and search or try to create them. If creation fails because user already exists, we catch it or handle it.
    // However, it's safer to attempt to create the user:
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: userSpec.email,
      password: userSpec.password,
      email_confirm: true
    });

    let userId;
    if (createError) {
      if (createError.message.includes('already') || createError.message.includes('registered') || createError.message.includes('exists')) {
        console.log(`User ${userSpec.email} already exists in auth.users. Retrieving user...`);
        // If they already exist, let's find their ID. We can list users.
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error("Error listing users:", listError);
          continue;
        }
        const existingUser = listData.users.find(u => u.email === userSpec.email);
        if (!existingUser) {
          console.error(`Could not find existing user ${userSpec.email} in the list.`);
          continue;
        }
        userId = existingUser.id;
        
        // Also update password to ensure it matches user request
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          password: userSpec.password
        });
        if (updateError) {
          console.warn(`Could not update password for existing user: ${updateError.message}`);
        } else {
          console.log(`Password updated successfully for ${userSpec.email}`);
        }
      } else {
        console.error(`Error creating user ${userSpec.email}:`, createError.message);
        continue;
      }
    } else {
      userId = createData.user.id;
      console.log(`Created user ${userSpec.email} with ID: ${userId}`);
    }

    // 2. Check and upsert profile record
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error(`Error checking profile for ${userSpec.email}:`, profileErr.message);
      continue;
    }

    if (profile) {
      console.log(`Profile already exists for ${userSpec.email}. Updating...`);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          first_name: userSpec.firstName,
          last_name: userSpec.lastName,
          role: userSpec.role,
          company_name: userSpec.companyName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateErr) {
        console.error(`Error updating profile: ${updateErr.message}`);
      } else {
        console.log(`Profile updated successfully for ${userSpec.email} with role: ${userSpec.role}`);
      }
    } else {
      console.log(`Profile missing for ${userSpec.email}. Inserting...`);
      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: userSpec.firstName,
          last_name: userSpec.lastName,
          role: userSpec.role,
          company_name: userSpec.companyName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertErr) {
        console.error(`Error inserting profile: ${insertErr.message}`);
      } else {
        console.log(`Profile created successfully for ${userSpec.email} with role: ${userSpec.role}`);
      }
    }
  }

  console.log("Users setup complete!");
}

setupUsers();
