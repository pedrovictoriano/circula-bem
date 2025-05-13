import {
  getTable,
  insertIntoTable,
  updateTableById,
  deleteFromTableById
} from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gcwjfkswymioiwhuaiku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2pma3N3eW1pb2l3aHVhaWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjc1OTUsImV4cCI6MjA2MDUwMzU5NX0.h8ciNTFQpAoHB0Tik8ktUDvpJR-FzsWFGrQo1uN3MFQ'; // substitua pela real

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

export const fetchUserById = async (registrationNumber) => {
  const result = await getTable('user_extra_information', `registration_number=eq.${registrationNumber}`);
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

  const userId = authData.user?.id;

  await insertIntoTable('user_extra_information', {
    user_id: userId,
    first_name: name,
    last_name: surName,
    registration_number: regNum,
    address_cep: address.cep,
    address_state: address.state,
    address_city: address.city,
    address_neighborhood: address.neighborhood,
    address_street: address.street,
    address_number: address.number,
    address_complement: address.complement
  });

  return { userId };
};

export const authenticateUser = async ({ email, password }) => {
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
  const user = data.user;

  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('userId', user.id);

  return { token, user };
};
