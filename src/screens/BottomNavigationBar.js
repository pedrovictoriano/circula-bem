import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BottomNavigationBar = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Home');

  const handlePress = (screen) => {
    setActiveTab(screen);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.fixedMenu}>
      <TouchableOpacity onPress={() => handlePress('Home')} style={styles.menuItem}>
        <View style={[styles.iconContainer, activeTab === 'Home' && styles.activeIcon]}>
          <FontAwesome name="home" size={24} style={styles.menuIcon} />
        </View>
        <Text style={styles.menuText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('Chat')} style={styles.menuItem}>
        <View style={[styles.iconContainer, activeTab === 'Chat' && styles.activeIcon]}>
          <FontAwesome name="file-text" size={24} style={styles.menuIcon} />
        </View>
        <Text style={styles.menuText}>Aluguéis</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('AddNewItem')} style={styles.addButton}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('Wishlist')} style={styles.menuItem}>
        <View style={[styles.iconContainer, activeTab === 'Wishlist' && styles.activeIcon]}>
          <FontAwesome name="heart" size={24} style={styles.menuIcon} />
        </View>
        <Text style={styles.menuText}>Favoritos</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('ProfileScreen')} style={styles.menuItem}>
        <View style={[styles.iconContainer, activeTab === 'Profile' && styles.activeIcon]}>
          <FontAwesome name="user" size={24} style={styles.menuIcon} />
        </View>
        <Text style={styles.menuText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1918',
    paddingVertical: 5,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#233ED9',
    borderRadius: 5,
    shadowColor: '#1a1918',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  menuIcon: {
    color: 'white',
  },
  menuText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: '#233ED9',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  }
});

export default BottomNavigationBar;
