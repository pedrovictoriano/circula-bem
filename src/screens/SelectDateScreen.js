import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchRentedDates } from '../services/api';

const SelectDateScreen = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const navigation = useNavigation();
  const route = useRoute();
  const { product, renter } = route.params;

  // Mapping of JavaScript day numbers to Portuguese day names
  const dayMapping = {
    0: 'domingo',
    1: 'segunda',
    2: 'terça-feira',
    3: 'quarta-feira',
    4: 'quinta-feira',
    5: 'sexta-feira',
    6: 'sábado'
  };

  const getAvailableDays = async (month, year) => {
    let availableDays = {};
    let today = new Date(year, month - 1, 1);
    let end = new Date(year, month, 0);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to compare only dates

    // Ensure availabilities exist and convert to lowercase for comparison
    const productAvailabilities = product.availabilities || [];
    const normalizedAvailabilities = productAvailabilities.map(day => 
      typeof day === 'string' ? day.toLowerCase() : day
    );

    console.log('Product availabilities:', productAvailabilities);
    console.log('Normalized availabilities:', normalizedAvailabilities);

    // Mark days as available or disabled based on product availabilities
    while (today <= end) {
      const dayOfWeek = today.getDay();
      const dayName = dayMapping[dayOfWeek];
      const dateString = today.toISOString().split('T')[0];
      
      // Skip past dates
      if (today < currentDate) {
        availableDays[dateString] = { 
          disabled: true,
          disabledColor: '#d9e1e8'
        };
      } else {
        // Check if this day of week is available for the product
        const isAvailable = normalizedAvailabilities.length === 0 || 
                           normalizedAvailabilities.includes(dayName) ||
                           normalizedAvailabilities.includes(dayName.toLowerCase());
        
        if (isAvailable) {
          availableDays[dateString] = { 
            disabled: false 
          };
        } else {
          availableDays[dateString] = { 
            disabled: true,
            disabledColor: '#d9e1e8'
          };
        }
      }
      
      today.setDate(today.getDate() + 1);
    }

    console.log('Available days before fetching rented dates:', availableDays);

    // Fetch already rented dates for this month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const rentedDates = await fetchRentedDates(product.id, startDate, endDate);
      console.log('Rented dates from API:', rentedDates);
      
      // Agora cada rentedDate é um objeto com uma única 'date'
      rentedDates.forEach(rent => {
        const rentDate = new Date(rent.date);
        const rentedDateString = rentDate.toISOString().split('T')[0];
        
        if (availableDays[rentedDateString]) {
          availableDays[rentedDateString] = {
            disabled: true,
            marked: true,
            dotColor: '#FF6B6B',
            disabledColor: '#FFE5E5'
          };
        }
      });
      
      console.log('Final available days after processing rented dates:', availableDays);
    } catch (error) {
      console.error('Erro ao buscar datas alugadas:', error);
    }

    setMarkedDates(availableDays);
  };

  useEffect(() => {
    const today = new Date();
    getAvailableDays(today.getMonth() + 1, today.getFullYear());
  }, [product.availabilities]);

  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    console.log('Trying to select date:', dateString);
    console.log('Date info:', markedDates[dateString]);

    if (!markedDates[dateString]?.disabled) {
      let updatedMarkedDates = { ...markedDates };
      let newSelectedDates = [...selectedDates];

      if (newSelectedDates.includes(dateString)) {
        // Deselect date
        newSelectedDates = newSelectedDates.filter(date => date !== dateString);
        updatedMarkedDates[dateString] = { 
          disabled: false 
        };
      } else {
        // Select date
        newSelectedDates.push(dateString);
        updatedMarkedDates[dateString] = { 
          selected: true, 
          selectedColor: '#4F8CFF',
          selectedTextColor: '#FFFFFF'
        };
      }

      setSelectedDates(newSelectedDates);
      setMarkedDates(updatedMarkedDates);
      console.log('Selected dates:', newSelectedDates);
    } else {
      console.log('Date is disabled, cannot select');
    }
  };

  const handleMonthChange = (month) => {
    console.log('Month changed to:', month);
    getAvailableDays(month.month, month.year);
  };

  const handleContinue = () => {
    if (selectedDates.length > 0) {
      const sortedDates = selectedDates.sort();
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      console.log('=== Navigation Debug ===');
      console.log('Selected dates:', selectedDates);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
      console.log('Product:', product);
      console.log('Renter:', renter);
      console.log('========================');

      // Verificar se os dados estão válidos antes de navegar
      if (!product || !product.id) {
        alert('Erro: Dados do produto não encontrados.');
        return;
      }

      if (!renter || !renter.user_id) {
        alert('Erro: Dados do usuário não encontrados.');
        return;
      }

      navigation.navigate('FinalizeRental', {
        startDate,
        endDate,
        selectedDates,
        product,
        renter
      });
    } else {
      alert('Selecione pelo menos uma data');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Etapa 1 de 2</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressStepCompleted} />
        <View style={styles.progressStep1of2} />
      </View>
      <Text style={styles.title}>Escolha a data do aluguel</Text>
      
      {/* Debug info - remove in production */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Disponibilidades: {product.availabilities ? product.availabilities.join(', ') : 'Nenhuma'}
        </Text>
        <Text style={styles.debugText}>
          Datas selecionadas: {selectedDates.length}
        </Text>
        <Text style={styles.debugText}>
          Datas indisponíveis: {Object.values(markedDates).filter(date => date.disabled && date.marked).length}
        </Text>
      </View>
      
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        onMonthChange={handleMonthChange}
        theme={{
          todayTextColor: '#4F8CFF',
          arrowColor: '#4F8CFF',
          selectedDayBackgroundColor: '#4F8CFF',
          selectedDayTextColor: '#FFFFFF',
          disabledArrowColor: '#d9e1e8',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#FF6B6B',
          selectedDotColor: '#FFFFFF'
        }}
        disableAllTouchEventsForDisabledDays={true}
        minDate={new Date().toISOString().split('T')[0]} // Prevent past dates
      />
      
      <TouchableOpacity 
        style={[
          styles.continueButton, 
          selectedDates.length === 0 && styles.continueButtonDisabled
        ]} 
        onPress={handleContinue}
        disabled={selectedDates.length === 0}
      >
        <Text style={styles.continueButtonText}>
          Continuar ({selectedDates.length} {selectedDates.length === 1 ? 'dia' : 'dias'})
        </Text>
      </TouchableOpacity>
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
    backgroundColor: '#4F8CFF',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  progressStep1of2: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  stepText: {
    fontSize: 16,
    color: '#4F8CFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
  debugContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  continueButton: {
    backgroundColor: '#4F8CFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#d9e1e8',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelectDateScreen;
