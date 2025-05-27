import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchRentedDatesForProduct } from '../services/rentService';

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


    // Fetch already rented dates for this month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const rentedDates = await fetchRentedDatesForProduct(product.id, startDate, endDate);
      
      // Processar as datas alugadas
      rentedDates.forEach(rent => {
        const rentedDateString = rent.date;
        console.log('Data alugada encontrada:', rentedDateString);
        if (availableDays[rentedDateString]) {
          availableDays[rentedDateString] = {
            disabled: true,
            marked: true,
            dotColor: '#FF6B6B',
            disabledColor: '#FFE5E5'
          };
        }
      });
      
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
    } else {
    }
  };

  const handleMonthChange = (month) => {
    getAvailableDays(month.month, month.year);
  };

  const handleContinue = () => {
    if (selectedDates.length > 0) {
      const sortedDates = selectedDates.sort();
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
        {/* Header com indicação de etapa */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Etapa 1 de 2</Text>
          {/* Barra de progresso */}
          <View style={styles.progressBar}>
            <View style={styles.progressStepCompleted} />
            <View style={styles.progressStep1of2} />
          </View>
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
        
        {/* Calendar Container */}
        <View style={styles.calendarContainer}>
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
              selectedDotColor: '#FFFFFF',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#4F8CFF',
              monthTextColor: '#222',
              indicatorColor: '#4F8CFF',
            }}
            disableAllTouchEventsForDisabledDays={true}
            minDate={new Date().toISOString().split('T')[0]} // Prevent past dates
          />
        </View>
        
        {/* Botão de continuar */}
        <View style={styles.buttonContainer}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepText: {
    fontSize: 16,
    color: '#4F8CFF',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressStepCompleted: {
    flex: 1,
    backgroundColor: '#4F8CFF',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  progressStep1of2: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#4F8CFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  continueButtonDisabled: {
    backgroundColor: '#d9e1e8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SelectDateScreen;
