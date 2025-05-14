import {
  getTable,
  insertIntoTable,
  updateTableById,
  deleteFromTableById
} from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gcwjfkswymioiwhuaiku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2pma3N3eW1pb2l3aHVhaWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjc1OTUsImV4cCI6MjA2MDUwMzU5NX0.h8ciNTFQpAoHB0Tik8ktUDvpJR-FzsWFGrQo1uN3MFQ';

export const fetchProducts = async () => {
  return await getTable('products');
};

export const fetchProductById = async (id) => {
  const result = await getTable('products', `id=eq.${id}`);
  return result?.[0] || null;
};

export const fetchCategories = async () => {
  return await getTable('categories');
};

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
    cep: addresses.cep,
    state: addresses.state,
    city: addresses.city,
    neighborhood: addresses.neighborhood,
    street: addresses.street,
    number: addresses.number,
    complement: addresses.complement
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
