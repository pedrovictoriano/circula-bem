import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchCategories } from '../services/categoryService';
import { fetchProducts } from '../services/productService';
import { fetchUserById } from '../services/api';
import ProfileImage from '../components/ProfileImage';

const INFO_CARDS = [
  { icon: 'clock-outline', label: 'Ativos', value: 5 },
  { icon: 'timer-sand', label: 'Pendentes', value: 2 },
  { icon: 'clipboard-list-outline', label: 'Total', value: 12 },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados do usuário
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await fetchUserById(userId);
        setUserData(user);
        setUserName(user ? `${user.first_name} ${user.last_name}` : '');
      }
      
      const cats = await fetchCategories();
      setCategories(cats);
      const prods = await fetchProducts();
      setProducts(prods);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <ProfileImage
            imageUrl={userData?.image_url}
            size={40}
            borderWidth={2}
            borderColor="#fff"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcons name="bell-outline" size={26} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcons name="cog-outline" size={26} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#B0B0B0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Info Cards */}
      <View style={styles.infoCardsRow}>
        {INFO_CARDS.map((card, idx) => (
          <View key={idx} style={styles.infoCard}>
            <View style={styles.infoCardIconWrap}>
              <MaterialCommunityIcons name={card.icon} size={28} color="#4F8CFF" />
            </View>
            <Text style={styles.infoCardValue}>{card.value}</Text>
            <Text style={styles.infoCardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Carregando categorias...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar categorias: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryImageContainer}>
                <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
              </View>
              <Text style={styles.categoryText}>{item.description}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesScroll}
        />
      )}

      {/* Products Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
      </View>
    </>
  );

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id?.toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.productsGrid}
        renderItem={({ item }) => {
          // Busca a imagem que termina com _0.jpg
          const previewImage = item.product_images?.find(img =>
            img.image_url && img.image_url.endsWith('_0.jpg')
          );
          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              <Image
                source={{ uri: previewImage?.image_url || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
              />
              <Text style={styles.productTitle}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price ? `R$ ${item.price.toFixed(2)}` : ''}</Text>
            </TouchableOpacity>
          );
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#F7F8FA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 80,
    height: 32,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    marginTop: 8,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardIconWrap: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  infoCardLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  viewAll: {
    fontSize: 14,
    color: '#4F8CFF',
    fontWeight: 'bold',
  },
  categoriesScroll: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryImageContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    padding: 10,
    marginBottom: 6,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  productsGrid: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    flex: 1,
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 150,
    maxWidth: '48%',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#4F8CFF',
    marginTop: 2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default HomeScreen;
