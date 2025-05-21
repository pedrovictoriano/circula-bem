import { SUPABASE_CONFIG } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchCategories = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/categories?select=*&order=description.asc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('Nenhum dado recebido do Supabase');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw new Error(error.message || 'Falha ao buscar categorias');
  }
}; 
