import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMultipleRentals } from '../services/api';

const FinalizeRentalScreen = ({ route }) => {
  const { startDate, endDate, selectedDates, product, renter } = route.params;
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;

  const [showRenterInfo, setShowRenterInfo] = useState(false);
  const [showRentButton, setShowRentButton] = useState(true);
  const [showAllDates, setShowAllDates] = useState(false);

  console.log('FinalizeRental params:', { startDate, endDate, selectedDates, product, renter });

  const handleRent = async () => {
    if (!renter || !product) {
      alert('Erro: Dados do usuário ou produto não encontrados.');
      return;
    }

    if (!selectedDates || selectedDates.length === 0) {
      alert('Erro: Nenhuma data selecionada.');
      return;
    }

    console.log('Creating rentals for dates:', selectedDates);

    try {
      // Criar um aluguel para cada data selecionada
      await createMultipleRentals(product.id, renter.user_id, selectedDates);
      setShowRenterInfo(true);
      setShowRentButton(false);
      alert(`Aluguel confirmado para ${selectedDates.length} ${selectedDates.length === 1 ? 'dia' : 'dias'}!`);
    } catch (error) {
      console.error('Erro ao confirmar aluguel:', error);
      alert('Erro ao confirmar aluguel. Tente novamente.');
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home'); // Ajuste 'Home' para o nome correto da tela inicial na sua navegação
  };

  const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatSelectedDates = () => {
    if (!selectedDates || selectedDates.length === 0) return 'Nenhuma data selecionada';
    
    // Ordenar as datas para mostrar em ordem cronológica
    const sortedDates = [...selectedDates].sort();
    
    // Se tem muitas datas e não está expandido, mostrar de forma compacta
    if (sortedDates.length > 5 && !showAllDates) {
      const firstFew = sortedDates.slice(0, 3).map(formatDate).join(', ');
      const remaining = sortedDates.length - 3;
      return `${firstFew} e mais ${remaining} ${remaining === 1 ? 'dia' : 'dias'}`;
    }
    
    // Mostrar todas as datas
    return sortedDates.map(formatDate).join(', ');
  };

  const renderDateSection = () => (
    <View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Datas selecionadas:</Text>
        <Text style={styles.detailValue}>{formatSelectedDates()}</Text>
      </View>
      {selectedDates.length > 5 && (
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setShowAllDates(!showAllDates)}
        >
          <Text style={styles.expandButtonText}>
            {showAllDates ? 'Ver menos' : 'Ver todas as datas'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Buscar a primeira imagem do produto
  const getProductImage = () => {
    if (product?.product_images && product.product_images.length > 0) {
      return product.product_images[0].image_url;
    }
    return 'https://via.placeholder.com/150x150/cccccc/666666?text=Sem+Imagem';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Etapa 2 de 2</Text>
      {/* Barra de progresso */}
      <View style={styles.progressBar}>
        <View style={styles.progressStepCompleted} />
      </View>

      <Text style={styles.detailsTitle}>Item de Aluguel</Text>
      {/* Card do item */}
      {product && (
        <View style={styles.itemCard}>
          <Image source={{ uri: getProductImage() }} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle} numberOfLines={2} ellipsizeMode="tail">
              {product.name || 'Produto sem nome'}
            </Text>
            <Text style={styles.itemPrice}>
              R$ {product.price ? product.price.toFixed(2) : '0,00'} / dia
            </Text>
          </View>
        </View>
      )}

      {/* Detalhes do aluguel */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Detalhes do Aluguel</Text>
        {renderDateSection()}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total de dias:</Text>
          <Text style={styles.detailValue}>{selectedDates.length}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valor total:</Text>
          <Text style={styles.detailValue}>
            R$ {product?.price ? (product.price * selectedDates.length).toFixed(2) : '0,00'}
          </Text>
        </View>
      </View>

      {/* Informações do locador */}
      {showRenterInfo && renter && (
        <View style={styles.renterInfoContainer}>
          <Text style={styles.renterInfoTitle}>Informações do locador</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nome:</Text>
            <Text style={styles.detailValue}>
              {renter.first_name && renter.last_name 
                ? `${renter.first_name} ${renter.last_name}` 
                : 'Nome não disponível'}
            </Text>
          </View>
          {renter.addresses && renter.addresses.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Endereço:</Text>
              <Text style={styles.detailValue}>
                {`${renter.addresses[0].neighborhood || ''}, ${renter.addresses[0].city || ''} - ${renter.addresses[0].state || ''}`}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contato:</Text>
            <Text style={styles.detailValue}>Disponível após confirmação</Text>
          </View>
        </View>
      )}

      {showRentButton ? (
        <TouchableOpacity style={styles.rentButton} onPress={handleRent}>
          <Text style={styles.rentButtonText}>Confirmar Aluguel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.goHomeButton} onPress={handleGoHome}>
          <Text style={styles.goHomeButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 20,
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 20,
  },
  progressStepCompleted: {
    flex: 1,
    backgroundColor: '#4F8CFF',
    borderRadius: 5,
  },
  stepText: {
    fontSize: 16,
    color: '#4F8CFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: '#F0F0F0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4F8CFF',
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    flex: 3,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  renterInfoContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  renterInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },
  rentButton: {
    backgroundColor: '#4F8CFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goHomeButton: {
    backgroundColor: '#6C757D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goHomeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandButton: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  expandButtonText: {
    color: '#4F8CFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FinalizeRentalScreen;
