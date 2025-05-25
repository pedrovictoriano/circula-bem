import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import useGroupStore from '../stores/groupStore';

const CreateGroup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Zustand store
  const { createNewGroup, loading } = useGroupStore();

  const pickImage = async () => {
    try {
      // Solicitar permissões
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Redimensionar imagem
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImageUri(manipulated.uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o grupo');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para o grupo');
      return;
    }

    try {
      // Dados básicos do grupo
      const groupData = {
        name: name.trim(),
        description: description.trim(),
      };

      // Criar o grupo usando o store
      await createNewGroup(groupData, imageUri);

      Alert.alert(
        'Sucesso!', 
        'Grupo criado com sucesso! Você pode começar a convidar membros agora.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar o grupo. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            disabled={loading}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Criar Novo Grupo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Foto do Grupo</Text>
            <Text style={styles.sectionSubtitle}>
              Adicione uma foto que represente seu grupo (opcional)
            </Text>
            
            <View style={styles.imageContainer}>
              {imageUri ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={removeImage}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.imagePlaceholder} 
                  onPress={pickImage}
                  disabled={loading}
                >
                  <MaterialCommunityIcons 
                    name="camera-plus-outline" 
                    size={40} 
                    color="#9CA3AF" 
                  />
                  <Text style={styles.imagePlaceholderText}>
                    Adicionar Foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Grupo *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Ferramentas do Bairro, Família Silva..."
                placeholderTextColor="#9CA3AF"
                maxLength={100}
                editable={!loading}
              />
              <Text style={styles.charCount}>{name.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva o propósito do grupo e que tipos de itens serão compartilhados..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
                editable={!loading}
              />
              <Text style={styles.charCount}>{description.length}/300</Text>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={20} 
                color="#2563EB" 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Sobre os Grupos</Text>
                <Text style={styles.infoText}>
                  Você será automaticamente definido como administrador do grupo. 
                  Poderá convidar membros e gerenciar o grupo após a criação.
                </Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={loading || !name.trim() || !description.trim()}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.createButtonText}>Criando Grupo...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>Criar Grupo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
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
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CreateGroup; 
