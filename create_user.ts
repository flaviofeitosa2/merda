import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://etpzoshepfmulojhsupo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cHpvc2hlcGZtdWxvamhzdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3ODUsImV4cCI6MjA3OTg1Mzc4NX0.5i6RPsD0jjWU7mi5iuBTpwVazSW2XpJzWVYLZwWfr_w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test_wallet_2@example.com',
    password: 'password123'
  });
  
  if (data.user) {
    const { data: company, error: companyError } = await supabase.from('companies').insert([{
      name: 'Test Company'
    }]).select().single();
    
    console.log('Company:', company?.id, companyError?.message);
    
    if (company) {
      const { error: profileError } = await supabase.from('user_profiles').insert([{
        id: data.user.id,
        company_id: company.id,
        role: 'admin',
        full_name: 'Test User'
      }]);
      console.log('Profile:', profileError?.message);
      
      const { error: walletError } = await supabase.from('wallets').insert([{
        name: 'TEST BANK',
        type: 'bank',
        color: '#000000',
        balance: 0,
        initial_balance: 0,
        closing_day: 1,
        due_day: 5,
        company_id: company.id
      }]);
      console.log('Wallet Error:', walletError);
    }
  }
}
run();
