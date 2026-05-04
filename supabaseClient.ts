
import { createClient } from '@supabase/supabase-js';

// Função para limpar e validar a URL
const prepareUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed === "" || !trimmed.startsWith('https://')) return null;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fallbackUrl = 'https://etpzoshepfmulojhsupo.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cHpvc2hlcGZtdWxvamhzdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3ODUsImV4cCI6MjA3OTg1Mzc4NX0.5i6RPsD0jjWU7mi5iuBTpwVazSW2XpJzWVYLZwWfr_w';

// Prepara as constantes finais
export const supabaseUrl = prepareUrl(rawUrl) || fallbackUrl;
export const supabaseKey = rawKey?.trim() || fallbackKey;

if (!rawUrl || !rawKey) {
    console.warn("Supabase: Usando chaves de fallback ou URL não configurada corretamente no menu Settings.");
} else if (rawUrl && !rawUrl.trim().startsWith('https://')) {
    console.error("Supabase: A VITE_SUPABASE_URL deve começar com https://. Verifique as configurações.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
