import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavigationBar from '../screens/BottomNavigationBar';
import { fetchProducts } from '../services/api';

const SearchResultsScreen = ({ route, navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { query } = route.params;

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(data => {
        setProducts(data);
        setFilteredProducts(data); // começa com todos
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        setLoading(false);
      });
  }, []);

  // Aplica a busca inicial se vier via rota
  useEffect(() => {
    if (query) setSearchQuery(query);
  }, [query]);

  // Filtro local
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <View style={styles.container}>
      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="O que você está procurando?"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Barra de Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <Icon name="sliders" size={20} color="gray" style={styles.filterIcon} />
          {['Próximo', 'Categoria', 'Disponivel', 'Distante', 'Avaliação', 'Mais populares', 'Novos itens'].map((filter, index) => (
            <TouchableOpacity key={index} style={styles.filterButton}>
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Produtos */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listingItem}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
              <Image
                source={{ uri: item.product_images?.[0]?.image_url || 'https://via.placeholder.com/150' }}
                style={styles.listingImage}
              />
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Menu Fixo */}
      <BottomNavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  filtersScroll: {
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterIcon: {
    marginLeft: 10,
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  listingItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  listingImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  listingInfo: {
    marginTop: 5,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen;
