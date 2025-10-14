const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  try {
    console.log('🔄 Starting admin user seeding...');

    const adminEmail = 'admin@vaultguard.com';
    const adminPassword = 'VaultGuard@Admin2024!';

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists. Skipping seed.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@vaultguard.com');
      console.log('🔑 Password: VaultGuard@Admin2024!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const { data: adminUser, error } = await supabase
      .from('users')
      .insert([{
        email: adminEmail,
        password_hash: passwordHash,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        status: 'active',
        email_verified: true,
        two_factor_enabled: false,
        jurisdiction: 'US',
        phone_number: '+1-555-0100',
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (adminUser) {
      console.log('✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@vaultguard.com');
      console.log('🔑 Password: VaultGuard@Admin2024!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log('✅ Admin seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin seeding failed:', error);
    process.exit(1);
  });