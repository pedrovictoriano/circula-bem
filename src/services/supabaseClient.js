const SUPABASE_URL = 'https://gcwjfkswymioiwhuaiku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2pma3N3eW1pb2l3aHVhaWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjc1OTUsImV4cCI6MjA2MDUwMzU5NX0.h8ciNTFQpAoHB0Tik8ktUDvpJR-FzsWFGrQo1uN3MFQ'; // Substitua pela sua chave ou use dotenv

export async function getTable(table, filters = '') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return response.json();
}

export async function insertIntoTable(table, data) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Erro ao inserir na tabela "${table}": ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro em insertIntoTable:', error);
    throw error;
  }
}


export async function updateTableById(table, id, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteFromTableById(table, id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return response.ok;
}
