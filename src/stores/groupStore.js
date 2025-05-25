import { create } from 'zustand';
import { fetchUserGroups, createGroup, uploadGroupImage } from '../services/groupService';

const useGroupStore = create((set, get) => ({
  // State
  groups: [],
  loading: false,
  error: null,
  selectedGroup: null,

  // Actions
  setGroups: (groups) => set({ groups }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  // Fetch user groups
  loadUserGroups: async () => {
    set({ loading: true, error: null });
    try {
      const groups = await fetchUserGroups();
      set({ groups, loading: false });
      return groups;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create new group
  createNewGroup: async (groupData, imageUri = null) => {
    set({ loading: true, error: null });
    try {
      console.log('🏪 Store: Iniciando criação de grupo:', groupData);
      
      // Create group
      const newGroup = await createGroup(groupData);
      console.log('🏪 Store: Grupo criado com sucesso:', newGroup);
      
      // Upload image if provided
      if (imageUri) {
        console.log('🏪 Store: Fazendo upload da imagem...');
        const imageUrl = await uploadGroupImage(newGroup.id, imageUri);
        newGroup.image_url = imageUrl;
        console.log('🏪 Store: Upload da imagem concluído:', imageUrl);
      }

      // Add to current groups list
      const currentGroups = get().groups;
      const updatedGroups = [{
        ...newGroup,
        isAdmin: true,
        memberCount: 1,
        lastActivity: newGroup.created_at
      }, ...currentGroups];
      
      set({ groups: updatedGroups, loading: false });
      console.log('🏪 Store: Grupo adicionado à lista local');
      
      return newGroup;
    } catch (error) {
      console.error('🏪 Store: Erro ao criar grupo:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Refresh groups
  refreshGroups: async () => {
    try {
      const groups = await fetchUserGroups();
      set({ groups });
      return groups;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    groups: [],
    loading: false,
    error: null,
    selectedGroup: null,
  }),
}));

export default useGroupStore; 
