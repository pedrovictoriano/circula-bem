import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SUPABASE_CONFIG } from '../config/env';
import useGroupStore from '../stores/groupStore';

const JoinGroupByLinkScreen = () => {
  const navigation = useNavigation();
  const [inviteLink, setInviteLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    inviteGroup,
    loading,
    error,
    processInviteLink,
    joinByInvite,
    clearInviteState,
    clearError
  } = useGroupStore();

  useEffect(() => {
    // Limpar estado ao entrar na tela
    clearInviteState();
    clearError();
  }, []);

  // Função para extrair handle de qualquer texto que contenha um link
  const extractHandleFromText = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Buscar por URLs no texto
    const urlRegex = /https?:\/\/[^\s]+|circulabem\.app\/[^\s]+|groups\/join\/[^\s]+/gi;
    const urls = text.match(urlRegex);
    
    if (urls && urls.length > 0) {
      // Pegar a primeira URL encontrada
      const url = urls[0];
      
      // Extrair o último segmento do path (que é o handle)
      const pathMatch = url.match(/\/([^\/\s?#]+)(?:\?[^\s]*)?(?:#[^\s]*)?$/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }
    }
    
    return text.trim();
  };

  const handleProcessLink = async () => {
    if (!inviteLink.trim()) {
      Alert.alert('Atenção', 'Por favor, insira um link de convite.');
      return;
    }

    try {
      // Extrair automaticamente o handle do texto inserido
      const extractedHandle = extractHandleFromText(inviteLink.trim());
      await processInviteLink(extractedHandle);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteGroup) return;

    Alert.alert(
      'Solicitar Participação',
      `Deseja solicitar participação no grupo "${inviteGroup.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              setIsProcessing(true);
              // Usar o handle extraído
              const extractedHandle = extractHandleFromText(inviteLink.trim());
              const result = await joinByInvite(extractedHandle);
              
              Alert.alert(
                'Sucesso!',
                result.message,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navegar para a tela do grupo
                      navigation.replace('GroupDetail', { groupId: inviteGroup.id });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Erro', error.message);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const getGroupImage = (imageUrl) => {
    if (imageUrl && imageUrl.trim() !== '') {
      if (imageUrl.startsWith('http')) {
        return { uri: imageUrl };
      }
      const fullUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/group-images/${imageUrl}`;
      return { uri: fullUrl };
    }
    return { uri: 'https://via.placeholder.com/120x120/E5E7EB/9CA3AF?text=Grupo' };
  };

  const getMembershipStatusText = () => {
    if (!inviteGroup?.membership) return null;
    
    if (inviteGroup.membership.isMember) {
      if (inviteGroup.membership.status === 'ativo') {
        return {
          text: 'Você já é membro deste grupo',
          color: '#10B981',
          icon: 'check-circle'
        };
      } else if (inviteGroup.membership.status === 'pendente') {
        return {
          text: 'Você já possui uma solicitação pendente',
          color: '#F59E0B',
          icon: 'clock-outline'
        };
      }
    }
    
    return {
      text: 'Você pode solicitar participação',
      color: '#2563EB',
      icon: 'account-plus'
    };
  };

  const canJoinGroup = () => {
    return inviteGroup && 
           inviteGroup.membership && 
           !inviteGroup.membership.isMember;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrar por Convite</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instrução */}
          <View style={styles.instructionCard}>
            <MaterialCommunityIcons name="link" size={48} color="#2563EB" />
            <Text style={styles.instructionTitle}>Link de Convite</Text>
            <Text style={styles.instructionText}>
              Cole aqui o link de convite ou qualquer mensagem que contenha o link. O sistema extrairá automaticamente o código do grupo.
            </Text>
          </View>

          {/* Input do Link */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Link de Convite ou Mensagem</Text>
            <TextInput
              style={styles.textInput}
              value={inviteLink}
              onChangeText={setInviteLink}
              placeholder="Cole aqui o link completo ou apenas o código do grupo..."
              placeholderTextColor="#9CA3AF"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[styles.processButton, loading && styles.processButtonDisabled]}
              onPress={handleProcessLink}
              disabled={loading || !inviteLink.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
              )}
              <Text style={styles.processButtonText}>
                {loading ? 'Verificando...' : 'Verificar Link'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Erro */}
          {error && (
            <View style={styles.errorCard}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Grupo Encontrado */}
          {inviteGroup && (
            <View style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Image 
                  source={getGroupImage(inviteGroup.image_url)} 
                  style={styles.groupImage}
                />
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{inviteGroup.name}</Text>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {inviteGroup.description}
                  </Text>
                  <Text style={styles.memberCount}>
                    {inviteGroup.memberCount} {inviteGroup.memberCount === 1 ? 'membro' : 'membros'}
                  </Text>
                </View>
              </View>

              {/* Status do Membership */}
              {getMembershipStatusText() && (
                <View style={styles.statusContainer}>
                  <MaterialCommunityIcons 
                    name={getMembershipStatusText().icon} 
                    size={20} 
                    color={getMembershipStatusText().color} 
                  />
                  <Text style={[styles.statusText, { color: getMembershipStatusText().color }]}>
                    {getMembershipStatusText().text}
                  </Text>
                </View>
              )}

              {/* Botão de Solicitar */}
              {canJoinGroup() && (
                <TouchableOpacity
                  style={[styles.joinButton, isProcessing && styles.joinButtonDisabled]}
                  onPress={handleJoinGroup}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name="account-plus" size={20} color="#FFF" />
                  )}
                  <Text style={styles.joinButtonText}>
                    {isProcessing ? 'Solicitando...' : 'Solicitar Participação'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Dicas */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Dicas</Text>
            <Text style={styles.tipText}>
              • Você pode colar a mensagem completa do convite - o sistema extrairá automaticamente o código
            </Text>
            <Text style={styles.tipText}>
              • Também funciona com apenas o link ou código do grupo
            </Text>
            <Text style={styles.tipText}>
              • Após solicitar, aguarde a aprovação dos administradores
            </Text>
            <Text style={styles.tipText}>
              • Você receberá uma notificação quando for aprovado
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  processButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  groupImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  memberCount: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default JoinGroupByLinkScreen; 
