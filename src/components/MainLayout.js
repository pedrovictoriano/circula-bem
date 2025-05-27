import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BottomNavigationBar from './BottomNavigationBar';
import useNavigationStore from '../stores/navigationStore';

const MainLayout = ({ children }) => {
  const route = useRoute();
  const { setActiveTab } = useNavigationStore();

  // Lista de telas que devem mostrar a bottom navigation
  const screensWithBottomNav = ['Home', 'MyRents', 'Groups', 'Account'];

  // Atualiza o activeTab quando a rota muda
  useEffect(() => {
    if (screensWithBottomNav.includes(route.name)) {
      setActiveTab(route.name);
    }
  }, [route.name, setActiveTab]);

  // Verifica se a tela atual deve mostrar a bottom navigation
  const shouldShowBottomNav = screensWithBottomNav.includes(route.name);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      {shouldShowBottomNav && <BottomNavigationBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default MainLayout; 
