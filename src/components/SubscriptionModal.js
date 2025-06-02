import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SubscriptionModal = ({ 
  visible, 
  onClose, 
  onUpgrade,
  title = "Funcionalidade PRO",
  description = "Esta funcionalidade está disponível apenas para usuários com assinatura PRO.",
  feature = "recurso"
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header com ícone PRO */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name="crown" 
                size={48} 
                color="#FFD700" 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            
            {/* Botão de fechar */}
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View style={styles.content}>
            <Text style={styles.description}>
              {description}
            </Text>

            {/* Benefícios PRO */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Com o PRO você tem acesso a:</Text>
              
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#4CAF50" 
                />
                <Text style={styles.benefitText}>Criação ilimitada de grupos</Text>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#4CAF50" 
                />
                <Text style={styles.benefitText}>Recursos avançados de organização</Text>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#4CAF50" 
                />
                <Text style={styles.benefitText}>Suporte prioritário</Text>
              </View>

              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#4CAF50" 
                />
                <Text style={styles.benefitText}>Estatísticas detalhadas</Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.upgradeButton} 
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="crown" 
                size={20} 
                color="#FFFFFF" 
                style={styles.buttonIcon}
              />
              <Text style={styles.upgradeButtonText}>
                Assinar PRO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>
                Talvez mais tarde
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SubscriptionModal; 
