import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NAV_ITEMS = [
  { key: 'Home', icon: 'home-outline', label: 'Home' },
  { key: 'MyRents', icon: 'clipboard-list-outline', label: 'Aluguéis' },
  { key: 'Add', icon: 'plus', label: '' },
  { key: 'Reports', icon: 'file-chart-outline', label: 'Relatórios' },
  { key: 'Settings', icon: 'cog-outline', label: 'Configs.' },
];

const BottomNavigationBar = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Home');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const handlePress = (screen) => {
    if (screen === 'Add') {
      setAddModalVisible(true);
      return;
    }
    setActiveTab(screen);
    navigation.navigate(screen);
  };

  const handleAddOption = (option) => {
    setAddModalVisible(false);
    if (option === 'group') {
      navigation.navigate('CreateGroup');
    } else if (option === 'product') {
      navigation.navigate('CreateProduct');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.pillBar}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.key === 'Add') {
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handlePress(item.key)}
                style={styles.addButtonContainer}
                activeOpacity={0.8}
              >
                <View style={styles.addButton}>
                  <MaterialCommunityIcons name={item.icon} size={32} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handlePress(item.key)}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={26}
                color={isActive ? '#2563eb' : '#A0A0A0'}
                style={styles.menuIcon}
              />
              {item.label ? (
                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.label}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddModalVisible(false)}>
          <View style={styles.addModal}>
            <TouchableOpacity style={styles.addModalOption} onPress={() => handleAddOption('group')}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color="#2563eb" />
              <Text style={styles.addModalText}>Criar Grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addModalOption} onPress={() => handleAddOption('product')}>
              <MaterialCommunityIcons name="cube-outline" size={24} color="#2563eb" />
              <Text style={styles.addModalText}>Criar Produto</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  pillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '96%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    height: 70,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
    paddingHorizontal: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  menuIcon: {
    marginBottom: 2,
  },
  menuText: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  menuTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    marginTop: -24,
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 220,
  },
  addModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  addModalText: {
    fontSize: 16,
    color: '#2563eb',
    marginLeft: 12,
    fontWeight: 'bold',
  },
});

export default BottomNavigationBar;
