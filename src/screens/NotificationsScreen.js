import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Exemplo de dados para as notificações
const sampleNotifications = [
  { id: '1', title: 'Produtos da Semana', details: 'Confira os melhores produtos da semana disponíveis!', date: '2024-05-07', icon: 'gift' },
  { id: '2', title: 'Atualização de Sistema', details: 'Seu sistema foi atualizado com sucesso.', date: '2024-05-01', icon: 'refresh' },
  { id: '3', title: 'Atualização Cadastral', details: 'Excedeu o prazo de atualização do seu cadastro! Clique aqui para atualizar', date: '2024-04-26', icon: 'person' }
];

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handlePressNotification = (id) => {
    // Aqui você pode adicionar ações como navegar para uma tela detalhada
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notificações</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationItem} onPress={() => handlePressNotification(item.id)}>
            <FontAwesome name={item.icon} size={24} style={styles.notificationIcon} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationDetails}>{item.details}</Text>
              <Text style={styles.notificationDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 10,
    backgroundColor: '#233ED9',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1'
  },
  notificationIcon: {
    marginRight: 10,
    color: '#233ED9'
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDetails: {
    fontSize: 14,
    color: 'gray'
  },
  notificationDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5
  }
});

export default NotificationsScreen;
