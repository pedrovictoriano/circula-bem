import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../services/api';
import ProfileImage from '../components/ProfileImage';

const AccountScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const user = await fetchUserById(userId);
          setUserData(user);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Funções de navegação para os cards de estatísticas
  const handleRentsPress = () => {
    navigation.navigate('MyRents');
  };

  const handleProductsPress = () => {
    navigation.navigate('MyProducts');
  };

  const handleGroupsPress = () => {
    // Para quando implementarmos a tela de grupos
    console.log('Navegar para grupos');
  };

  const handleRentManagementPress = () => {
    navigation.navigate('RentManagement');
  };

  const menuItems = [
    {
      section: 'Perfil',
      items: [
        { key: 'edit-profile', icon: 'account-edit', label: 'Editar Perfil', action: () => {} },
        { key: 'addresses', icon: 'map-marker', label: 'Endereços', action: () => {} },
        { key: 'verification', icon: 'check-circle', label: 'Verificação de Conta', action: () => {} },
      ]
    },
    {
      section: 'Atividade',
      items: [
        { key: 'my-products', icon: 'cube-outline', label: 'Meus Produtos', action: handleProductsPress },
        { key: 'rent-management', icon: 'clipboard-check', label: 'Gerenciar Aluguéis', action: handleRentManagementPress },
        { key: 'reviews', icon: 'star-outline', label: 'Avaliações', action: () => {} },
        { key: 'history', icon: 'history', label: 'Histórico de Atividades', action: () => {} },
      ]
    },
    {
      section: 'Configurações',
      items: [
        { 
          key: 'notifications', 
          icon: 'bell-outline', 
          label: 'Notificações', 
          hasSwitch: true,
          value: notifications,
          onToggle: setNotifications
        },
        { 
          key: 'location', 
          icon: 'map-marker-outline', 
          label: 'Compartilhar Localização', 
          hasSwitch: true,
          value: locationSharing,
          onToggle: setLocationSharing
        },
        { key: 'privacy', icon: 'shield-account', label: 'Privacidade e Segurança', action: () => {} },
        { key: 'language', icon: 'translate', label: 'Idioma', action: () => {} },
      ]
    },
    {
      section: 'Suporte',
      items: [
        { key: 'help', icon: 'help-circle-outline', label: 'Central de Ajuda', action: () => {} },
        { key: 'contact', icon: 'message-outline', label: 'Contato', action: () => {} },
        { key: 'about', icon: 'information-outline', label: 'Sobre o App', action: () => {} },
      ]
    }
  ];

  const renderMenuItem = (item) => {
    if (item.hasSwitch) {
      return (
        <View key={item.key} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color="#6B7280" 
              style={styles.menuIcon}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
            thumbColor={item.value ? '#2563EB' : '#F3F4F6'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity key={item.key} style={styles.menuItem} onPress={item.action}>
        <View style={styles.menuItemLeft}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={24} 
            color="#6B7280" 
            style={styles.menuIcon}
          />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color="#9CA3AF" 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Minha Conta</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialCommunityIcons name="cog-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <ProfileImage
              imageUrl={userData?.image_url}
              size={60}
              borderWidth={0}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {userData ? `${userData.first_name} ${userData.last_name}` : 'Carregando...'}
              </Text>
              <Text style={styles.userEmail}>{userData?.email || 'Email não disponível'}</Text>
              <Text style={styles.memberSince}>
                Membro desde {userData?.created_at ? new Date(userData.created_at).getFullYear() : '2023'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard} onPress={handleRentsPress}>
              <MaterialCommunityIcons name="clipboard-list" size={24} color="#2563EB" style={styles.statIcon} />
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Aluguéis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleProductsPress}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#2563EB" style={styles.statIcon} />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Produtos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleGroupsPress}>
              <MaterialCommunityIcons name="account-group" size={24} color="#2563EB" style={styles.statIcon} />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Sections */}
          {menuItems.map((section) => (
            <View key={section.section} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderMenuItem)}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>

          {/* Footer Space */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default AccountScreen; 
