import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://etpzoshepfmulojhsupo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cHpvc2hlcGZtdWxvamhzdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3ODUsImV4cCI6MjA3OTg1Mzc4NX0.5i6RPsD0jjWU7mi5iuBTpwVazSW2XpJzWVYLZwWfr_w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('finance_transactions').select('*').limit(1);
  console.log('Transactions:', data, error);
}
run();
