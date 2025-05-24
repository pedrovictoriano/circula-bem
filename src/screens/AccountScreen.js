import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavigationBar from './BottomNavigationBar';

const AccountScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  // Mock user data - aqui você pode integrar com Supabase
  const userData = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    registrationNumber: '12345678',
    avatar: 'https://via.placeholder.com/80x80',
    memberSince: '2023',
    totalRents: 23,
    productsShared: 8,
    groupsCount: 3,
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
        { key: 'my-products', icon: 'cube-outline', label: 'Meus Produtos', action: () => {} },
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
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.memberSince}>Membro desde {userData.memberSince}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialCommunityIcons name="pencil" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userData.totalRents}</Text>
            <Text style={styles.statLabel}>Aluguéis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userData.productsShared}</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userData.groupsCount}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
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

      <BottomNavigationBar />
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
});

export default AccountScreen; 
