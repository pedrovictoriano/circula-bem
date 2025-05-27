import { insertIntoTable, getTable } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// ATENÇÃO: Este arquivo é apenas para demonstração
// Execute apenas se necessário para testes
export const insertTestRentData = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Inserindo dados de teste para o usuário:', userId);

    // Primeiro, vamos criar algumas categorias de teste (se não existirem)
    const testCategories = [
      {
        description: 'Ferramentas',
        image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
      },
      {
        description: 'Eletrônicos',
        image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
      }
    ];

    // Inserir categorias e obter IDs
    const categoryIds = [];
    for (const category of testCategories) {
      try {
        const result = await insertIntoTable('categories', category);
        categoryIds.push(result[0].id);
        console.log('Categoria inserida:', category.description, result[0].id);
      } catch (error) {
        // Se categoria já existe, buscar ID
        try {
          const existing = await getTable('categories', `description=eq.${category.description}`);
          if (existing && existing.length > 0) {
            categoryIds.push(existing[0].id);
            console.log('Categoria existente encontrada:', category.description, existing[0].id);
          }
        } catch (err) {
          console.log('Erro ao buscar categoria existente:', err);
        }
      }
    }

    // Produtos de exemplo
    const testProducts = [];
    if (categoryIds.length > 0) {
      const productsData = [
        {
          name: 'Furadeira Bosch',
          description: 'Furadeira elétrica profissional com kit de brocas',
          price: 25.00,
          category_id: categoryIds[0],
          availabilities: ['segunda', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira'],
          user_id: userId
        },
        {
          name: 'Martelo de Impacto',
          description: 'Martelo de impacto para trabalhos pesados',
          price: 15.00,
          category_id: categoryIds[0],
          availabilities: ['segunda', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
          user_id: userId
        }
      ];

      // Inserir produtos
      for (const productData of productsData) {
        try {
          const result = await insertIntoTable('products', { ...productData, id: uuidv4() });
          testProducts.push(result[0]);
          console.log('Produto inserido:', productData.name, result[0].id);

          // Inserir imagem de exemplo para o produto
          await insertIntoTable('product_images', {
            id: uuidv4(),
            product_id: result[0].id,
            image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
          });
        } catch (error) {
          console.log('Erro ao inserir produto:', productData.name, error);
        }
      }
    }

    // Criar aluguéis de exemplo com a nova estrutura
    if (testProducts.length > 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);

      const testRentals = [
        {
          id: uuidv4(),
          product_id: testProducts[0].id,
          user_id: userId,
          dates: [
            today.toISOString().split('T')[0],
            tomorrow.toISOString().split('T')[0]
          ],
          status: 'confirmado',
          total_amount: Math.round(testProducts[0].price * 2 * 100) // 2 dias em centavos
        },
        {
          id: uuidv4(),
          product_id: testProducts[1] ? testProducts[1].id : testProducts[0].id,
          user_id: userId,
          dates: [
            dayAfterTomorrow.toISOString().split('T')[0]
          ],
          status: 'pendente',
          total_amount: Math.round((testProducts[1] ? testProducts[1].price : testProducts[0].price) * 1 * 100) // 1 dia em centavos
        }
      ];

      // Inserir aluguéis
      for (const rental of testRentals) {
        try {
          const result = await insertIntoTable('rents', rental);
          console.log('Aluguel inserido:', result);
        } catch (error) {
          console.log('Erro ao inserir aluguel:', error);
        }
      }
    }

    console.log('Dados de teste inseridos com sucesso!');
    
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error);
  }
};

// Função para limpar dados de teste (use com cuidado!)
export const clearTestData = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('ATENÇÃO: Removendo dados de teste para o usuário:', userId);
    
    // Remover aluguéis do usuário
    const rents = await getTable('rents', `user_id=eq.${userId}`);
    for (const rent of rents) {
      // Aqui você implementaria a função de delete
      console.log('Aluguel a ser removido:', rent.id);
    }
    
    console.log('Dados de teste removidos!');
  } catch (error) {
    console.error('Erro ao remover dados de teste:', error);
  }
}; 
