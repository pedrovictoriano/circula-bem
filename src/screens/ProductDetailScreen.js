import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchProductById } from '../services/productService';
import { fetchUserById } from '../services/api';
import ProfileImage from '../components/ProfileImage';
import { formatPrice } from '../utils/priceUtils';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [renter, setRenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const productDetails = await fetchProductById(productId);
        setProduct(productDetails);

        if (productDetails.user_id) {
          const renterDetails = await fetchUserById(productDetails.user_id);
          setRenter(renterDetails);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do produto ou usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8CFF" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const productImages = product.product_images || [];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialCommunityIcons name="heart-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {productImages.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.floor(event.nativeEvent.contentOffset.x / windowWidth);
                setCurrentImageIndex(index);
              }}
            >
              {productImages.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.image_url }}
                  style={[styles.productImage, { width: windowWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/300x200/cccccc/666666?text=Sem+Imagem' }}
              style={[styles.productImage, { width: windowWidth }]}
              resizeMode="cover"
            />
          )}
          
          {/* Image indicators */}
          {productImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {productImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    { backgroundColor: index === currentImageIndex ? '#4F8CFF' : '#E0E0E0' }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.priceLabel}>/ dia</Text>
          </View>

          <Text style={styles.location}>
            {renter?.addresses?.[0] 
              ? `${renter.addresses[0].neighborhood}, ${renter.addresses[0].city} - ${renter.addresses[0].state}` 
              : 'Localização não disponível'}
          </Text>

          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>4.7</Text>
            <Text style={styles.reviewCount}>(64 avaliações)</Text>
          </View>

          {/* Seller Info */}
          {renter && (
            <View style={styles.sellerContainer}>
              <ProfileImage
                imageUrl={renter.image_url}
                size={50}
                borderWidth={0}
              />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{renter.first_name} {renter.last_name}</Text>
                <Text style={styles.verifiedText}>Conta verificada</Text>
              </View>
            </View>
          )}

          {/* Availability */}
          {product.availabilities && product.availabilities.length > 0 && (
            <View style={styles.availabilityContainer}>
              <Text style={styles.sectionTitle}>Disponibilidade</Text>
              <View style={styles.availabilityTags}>
                {product.availabilities.map((day, index) => (
                  <View key={index} style={styles.availabilityTag}>
                    <Text style={styles.availabilityText}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.productDescription}>
            {product.description || 'Sem descrição disponível.'}
          </Text>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('SelectDate', { product, renter })}
          >
            <Text style={styles.bookButtonText}>Alugar Agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F8FA' 
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4F8CFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: { 
    height: 300,
    backgroundColor: '#eee',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  detailsContainer: { 
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
    minHeight: 400,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F8CFF',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  location: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 10,
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  ratingText: { 
    marginLeft: 5, 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#222',
  },
  reviewCount: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 5,
  },
  sellerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sellerImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 15,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#222',
  },
  verifiedText: { 
    fontSize: 14, 
    color: '#4F8CFF',
    marginTop: 2,
  },
  availabilityContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  availabilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availabilityTag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availabilityText: {
    color: '#4F8CFF',
    fontSize: 14,
    fontWeight: '500',
  },
  productDescription: { 
    fontSize: 16, 
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  bookButton: { 
    backgroundColor: '#4F8CFF', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center',
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
