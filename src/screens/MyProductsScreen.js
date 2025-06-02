import React, { useEffect, useState, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchUserProducts, getUserProductStats } from '../services/productService';

const MyProductsScreen = () => {
  const navigation = useNavigation();
  const isInitialLoad = useRef(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRents: 0,
    activeRents: 0,
    totalEarnings: 0,
    totalEarningsFormatted: 'R$ 0,00'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  // Listener de navegação para recarregar quando voltar de outras telas
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Só recarrega se não for a primeira vez (já carregou no useEffect acima)
      if (!isInitialLoad.current && !loading && !refreshing) {
        console.log('🔄 Recarregando produtos após voltar para a tela');
        loadProducts();
      }
    });

    return unsubscribe;
  }, [navigation, loading, refreshing]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const userProducts = await fetchUserProducts();
      const productStats = await getUserProductStats();
      
      setProducts(userProducts);
      setStats(productStats);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar seus produtos. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      // Marcar que o load inicial foi concluído
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const handleProductPress = (product) => {
    // Navegar para detalhes do produto ou tela de gerenciamento
    Alert.alert('Produto', `Você selecionou: ${product.name}`);
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar-check" size={16} color="#10B981" />
            <Text style={styles.statText}>{item.stats.totalRents} aluguéis</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#F59E0B" />
            <Text style={styles.statText}>{item.stats.activeRents} ativos</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.priceFormatted}</Text>
          <Text style={styles.earnings}>Ganhos: {item.stats.totalEarningsFormatted}</Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewProduct(item)}>
          <MaterialCommunityIcons name="eye" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditProduct(item)}>
          <MaterialCommunityIcons name="pencil" size={20} color="#6B7280" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Resumo dos Meus Produtos</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="package-variant" size={24} color="#2563EB" />
          <Text style={styles.statNumber}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Produtos</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar-multiple" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.totalRents}</Text>
          <Text style={styles.statLabel}>Total Aluguéis</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.activeRents}</Text>
          <Text style={styles.statLabel}>Ativos Agora</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#059669" />
          <Text style={styles.statNumber}>{stats.totalEarningsFormatted}</Text>
          <Text style={styles.statLabel}>Ganhos Totais</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="package-variant-closed" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
      <Text style={styles.emptySubtitle}>
        Comece cadastrando seus primeiros produtos para aluguel!
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProduct}>
        <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Cadastrar Produto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Produtos</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={() => navigation.navigate('RentManagement')}
          >
            <MaterialCommunityIcons name="clipboard-check" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateProduct}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#2563EB" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={products.length > 0 ? renderStatsHeader : null}
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
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  productCard: {
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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  productStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  earnings: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  productActions: {
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
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
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyProductsScreen; 
