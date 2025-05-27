import { create } from 'zustand';
import { 
  fetchUserGroups, 
  fetchAllGroups,
  createGroup, 
  uploadGroupImage, 
  updateGroup,
  requestGroupMembership,
  fetchPendingMemberships,
  approveGroupMembership,
  rejectGroupMembership
} from '../services/groupService';

const useGroupStore = create((set, get) => ({
  // State
  groups: [],
  allGroups: [],
  pendingMemberships: [],
  loading: false,
  error: null,
  selectedGroup: null,

  // Actions
  setGroups: (groups) => set({ groups }),
  setAllGroups: (allGroups) => set({ allGroups }),
  setPendingMemberships: (pendingMemberships) => set({ pendingMemberships }),
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

  // Fetch all groups (including ones user is not a member of)
  loadAllGroups: async () => {
    set({ loading: true, error: null });
    try {
      const allGroups = await fetchAllGroups();
      set({ allGroups, loading: false });
      return allGroups;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Request group membership
  requestMembership: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const result = await requestGroupMembership(groupId);
      
      // Update the specific group in allGroups to reflect the pending request
      const currentAllGroups = get().allGroups;
      const updatedAllGroups = currentAllGroups.map(group => 
        group.id === groupId 
          ? { ...group, hasPendingRequest: true, membershipStatus: 'pendente' }
          : group
      );
      
      set({ allGroups: updatedAllGroups, loading: false });
      return result;
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
      console.log('🏪 Store: ImageUri fornecida:', imageUri ? 'SIM' : 'NÃO');
      
      // Create group
      const newGroup = await createGroup(groupData);
      console.log('🏪 Store: Grupo criado com sucesso:', newGroup);
      console.log('🏪 Store: ID do grupo criado:', newGroup.id);
      
      // Upload image if provided
      if (imageUri) {
        console.log('🏪 Store: Fazendo upload da imagem...');
        console.log('🏪 Store: GroupId para upload:', newGroup.id);
        console.log('🏪 Store: ImageUri para upload:', imageUri);
        
        const imageUrl = await uploadGroupImage(newGroup.id, imageUri);
        
        console.log('🏪 Store: Upload da imagem concluído');
        console.log('🏪 Store: URL retornada pelo upload:', imageUrl);
        
        // Atualizar a URL da imagem no objeto do grupo LOCAL
        newGroup.image_url = imageUrl;
        console.log('🏪 Store: Objeto do grupo atualizado localmente com image_url:', newGroup.image_url);
        
        // Também atualizar no banco de dados
        try {
          console.log('🏪 Store: Atualizando grupo no banco com a URL da imagem');
          await updateGroup(newGroup.id, { image_url: imageUrl });
          console.log('🏪 Store: Grupo atualizado no banco com sucesso');
          console.log('🏪 Store: URL salva no banco:', imageUrl);
        } catch (updateError) {
          console.error('⚠️ Store: Erro ao atualizar grupo no banco:', updateError);
          console.error('⚠️ Store: Mesmo com erro, continuando - o grupo foi criado');
          // Não falhar o processo, pois o grupo já foi criado
        }
      } else {
        console.log('🏪 Store: Nenhuma imagem para upload');
      }

      // Add to current groups list with proper formatting
      const currentGroups = get().groups;
      const enrichedGroup = {
        ...newGroup,
        isAdmin: true,
        memberCount: 1,
        lastActivity: newGroup.created_at
      };
      
      console.log('🏪 Store: Grupo enriquecido para lista:', {
        id: enrichedGroup.id,
        name: enrichedGroup.name,
        image_url: enrichedGroup.image_url,
        isAdmin: enrichedGroup.isAdmin,
        memberCount: enrichedGroup.memberCount
      });
      
      const updatedGroups = [enrichedGroup, ...currentGroups];
      set({ groups: updatedGroups, loading: false });
      
      console.log('🏪 Store: Grupo adicionado à lista local');
      console.log('🏪 Store: Total de grupos na lista:', updatedGroups.length);
      
      return enrichedGroup;
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

  // Refresh all groups
  refreshAllGroups: async () => {
    try {
      const allGroups = await fetchAllGroups();
      set({ allGroups });
      return allGroups;
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
    allGroups: [],
    pendingMemberships: [],
    loading: false,
    error: null,
    selectedGroup: null,
  }),

  // Fetch pending memberships for a group (admin only)
  loadPendingMemberships: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const pendingMemberships = await fetchPendingMemberships(groupId);
      set({ pendingMemberships, loading: false });
      return pendingMemberships;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Approve membership request
  approveMembership: async (membershipId, groupId) => {
    set({ loading: true, error: null });
    try {
      await approveGroupMembership(membershipId, groupId);
      
      // Remove from pending memberships list
      const currentPending = get().pendingMemberships;
      const updatedPending = currentPending.filter(m => m.id !== membershipId);
      set({ pendingMemberships: updatedPending, loading: false });
      
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reject membership request
  rejectMembership: async (membershipId, groupId) => {
    set({ loading: true, error: null });
    try {
      await rejectGroupMembership(membershipId, groupId);
      
      // Remove from pending memberships list
      const currentPending = get().pendingMemberships;
      const updatedPending = currentPending.filter(m => m.id !== membershipId);
      set({ pendingMemberships: updatedPending, loading: false });
      
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export default useGroupStore; 
