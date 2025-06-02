import { SUPABASE_CONFIG } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { getTable } from './supabaseClient';
import { formatPrice, formatTotalAmount } from '../utils/priceUtils';

export const createProduct = async (productData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    console.log('Criando produto com dados:', productData);
    console.log('Token usado:', token ? 'Token presente' : 'Usando apikey');
    
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

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Erro detalhado do servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('Erro JSON parseado:', errorData);
        throw new Error(`Erro HTTP ${response.status}: ${errorData.message || errorData.details || errorText}`);
      } catch (parseError) {
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('Nenhum dado recebido do Supabase');
    }

    console.log('Produto criado com sucesso:', data);
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

export const fetchUserProducts = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando produtos do usuário:', userId);

    // Buscar produtos do usuário
    const productsQuery = `user_id=eq.${userId}&select=id,name,description,price,category_id`;
    const products = await getTable('products', productsQuery);
    
    if (!products || !Array.isArray(products)) {
      console.log('⚠️ Nenhum produto encontrado');
      return [];
    }

    console.log(`✅ Encontrados ${products.length} produtos`);

    // Para cada produto, buscar categoria e imagens
    const processedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Buscar categoria
          const categoryQuery = `id=eq.${product.category_id}&select=description,image_url`;
          const categories = await getTable('categories', categoryQuery);
          const category = categories && categories.length > 0 ? categories[0] : null;

          // Buscar imagens do produto
          const imagesQuery = `product_id=eq.${product.id}&select=image_url`;
          const images = await getTable('product_images', imagesQuery);

          // Buscar estatísticas de aluguel
          const rentStatsQuery = `product_id=eq.${product.id}&select=id,status,dates`;
          const rents = await getTable('rents', rentStatsQuery);
          
          // Calcular estatísticas
          let totalRents = 0;
          let activeRents = 0;
          let totalEarnings = 0;

          if (rents && Array.isArray(rents)) {
            totalRents = rents.length;
            activeRents = rents.filter(rent => 
              rent.status === 'confirmado' || rent.status === 'em andamento'
            ).length;
            
            // Calcular ganhos (aproximado baseado nas datas)
            rents.forEach(rent => {
              if (rent.dates && Array.isArray(rent.dates)) {
                totalEarnings += rent.dates.length * parseFloat(product.price);
              }
            });
          }

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            priceFormatted: formatPrice(product.price, true),
            category: category ? category.description : 'Categoria não definida',
            image: images && images.length > 0 ? images[0].image_url : 'https://via.placeholder.com/80x80',
            images: images ? images.map(img => img.image_url) : [],
            stats: {
              totalRents,
              activeRents,
              totalEarnings: totalEarnings.toFixed(2),
              totalEarningsFormatted: formatTotalAmount(totalEarnings)
            }
          };
        } catch (error) {
          console.error(`❌ Erro ao processar produto ${product.id}:`, error);
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            priceFormatted: formatPrice(product.price, true),
            category: 'Categoria não definida',
            image: 'https://via.placeholder.com/80x80',
            images: [],
            stats: {
              totalRents: 0,
              activeRents: 0,
              totalEarnings: '0.00',
              totalEarningsFormatted: formatTotalAmount(0)
            }
          };
        }
      })
    );

    return processedProducts;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos do usuário:', error);
    throw error;
  }
};

export const getUserProductStats = async () => {
  try {
    const products = await fetchUserProducts();
    
    const stats = {
      totalProducts: products.length,
      totalRents: products.reduce((sum, product) => sum + product.stats.totalRents, 0),
      activeRents: products.reduce((sum, product) => sum + product.stats.activeRents, 0),
      totalEarnings: products.reduce((sum, product) => sum + parseFloat(product.stats.totalEarnings), 0),
    };

    return {
      ...stats,
      totalEarningsFormatted: formatTotalAmount(stats.totalEarnings)
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas dos produtos:', error);
    throw error;
  }
}; 
