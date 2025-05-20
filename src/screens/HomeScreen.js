import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import BottomNavigationBar from '../screens/BottomNavigationBar';
// import { fetchProducts, fetchCategories } from '../services/api';
import { mockCategories, mockProducts } from '../temp/mockData';

const INFO_CARDS = [
  { icon: 'clock-outline', label: 'Ativos', value: 5 },
  { icon: 'timer-sand', label: 'Pendentes', value: 2 },
  { icon: 'clipboard-list-outline', label: 'Total', value: 12 },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/150?img=12');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // const loadData = async () => {
    //   try {
    //     const cats = await fetchCategories();
    //     setCategories(cats);
    //     const prods = await fetchProducts();
    //     setProducts(prods);
    //   } catch (error) {
    //     // handle error
    //   }
    // };
    // loadData();
    setCategories(mockCategories);
    setProducts(mockProducts);
  }, []);

  // Filter products by search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryImageContainer}>
                <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
              </View>
              <Text style={styles.categoryText}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
        </View>
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id?.toString()}
          horizontal={false}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              <Image
                source={{ uri: item.product_images?.[0]?.image_url || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
              />
              <Text style={styles.productTitle}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price ? `R$ ${item.price.toFixed(2)}` : ''}</Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
      <BottomNavigationBar />
    </View>
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
    paddingTop: 24,
    paddingBottom: 10,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
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
    marginHorizontal: 10,
    marginBottom: 10,
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
    paddingBottom: 20,
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
});

export default HomeScreen;
