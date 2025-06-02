import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../services/api';

const useUserStore = create((set, get) => ({
  // Estado inicial
  user: null,
  subscription: 'free', // 'free' ou 'pro'
  loading: false,
  error: null,

  // Ações
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Carregar dados do usuário
  loadUser: async () => {
    set({ loading: true, error: null });
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('🔍 [UserStore] Carregando usuário, userId:', userId);
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const userData = await fetchUserById(userId);
      console.log('📝 [UserStore] Dados do usuário recebidos:', userData);
      console.log('💳 [UserStore] Subscription no userData:', userData?.subscription);
      
      if (userData) {
        const subscription = userData.subscription || 'free';
        console.log('💳 [UserStore] Subscription final definida:', subscription);
        
        set({ 
          user: userData,
          subscription: subscription,
          loading: false 
        });
        
        console.log('✅ [UserStore] Store atualizada com sucesso');
        console.log('✅ [UserStore] isPro():', get().isPro());
        console.log('✅ [UserStore] isFree():', get().isFree());
      } else {
        throw new Error('Dados do usuário não encontrados');
      }
    } catch (error) {
      console.error('❌ [UserStore] Erro ao carregar usuário:', error);
      set({ 
        error: error.message,
        loading: false 
      });
    }
  },

  // Verificar se o usuário é PRO
  isPro: () => {
    const { subscription } = get();
    return subscription === 'pro';
  },

  // Verificar se o usuário é FREE
  isFree: () => {
    const { subscription } = get();
    return subscription === 'free';
  },

  // Atualizar assinatura
  updateSubscription: async (newSubscription) => {
    set({ loading: true, error: null });
    try {
      // Aqui você implementará a lógica para atualizar no backend
      // Por enquanto, apenas atualizamos localmente
      set({ 
        subscription: newSubscription,
        loading: false 
      });
      
      // Atualizar também no objeto user
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { 
            ...currentUser, 
            subscription: newSubscription 
          } 
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      set({ 
        error: error.message,
        loading: false 
      });
    }
  },

  // Limpar dados do usuário (logout)
  clearUser: () => set({
    user: null,
    subscription: 'free',
    loading: false,
    error: null,
  }),

  // Limpar erro
  clearError: () => set({ error: null }),

  // FUNÇÃO DE TESTE - Remover em produção
  // Simula mudança de assinatura para facilitar testes
  simulateSubscriptionChange: (newSubscription = 'pro') => {
    console.log(`🔄 [TESTE] Simulando mudança de assinatura para: ${newSubscription}`);
    
    const currentUser = get().user;
    set({ 
      subscription: newSubscription,
      user: currentUser ? { ...currentUser, subscription: newSubscription } : null
    });
    
    console.log(`✅ [TESTE] Assinatura alterada para: ${newSubscription}`);
    console.log(`✅ [TESTE] isPro(): ${get().isPro()}`);
    console.log(`✅ [TESTE] isFree(): ${get().isFree()}`);
  },
}));

export default useUserStore; 
