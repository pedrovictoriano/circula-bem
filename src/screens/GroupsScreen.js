import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SUPABASE_CONFIG } from '../config/env';
import useGroupStore from '../stores/groupStore';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);
  
  // Zustand store
  const {
    groups,
    allGroups,
    loading,
    error,
    loadUserGroups,
    loadAllGroups,
    refreshGroups,
    requestMembership,
    clearError
  } = useGroupStore();

  useEffect(() => {
    loadGroups();
  }, [showAllGroups]);

  const loadGroups = async () => {
    try {
      if (showAllGroups) {
        await loadAllGroups();
      } else {
        await loadUserGroups();
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      // Não mostrar erro se for simplesmente não haver grupos
      if (!error.message?.includes('Nenhum grupo encontrado')) {
        Alert.alert('Erro', 'Não foi possível carregar os grupos');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGroups();
      clearError();
    } catch (error) {
      console.error('Erro ao atualizar grupos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleJoinByInvite = () => {
    navigation.navigate('JoinGroupByLink');
  };

  const handleRequestMembership = async (groupId, groupName) => {
    Alert.alert(
      'Solicitar Participação',
      `Deseja solicitar participação no grupo "${groupName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              await requestMembership(groupId);
              Alert.alert('Sucesso', 'Solicitação enviada! Aguarde a aprovação dos administradores.');
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          }
        }
      ]
    );
  };

  const toggleGroupView = () => {
    setShowAllGroups(!showAllGroups);
  };

  const formatMemberCount = (count) => {
    if (count === 1) return '1 membro';
    return `${count} membros`;
  };

  const formatLastActivity = (date) => {
    if (!date) return 'recém criado';
    
    const today = new Date();
    const activityDate = new Date(date);
    const diffTime = Math.abs(today - activityDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return `${Math.floor(diffDays / 7)} semanas atrás`;
  };

  const getGroupImage = (imageUrl) => {
    console.log('🖼️ [getGroupImage] Processando imagem do grupo');
    console.log('🖼️ [getGroupImage] Input imageUrl:', imageUrl);
    console.log('🖼️ [getGroupImage] Tipo:', typeof imageUrl);
    console.log('🖼️ [getGroupImage] É string?', typeof imageUrl === 'string');
    console.log('🖼️ [getGroupImage] Está vazio?', !imageUrl || imageUrl.trim() === '');
    
    if (imageUrl && imageUrl.trim() !== '') {
      // Verificar se a URL já é completa (salva pelo uploadGroupImage)
      const isCompleteUrl = imageUrl.startsWith('http');
      console.log('🖼️ [getGroupImage] É URL completa (http)?', isCompleteUrl);
      
      if (isCompleteUrl) {
        console.log('✅ [getGroupImage] URL completa encontrada:', imageUrl);
        console.log('✅ [getGroupImage] Verificações da URL:');
        console.log('  - Contém group-images:', imageUrl.includes('group-images'));
        console.log('  - Contém storage/v1/object/public:', imageUrl.includes('storage/v1/object/public'));
        console.log('  - URL do Supabase correto:', imageUrl.includes(SUPABASE_CONFIG.URL));
        return { uri: imageUrl };
      }
      
      // Se não é uma URL completa, construir a URL do Supabase Storage usando a config
      const fullUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/group-images/${imageUrl}`;
      console.log('🔗 [getGroupImage] Construindo URL completa');
      console.log('🔗 [getGroupImage] SUPABASE_CONFIG.URL:', SUPABASE_CONFIG.URL);
      console.log('🔗 [getGroupImage] Caminho da imagem:', imageUrl);
      console.log('🔗 [getGroupImage] URL construída:', fullUrl);
      return { uri: fullUrl };
    }
    
    // Usar imagem placeholder para grupos sem foto
    console.log('📷 [getGroupImage] Usando placeholder para grupo sem imagem');
    const placeholderUrl = 'https://via.placeholder.com/120x120/E5E7EB/9CA3AF?text=Grupo';
    console.log('📷 [getGroupImage] URL do placeholder:', placeholderUrl);
    return { uri: placeholderUrl };
  };

  const getMembershipStatusBadge = (item) => {
    if (showAllGroups) {
      if (item.isMember && item.membershipStatus === 'ativo') {
        return (
          <View style={styles.memberBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.memberBadgeText}>Membro</Text>
          </View>
        );
      } else if (item.hasPendingRequest) {
        return (
          <View style={styles.pendingBadge}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#F59E0B" />
            <Text style={styles.pendingBadgeText}>Pendente</Text>
          </View>
        );
      } else {
        return (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleRequestMembership(item.id, item.name)}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#2563EB" />
            <Text style={styles.joinButtonText}>Solicitar</Text>
          </TouchableOpacity>
        );
      }
    }
    return null;
  };

  const renderGroupItem = ({ item }) => {
    console.log('🎨 [renderGroupItem] =========================');
    console.log('🎨 [renderGroupItem] Renderizando grupo:', item.name);
    console.log('🎨 [renderGroupItem] ID do grupo:', item.id);
    console.log('🎨 [renderGroupItem] image_url salva:', item.image_url);
    console.log('🎨 [renderGroupItem] isAdmin:', item.isAdmin);
    console.log('🎨 [renderGroupItem] isMember:', item.isMember);
    console.log('🎨 [renderGroupItem] memberCount:', item.memberCount);
    
    return (
      <TouchableOpacity 
        style={styles.groupCard}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      >
        <View style={styles.groupImageContainer}>
          <Image 
            source={getGroupImage(item.image_url)} 
            style={styles.groupImage}
            onError={(error) => {
              console.log('❌ [renderGroupItem] Erro ao carregar imagem do grupo:', item.name, error.nativeEvent.error);
              console.log('❌ [renderGroupItem] URL que falhou:', item.image_url);
            }}
            onLoad={() => {
              console.log('✅ [renderGroupItem] Imagem do grupo carregada com sucesso:', item.name);
              console.log('✅ [renderGroupItem] URL que funcionou:', item.image_url);
            }}
            onLoadStart={() => {
              console.log('⏳ [renderGroupItem] Iniciando carregamento da imagem:', item.name);
              console.log('⏳ [renderGroupItem] URL sendo carregada:', item.image_url);
            }}
          />
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFF" />
            </View>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.groupMeta}>
            <Text style={styles.memberCount}>
              {formatMemberCount(item.memberCount)}
            </Text>
            <Text style={styles.lastActivity}>
              • Criado {formatLastActivity(item.created_at)}
            </Text>
          </View>
        </View>
        
        <View style={styles.groupActions}>
          {getMembershipStatusBadge(item)}
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color="#9CA3AF" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="account-group-outline" 
        size={80} 
        color="#9CA3AF" 
      />
      <Text style={styles.emptyTitle}>
        {showAllGroups ? 'Nenhum grupo disponível' : 'Nenhum grupo encontrado'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {showAllGroups 
          ? 'Não há grupos criados na plataforma ainda. Seja o primeiro a criar um!'
          : 'Você ainda não faz parte de nenhum grupo. Crie um novo grupo ou explore grupos existentes.'
        }
      </Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
          <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
          <Text style={styles.createGroupButtonText}>Criar Grupo</Text>
        </TouchableOpacity>
        {!showAllGroups && (
          <TouchableOpacity style={styles.exploreButton} onPress={toggleGroupView}>
            <MaterialCommunityIcons name="compass" size={20} color="#2563EB" />
            <Text style={styles.exploreButtonText}>Explorar Grupos</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Carregando grupos...</Text>
    </View>
  );

  const getCurrentGroups = () => {
    return showAllGroups ? allGroups : groups;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {showAllGroups ? 'Todos os Grupos' : 'Meus Grupos'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleGroupView}>
            <MaterialCommunityIcons 
              name={showAllGroups ? "account-group" : "compass"} 
              size={24} 
              color="#6B7280" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inviteButton} onPress={handleJoinByInvite}>
            <MaterialCommunityIcons name="link" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
            <MaterialCommunityIcons name="plus" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      {!loading && getCurrentGroups().length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getCurrentGroups().length}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {showAllGroups 
                ? getCurrentGroups().filter(g => g.isMember).length
                : getCurrentGroups().filter(g => g.isAdmin).length
              }
            </Text>
            <Text style={styles.statLabel}>
              {showAllGroups ? 'Participo' : 'Admin'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {getCurrentGroups().reduce((sum, g) => sum + g.memberCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Membros</Text>
          </View>
        </View>
      )}

      {/* Groups List */}
      {loading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={getCurrentGroups()}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  inviteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  lastActivity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createGroupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    gap: 4,
  },
  memberBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    gap: 4,
  },
  pendingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    gap: 4,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default GroupsScreen; 
