import {
  getTable,
  insertIntoTable,
  updateTableById,
  deleteFromTableById
} from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SUPABASE_URL = 'https://gcwjfkswymioiwhuaiku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2pma3N3eW1pb2l3aHVhaWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjc1OTUsImV4cCI6MjA2MDUwMzU5NX0.h8ciNTFQpAoHB0Tik8ktUDvpJR-FzsWFGrQo1uN3MFQ';

export const fetchUserById = async (userId) => {
  const result = await getTable('user_extra_information', `user_id=eq.${userId}`);
	const addresses = await getTable('addresses', `user_id=eq.${userId}`);
	result[0].addresses = addresses;
  return result?.[0] || null;
	
};

export const fetchRentedDates = async (productId, startDate, endDate) => {
  const filter = `product_id=eq.${productId}&start_date=gte.${startDate}&end_date=lte.${endDate}`;
  return await getTable('rentals', filter);
};

export const createRental = async (rentalData) => {
  return await insertIntoTable('rentals', rentalData);
};

export const registerUser = async ({ email, pwd, name, surName, regNum, address }) => {
  const userData = {
    email,
    password: pwd
  };

  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const authData = await authResponse.json();
  if (!authResponse.ok) throw new Error(authData?.msg || 'Erro ao registrar');

  const userId = authData.user?.id || authData.id;

  await insertIntoTable('user_extra_information', {
    user_id: userId,
    first_name: name,
    last_name: surName,
    registration_number: regNum,
  });

	await insertIntoTable('addresses', {
    user_id: userId,
    cep: address.cep,
    state: address.state,
    city: address.city,
    neighborhood: address.neighborhood,
    street: address.street,
    number: address.number,
    complement: address.complement
  });

  return { userId };
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.msg || 'Erro de autenticação');

    const token = data.access_token;

    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    const userData = await userResponse.json();

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userId', userData.id);

    return { token, user: userData };
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    throw error;
  }
};

export const fetchAddressByCEP = async (cep) => {
  try {
    const cleanCEP = cep.replace(/\D/g, '');
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf,
    };
  } catch (error) {
    throw new Error('Erro ao buscar CEP: ' + error.message);
  }
};
