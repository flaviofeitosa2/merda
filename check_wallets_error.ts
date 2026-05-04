import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://etpzoshepfmulojhsupo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cHpvc2hlcGZtdWxvamhzdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3ODUsImV4cCI6MjA3OTg1Mzc4NX0.5i6RPsD0jjWU7mi5iuBTpwVazSW2XpJzWVYLZwWfr_w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'flaviofeitosa@gmail.com',
    password: 'password123'
  });
  
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    
    if (profile) {
      const payload = {
        name: 'TEST BANK 2',
        type: 'bank',
        color: '#000000',
        balance: 0,
        initial_balance: 0,
        closing_day: 1,
        due_day: 5,
        company_id: profile.company_id
      };
      const { error: walletError } = await supabase.from('wallets').insert([payload]);
      console.log('Wallet Error:', walletError);
    }
  } else {
    console.log('Auth Error:', error);
  }
}
run();
