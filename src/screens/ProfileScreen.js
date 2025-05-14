import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../services/api';
import BottomNavigationBar from './BottomNavigationBar';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // adiciona controle de carregamento
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setError('Usuário não identificado');
          return;
        }
				
        const user = await fetchUserById(userId);

        if (user) {
          setUserData(user);
        } else {
          setError('Dados do usuário não encontrados');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#233ED9" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoItem}>
            <Icon name="id-card" size={18} color="#233ED9" />
            <Text style={styles.infoText}>{userData.registration_number}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="home" size={18} color="#233ED9" />
            <Text style={styles.infoText}>
              {userData.addresses[0].street}, {userData.addresses[0].number} - {userData.addresses[0].neighborhood}, {userData.addresses[0].city} / {userData.addresses[0].state}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavigationBar />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#233ED9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
