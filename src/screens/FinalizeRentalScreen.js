import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createRental } from '../services/api';

const FinalizeRentalScreen = ({ route }) => {
  const { startDate, endDate, selectedDates, product, renter } = route.params;
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;

  const [showRenterInfo, setShowRenterInfo] = useState(false);
  const [showRentButton, setShowRentButton] = useState(true);

  const handleRent = async () => {
    if (!renter || !product) {
      alert('Erro: Dados do usuário ou produto não encontrados.');
      return;
    }

		const rentalData = {
			product_id: product.id,
			user_id: renter.id,
			start_date: `${startDate}T00:00:00.000Z`,
			end_date: `${endDate}T23:59:59.999Z`
		};

    try {
      await createRental(rentalData);
      setShowRenterInfo(true);
      setShowRentButton(false);
      alert('Aluguel confirmado!');
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
          <Image source={{ uri: product.imageUrls[0] }} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle} numberOfLines={2} ellipsizeMode="tail">{product.name}</Text>
          </View>
        </View>
      )}

      {/* Detalhes do aluguel */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Detalhes do Aluguel</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Período de aluguel:</Text>
          <Text style={styles.detailValue}>{formatDate(startDate)} - {formatDate(endDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dias:</Text>
          <Text style={styles.detailValue}>{selectedDates.length}</Text>
        </View>
        {/* Adicione mais detalhes conforme necessário */}
      </View>

      {/* Informações do locador */}
      {showRenterInfo && renter && (
        <View style={styles.renterInfoContainer}>
          <Text style={styles.renterInfoTitle}>Informações do locatário</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nome:</Text>
            <Text style={styles.detailValue}>{renter.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Endereço:</Text>
            <Text style={styles.detailValue}>{`${renter.address.neighborhood}, ${renter.address.city}`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Whatsapp:</Text>
            {/* <Text style={styles.detailValue}>{renter.whatsapp}</Text> */}
            <Text style={styles.detailValue}>+55 (19) 99625-8494</Text>
          </View>
        </View>
      )}

      {showRentButton ? (
        <TouchableOpacity style={styles.rentButton} onPress={handleRent}>
          <Text style={styles.rentButtonText}>Alugar Agora</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.goHomeButton} onPress={handleGoHome}>
          <Text style={styles.goHomeButtonText}>Ir para Home</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: '#16E024',
    borderRadius: 5,
  },
  stepText: {
    fontSize: 16,
    color: '#233ED9',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: 'gray',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: 'gray',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  renterInfoContainer: {
    marginBottom: 20,
  },
  renterInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rentButton: {
    backgroundColor: '#16E024',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  rentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goHomeButton: {
    backgroundColor: '#233ED9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  goHomeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FinalizeRentalScreen;
