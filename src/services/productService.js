import { SUPABASE_CONFIG } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = async (productData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('Nenhum dado recebido do Supabase');
    }

    return data[0]; // Retorna o primeiro item do array
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw new Error(error.message || 'Falha ao criar produto');
  }
};

export const uploadProductImage = async (product, imageUri, index = 0) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    // Gerar nome único para cada imagem usando o índice
    const uniqueName = `${product.id}/${product.id}_${index}.jpg`;
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: uniqueName
    });

    // URL de upload (sem /public/)
    const uploadUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/product-images/${uniqueName}`;
    console.log('Uploading to:', uploadUrl);
    console.log('Headers:', {
      'apikey': SUPABASE_CONFIG.KEY,
      'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
    });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    console.log('Upload Response:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      headers: uploadResponse.headers,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload Error Response:', errorText);
      throw new Error(`Falha ao fazer upload da imagem: ${errorText}`);
    }

    // URL pública para salvar no banco
    const imageUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/product-images/${uniqueName}`;
    const imageResponse = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/product_images`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: uuidv4(),
        product_id: product.id,
        image_url: imageUrl
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image Record Error Response:', errorText);
      throw new Error(`Falha ao registrar imagem do produto: ${errorText}`);
    }

    return await imageResponse.json();
  } catch (error) {
    console.error('Erro detalhado ao fazer upload da imagem:', error);
    throw new Error(error.message || 'Falha ao fazer upload da imagem');
  }
};

export const uploadMultipleProductImages = async (product, imageUris) => {
  for (let i = 0; i < imageUris.length; i++) {
    await uploadProductImage(product, imageUris[i], i);
  }
};

export const fetchProducts = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/products?select=*,product_images:product_images(image_url,product_id)`, {
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
    // Ordena as imagens para garantir que a _0 seja a primeira
    return data.map(product => ({
      ...product,
      product_images: (product.product_images || []).sort((a, b) => {
        if (!a.image_url || !b.image_url) return 0;
        return a.image_url > b.image_url ? 1 : -1;
      })
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error(error.message || 'Falha ao buscar produtos');
  }
};

export const fetchProductById = async (productId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/products?id=eq.${productId}&select=*,product_images:product_images(image_url,product_id)`, {
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
    
    if (!data || data.length === 0) {
      throw new Error('Produto não encontrado');
    }

    // Ordena as imagens para garantir que a _0 seja a primeira
    const product = data[0];
    return {
      ...product,
      product_images: (product.product_images || []).sort((a, b) => {
        if (!a.image_url || !b.image_url) return 0;
        return a.image_url > b.image_url ? 1 : -1;
      })
    };
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    throw new Error(error.message || 'Falha ao buscar produto');
  }
}; 
