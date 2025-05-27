// Fallback values for development
const DEFAULT_SUPABASE_URL = 'https://gcwjfkswymioiwhuaiku.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2pma3N3eW1pb2l3aHVhaWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjc1OTUsImV4cCI6MjA2MDUwMzU5NX0.h8ciNTFQpAoHB0Tik8ktUDvpJR-FzsWFGrQo1uN3MFQ';

// Debug das variáveis de ambiente
console.log('🔧 Carregando configuração do Supabase...');
console.log('process.env.SUPABASE_URL:', process.env.SUPABASE_URL ? 'Definido' : 'Undefined');
console.log('process.env.SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Definido' : 'Undefined');

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
  KEY: process.env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY
};

console.log('✅ Configuração final do Supabase:', {
  URL: SUPABASE_CONFIG.URL ? 'Configurado' : 'UNDEFINED',
  KEY: SUPABASE_CONFIG.KEY ? 'Configurado' : 'UNDEFINED'
}); 
