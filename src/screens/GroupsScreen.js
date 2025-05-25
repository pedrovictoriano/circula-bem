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
import useGroupStore from '../stores/groupStore';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  // Zustand store
  const {
    groups,
    loading,
    error,
    loadUserGroups,
    refreshGroups,
    clearError
  } = useGroupStore();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      await loadUserGroups();
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      // Não mostrar erro se for simplesmente não haver grupos
      if (!error.message?.includes('Nenhum grupo encontrado')) {
        Alert.alert('Erro', 'Não foi possível carregar seus grupos');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGroups();
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
    if (imageUrl) {
      return { uri: imageUrl };
    }
    // Usar uma imagem placeholder padrão
    return { uri: 'https://via.placeholder.com/120x120/E5E7EB/9CA3AF?text=Grupo' };
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupImageContainer}>
        <Image 
          source={getGroupImage(item.image_url)} 
          style={styles.groupImage}
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
      
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={24} 
        color="#9CA3AF" 
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="account-group-outline" 
        size={80} 
        color="#9CA3AF" 
      />
      <Text style={styles.emptyTitle}>Nenhum grupo encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Você ainda não faz parte de nenhum grupo. Crie um novo grupo ou solicite para participar de grupos existentes.
      </Text>
      <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
        <Text style={styles.createGroupButtonText}>Criar Grupo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Carregando grupos...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meus Grupos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialCommunityIcons name="magnify" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
            <MaterialCommunityIcons name="plus" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      {!loading && groups.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {groups.filter(g => g.isAdmin).length}
            </Text>
            <Text style={styles.statLabel}>Admin</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {groups.reduce((sum, g) => sum + g.memberCount, 0)}
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
          data={groups}
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
  searchButton: {
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
});

export default GroupsScreen; 
