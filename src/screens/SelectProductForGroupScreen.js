import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchUserProducts } from '../services/productService';
import { shareProductWithGroup } from '../services/groupService';

const SelectProductForGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const userProducts = await fetchUserProducts();
      setProducts(userProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar seus produtos. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleShareProducts = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um produto para compartilhar.');
      return;
    }

    Alert.alert(
      'Compartilhar Produtos',
      `Deseja compartilhar ${selectedProducts.length} produto(s) no grupo "${groupName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Compartilhar',
          onPress: async () => {
            try {
              setSharing(true);
              
              // Compartilhar cada produto selecionado
              const promises = selectedProducts.map(productId => 
                shareProductWithGroup(productId, groupId)
              );
              
              await Promise.all(promises);
              
              Alert.alert(
                'Sucesso!',
                `${selectedProducts.length} produto(s) compartilhado(s) com sucesso! ` +
                'Os administradores do grupo irão revisar sua solicitação.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('GroupDetail', { groupId });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Erro', error.message || 'Não foi possível compartilhar os produtos');
            } finally {
              setSharing(false);
            }
          }
        }
      ]
    );
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const renderProductItem = ({ item }) => {
    const isSelected = selectedProducts.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, isSelected && styles.productCardSelected]} 
        onPress={() => toggleProductSelection(item.id)}
      >
        {/* Checkbox de seleção */}
        <View style={styles.selectionContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
            )}
          </View>
        </View>

        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.price}>{item.priceFormatted}/dia</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="package-variant-closed" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
      <Text style={styles.emptySubtitle}>
        Você precisa ter produtos cadastrados para compartilhá-los em grupos.
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
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Selecionar Produtos</Text>
          <Text style={styles.subtitle}>para {groupName}</Text>
        </View>
        <View style={styles.headerRight}>
          {selectedProducts.length > 0 && (
            <Text style={styles.selectionCount}>{selectedProducts.length}</Text>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Action Bar */}
          {products.length > 0 && (
            <View style={styles.bottomBar}>
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionText}>
                  {selectedProducts.length} de {products.length} produtos selecionados
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.shareButton, 
                  selectedProducts.length === 0 && styles.shareButtonDisabled
                ]}
                onPress={handleShareProducts}
                disabled={selectedProducts.length === 0 || sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="share" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.shareButtonText}>
                  {sharing ? 'Compartilhando...' : 'Compartilhar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  },
  headerTitle: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  selectionCount: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 24,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Espaço para a bottom bar
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  selectionContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
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
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionInfo: {
    flex: 1,
  },
  selectionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
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

export default SelectProductForGroupScreen; 
