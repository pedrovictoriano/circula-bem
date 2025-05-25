import {
  getTable,
  insertIntoTable,
  updateTableById,
  deleteFromTableById
} from './supabaseClient';
import { SUPABASE_CONFIG } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = SUPABASE_CONFIG.URL;
const SUPABASE_KEY = SUPABASE_CONFIG.KEY;

// Exportar configuração para compatibilidade
export { SUPABASE_CONFIG };

export const fetchUserById = async (userId) => {
  const result = await getTable('user_extra_information', `user_id=eq.${userId}`);
	const addresses = await getTable('addresses', `user_id=eq.${userId}`);
	result[0].addresses = addresses;
  return result?.[0] || null;
	
};

export const fetchRentedDates = async (productId, startDate, endDate) => {
  // Usar a nova função do rentService
  const { fetchRentedDatesForProduct } = require('./rentService');
  try {
    const result = await fetchRentedDatesForProduct(productId, startDate, endDate);
    console.log('Rented dates result:', result);
    return result || [];
  } catch (error) {
    console.error('Error fetching rented dates:', error);
    return [];
  }
};

export const createRental = async (rentalData) => {
  return await insertIntoTable('rents', rentalData);
};

// Função atualizada para criar um único aluguel com múltiplas datas
export const createSingleRentalWithDates = async (productId, userId, selectedDates, productPrice) => {
  try {
    console.log('Creating single rental with multiple dates:', { productId, userId, selectedDates });
    
    // Calcular o valor total (em centavos para evitar problemas de ponto flutuante)
    const totalAmount = Math.round(productPrice * selectedDates.length * 100);
    
    const rentalData = {
      id: uuidv4(),
      product_id: productId,
      user_id: userId,
      dates: selectedDates, // Array de datas
      status: 'pendente', // Status inicial
      total_amount: totalAmount // Valor em centavos
    };
    
    console.log('Creating rental with data:', rentalData);
    const result = await insertIntoTable('rents', rentalData);
    console.log('Rental created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

// Manter compatibilidade com função antiga (deprecated)
export const createMultipleRentals = async (productId, userId, selectedDates, productPrice = 0) => {
  console.warn('createMultipleRentals is deprecated. Use createSingleRentalWithDates instead.');
  return await createSingleRentalWithDates(productId, userId, selectedDates, productPrice);
};

// Função para atualizar status de um aluguel
export const updateRentalStatus = async (rentalId, newStatus) => {
  try {
    const result = await updateTableById('rents', rentalId, { status: newStatus });
    console.log('Rental status updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating rental status:', error);
    throw error;
  }
};

export const registerUser = async ({ email, pwd, name, surName, regNum, address, imageUrl = null }) => {
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
    image_url: imageUrl
  },
  false);

	await insertIntoTable('addresses', {
    user_id: userId,
    cep: address.cep,
    state: address.state,
    city: address.city,
    neighborhood: address.neighborhood,
    street: address.street,
    number: address.number,
    complement: address.complement
  },
  false);

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
