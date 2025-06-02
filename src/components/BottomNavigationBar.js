import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useNavigationStore from '../stores/navigationStore';
import useUserStore from '../stores/userStore';
import SubscriptionModal from './SubscriptionModal';
import { SUBSCRIPTION_FEATURES } from '../utils/subscriptionUtils';

const NAV_ITEMS = [
  { key: 'Home', icon: 'home-outline', label: 'Home' },
  { key: 'MyRents', icon: 'clipboard-list-outline', label: 'Aluguéis' },
  { key: 'Add', icon: 'plus', label: '' },
  { key: 'Groups', icon: 'account-group-outline', label: 'Grupos' },
  { key: 'Account', icon: 'account-outline', label: 'Conta' },
];

const BottomNavigationBar = () => {
  const navigation = useNavigation();
  const { activeTab, setActiveTab } = useNavigationStore();
  const { isPro, loadUser } = useUserStore();
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Carregar dados do usuário ao montar o componente
  React.useEffect(() => {
    console.log('🔄 [BottomNav] Carregando dados do usuário...');
    loadUser();
  }, []);

  const handlePress = (screen) => {
    if (screen === 'Add') {
      toggleAddMenu();
      return;
    }
    setActiveTab(screen);
    navigation.navigate(screen);
  };

  const toggleAddMenu = () => {
    console.log('🔄 [BottomNav] Toggle menu, isOpen:', isAddMenuOpen);
    const toValue = isAddMenuOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: false,
    }).start();
    
    setIsAddMenuOpen(!isAddMenuOpen);
  };

  const handleAddOption = (option) => {
    console.log('🔘 [BottomNav] handleAddOption chamado com:', option);
    console.log('🔘 [BottomNav] isPro():', isPro());
    
    setIsAddMenuOpen(false);
    Animated.spring(animation, {
      toValue: 0,
      friction: 5,
      useNativeDriver: false,
    }).start();
    
    if (option === 'group') {
      console.log('🏗️ [BottomNav] Tentativa de criar grupo');
      // Verificar se o usuário é PRO antes de permitir criar grupo
      if (!isPro()) {
        console.log('🚫 [BottomNav] Usuário FREE detectado, mostrando modal de upgrade');
        setShowSubscriptionModal(true);
        return;
      }
      console.log('✅ [BottomNav] Usuário PRO confirmado, navegando para CreateGroup');
      navigation.navigate('CreateGroup');
    } else if (option === 'product') {
      console.log('🛍️ [BottomNav] Navegando para CreateProduct');
      navigation.navigate('CreateProduct');
    }
  };

  const handleUpgradeSubscription = () => {
    setShowSubscriptionModal(false);
    console.log('🔄 [BottomNav] Navegar para tela de assinatura PRO');
    // navigation.navigate('SubscriptionScreen');
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  // Simplificando as animações
  const productButtonStyle = {
    opacity: animation,
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -50],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  const groupButtonStyle = {
    opacity: animation,
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 50],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  const addButtonRotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <>
      <View style={styles.outerContainer}>
        {/* FAB expandable buttons */}
        <View style={styles.fabContainer}>
          <Animated.View style={[styles.fabButton, styles.fabSecondary, productButtonStyle]}>
            <TouchableOpacity onPress={() => handleAddOption('product')} style={styles.fabTouchable}>
              <MaterialCommunityIcons name="cube-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fabButton, styles.fabSecondary, groupButtonStyle]}>
            <TouchableOpacity onPress={() => handleAddOption('group')} style={styles.fabTouchable}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.pillBar}>
          {NAV_ITEMS.map((item, idx) => {
            if (item.key === 'Add') {
              return (
                <Animated.View key={item.key} style={[styles.addButtonContainer, addButtonRotation]}>
                  <TouchableOpacity
                    onPress={() => handlePress(item.key)}
                    style={styles.addButton}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name={item.icon} size={32} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
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
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={handleCloseSubscriptionModal}
        onUpgrade={handleUpgradeSubscription}
        feature={SUBSCRIPTION_FEATURES.CREATE_GROUPS}
      />
    </>
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
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  fabButton: {
    position: 'absolute',
    bottom: 90,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 201,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabSecondary: {
    backgroundColor: '#2563eb',
  },
});

export default BottomNavigationBar;
