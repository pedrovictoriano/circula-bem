import { create } from 'zustand';
import { fetchUserRents, getRentsByStatus, getRentStats } from '../services/rentService';

const useRentStore = create((set, get) => ({
  // Estado inicial
  rents: [],
  filteredRents: [],
  loading: false,
  refreshing: false,
  activeFilter: 'todos',
  stats: {
    total: 0,
    ativos: 0,
    finalizados: 0,
    pendentes: 0,
    cancelados: 0,
  },
  error: null,

  // Ações
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setError: (error) => set({ error }),
  
  // Carregar todos os aluguéis
  loadRents: async () => {
    try {
      set({ loading: true, error: null });
      
      console.log('🏪 RentStore: Iniciando carregamento de aluguéis...');
      
      const userRents = await fetchUserRents();
      console.log('🏪 RentStore: Aluguéis recebidos:', userRents);
      
      const stats = await getRentStats();
      console.log('🏪 RentStore: Estatísticas recebidas:', stats);
      
      set({ 
        rents: userRents,
        filteredRents: userRents,
        stats,
        loading: false 
      });
      
      console.log('✅ RentStore: Carregamento concluído com sucesso');
    } catch (error) {
      console.error('❌ RentStore: Erro ao carregar aluguéis:', error);
      
      let errorMessage = 'Não foi possível carregar seus aluguéis.';
      
      if (error.message.includes('not a function')) {
        errorMessage = 'Erro de estrutura de dados. Verifique a conectividade e tente novamente.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Erro de autenticação. Faça login novamente.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Tabela não encontrada. Verifique a estrutura do banco.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      });
    }
  },

  // Refresh dos dados
  refreshRents: async () => {
    try {
      set({ refreshing: true, error: null });
      const userRents = await fetchUserRents();
      const stats = await getRentStats();
      
      set({ 
        rents: userRents,
        filteredRents: userRents,
        stats,
        refreshing: false,
        activeFilter: 'todos'
      });
    } catch (error) {
      console.error('Erro ao atualizar aluguéis:', error);
      set({ 
        error: 'Erro ao atualizar dados.',
        refreshing: false 
      });
    }
  },

  // Filtrar aluguéis por status
  filterRents: async (filterType) => {
    try {
      set({ loading: true, activeFilter: filterType, error: null });
      
      if (filterType === 'todos') {
        const { rents } = get();
        set({ filteredRents: rents, loading: false });
      } else {
        const filteredRents = await getRentsByStatus(filterType);
        set({ filteredRents, loading: false });
      }
    } catch (error) {
      console.error('Erro ao filtrar aluguéis:', error);
      set({ 
        error: 'Não foi possível filtrar os aluguéis.',
        loading: false 
      });
    }
  },

  // Limpar erro
  clearError: () => set({ error: null }),

  // Reset do store
  reset: () => set({
    rents: [],
    filteredRents: [],
    loading: false,
    refreshing: false,
    activeFilter: 'todos',
    stats: { total: 0, ativos: 0, finalizados: 0, pendentes: 0, cancelados: 0 },
    error: null,
  }),
}));

export default useRentStore; 
