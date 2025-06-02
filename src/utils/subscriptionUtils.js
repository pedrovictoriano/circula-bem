import React from 'react';
import useUserStore from '../stores/userStore';

/**
 * Hook personalizado para verificar e validar assinatura PRO
 * @param {string} feature - Nome da funcionalidade que requer PRO
 * @param {function} onUpgrade - Callback para quando usuário clicar em upgrade
 * @returns {object} Objeto com funções de validação e controle do modal
 */
export const useSubscriptionValidation = (feature = 'recurso', onUpgrade = null) => {
  const [showModal, setShowModal] = React.useState(false);
  const { isPro } = useUserStore();

  /**
   * Valida se o usuário pode acessar a funcionalidade
   * @param {function} callback - Função a ser executada se o usuário for PRO
   * @returns {boolean} true se PRO, false se FREE (e mostra modal)
   */
  const validatePro = (callback = null) => {
    if (isPro()) {
      if (callback) callback();
      return true;
    } else {
      setShowModal(true);
      return false;
    }
  };

  /**
   * Fecha o modal de assinatura
   */
  const closeModal = () => {
    setShowModal(false);
  };

  /**
   * Executa o upgrade de assinatura
   */
  const handleUpgrade = () => {
    setShowModal(false);
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Implementar navegação padrão para tela de assinatura
      console.log('Navegar para tela de assinatura PRO');
    }
  };

  return {
    isPro: isPro(),
    showModal,
    validatePro,
    closeModal,
    handleUpgrade,
    feature
  };
};

/**
 * Função para verificar rapidamente se o usuário é PRO
 * @returns {boolean}
 */
export const isUserPro = () => {
  const { isPro } = useUserStore.getState();
  return isPro();
};

/**
 * Função para verificar rapidamente se o usuário é FREE
 * @returns {boolean}
 */
export const isUserFree = () => {
  const { isFree } = useUserStore.getState();
  return isFree();
};

/**
 * Validador simples que retorna true/false sem modal
 * @param {string} feature - Nome da funcionalidade
 * @returns {boolean}
 */
export const validateSubscription = (feature) => {
  return isUserPro();
};

/**
 * Configurações padrão para diferentes funcionalidades
 */
export const SUBSCRIPTION_FEATURES = {
  CREATE_GROUP: {
    title: 'Criar Grupos é PRO',
    description: 'Para criar e gerenciar grupos no Circula Bem, você precisa de uma assinatura PRO. Desbloqueie este e outros recursos avançados!',
    feature: 'criação de grupos'
  },
  ADVANCED_STATS: {
    title: 'Estatísticas Avançadas',
    description: 'Acesse relatórios detalhados e estatísticas avançadas com a assinatura PRO.',
    feature: 'estatísticas avançadas'
  },
  PRIORITY_SUPPORT: {
    title: 'Suporte Prioritário',
    description: 'Obtenha suporte especializado e prioritário com a assinatura PRO.',
    feature: 'suporte prioritário'
  },
  UNLIMITED_PRODUCTS: {
    title: 'Produtos Ilimitados',
    description: 'Cadastre produtos ilimitados em seus grupos com a assinatura PRO.',
    feature: 'produtos ilimitados'
  }
}; 
