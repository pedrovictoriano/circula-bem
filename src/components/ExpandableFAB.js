import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useUserStore from '../stores/userStore';
import SubscriptionModal from './SubscriptionModal';

const ExpandableFAB = () => {
  console.log('🚀 [FAB] ExpandableFAB component iniciado');
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigation = useNavigation();
  const animation = new Animated.Value(0);

  console.log('🚀 [FAB] Estados inicializados');

  // Zustand store para dados do usuário
  const { user, subscription, loadUser, isPro, simulateSubscriptionChange } = useUserStore();
  
  console.log('🚀 [FAB] UserStore conectada, subscription:', subscription);

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    console.log('🔄 [FAB] Componente montado, carregando dados do usuário...');
    loadUser();
  }, []);

  // Monitorar mudanças na subscription
  useEffect(() => {
    console.log('💳 [FAB] Subscription alterada para:', subscription);
    console.log('💳 [FAB] isPro() agora retorna:', isPro());
  }, [subscription]);

  // FUNÇÃO DE TESTE - Remover em produção
  const testSubscriptionToggle = () => {
    const currentSubscription = subscription;
    const newSubscription = currentSubscription === 'pro' ? 'free' : 'pro';
    console.log(`🧪 [TESTE] Alternando subscription de ${currentSubscription} para ${newSubscription}`);
    simulateSubscriptionChange(newSubscription);
  };

  const toggleMenu = () => {
    console.log('🔄 [FAB] toggleMenu chamado, isOpen atual:', isOpen);
    const toValue = isOpen ? 0 : 1;
    console.log('🔄 [FAB] Animando para:', toValue);
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
    console.log('🔄 [FAB] Novo isOpen será:', !isOpen);
  };

  const handleAddProduct = () => {
    navigation.navigate('CreateProduct');
    toggleMenu();
  };

  const handleAddGroup = () => {
    console.log('🏗️ [FAB] ===== HANDLE ADD GROUP INICIADO =====');
    console.log('🏗️ [FAB] Subscription:', subscription);
    console.log('🏗️ [FAB] User:', user);
    console.log('🏗️ [FAB] isPro():', isPro());
    
    // Teste simples primeiro
    alert('Botão de grupo clicado! Subscription: ' + (subscription || 'undefined'));
    
    // Verificação básica
    if (subscription !== 'pro') {
      console.log('🚫 [FAB] Não é PRO, mostrando modal');
      setShowSubscriptionModal(true);
      toggleMenu();
      return;
    }
    
    console.log('✅ [FAB] É PRO, navegando');
    navigation.navigate('CreateGroup');
    toggleMenu();
  };

  const handleUpgradeSubscription = () => {
    setShowSubscriptionModal(false);
    // Aqui você pode navegar para a tela de assinatura
    // ou implementar a lógica de upgrade
    console.log('Navegar para tela de assinatura PRO');
    // navigation.navigate('SubscriptionScreen');
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  const productStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
  };

  const groupStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -40],
        }),
      },
    ],
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  console.log('🎨 [FAB] Renderizando ExpandableFAB - isOpen:', isOpen);
  console.log('🎨 [FAB] Subscription atual no render:', subscription);

  return (
    <>
      <View style={styles.container}>
        <Animated.View style={[styles.button, styles.secondary, productStyle]}>
          <TouchableOpacity onPress={handleAddProduct}>
            <MaterialIcons name="add-shopping-cart" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.button, styles.secondary, groupStyle]}>
          <TouchableOpacity 
            onPress={() => {
              console.log('🔘 [FAB] TouchableOpacity do grupo foi CLICADO!');
              handleAddGroup();
            }}
            onPressIn={() => console.log('🔘 [FAB] TouchableOpacity onPressIn')}
            onPressOut={() => console.log('🔘 [FAB] TouchableOpacity onPressOut')}
          >
            <MaterialIcons name="group-add" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.button, styles.menu, rotation]}>
          <TouchableOpacity onPress={() => {
            console.log('🔵 [FAB] Botão principal clicado!');
            toggleMenu();
          }}>
            <MaterialIcons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
          
          {/* Indicador de assinatura para debug - Remover em produção */}
          <View style={[styles.subscriptionIndicator, { 
            backgroundColor: (subscription === 'pro' || user?.subscription === 'pro') ? '#4CAF50' : '#F44336' 
          }]}>
            <Text style={styles.subscriptionText}>
              {(subscription || user?.subscription || 'free').toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Botão de teste - Remover em produção */}
      {__DEV__ && (
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testSubscriptionToggle}
          onLongPress={() => {
            console.log('🔍 [DEBUG] Estado atual completo:', {
              user: user,
              subscription: subscription,
              isPro: isPro(),
              isFree: useUserStore.getState().isFree(),
              storeState: useUserStore.getState()
            });
            // Forçar reload dos dados
            loadUser();
          }}
        >
          <Text style={styles.testButtonText}>
            🧪 {subscription?.toUpperCase() || 'FREE'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal de assinatura */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={handleCloseSubscriptionModal}
        onUpgrade={handleUpgradeSubscription}
        title="Criar Grupos é PRO"
        description="Para criar e gerenciar grupos no Circula Bem, você precisa de uma assinatura PRO. Desbloqueie este e outros recursos avançados!"
        feature="criação de grupos"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menu: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
  },
  subscriptionIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  testButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default ExpandableFAB; 
