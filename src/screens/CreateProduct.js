import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { createProduct, uploadProductImage, uploadMultipleProductImages } from '../services/productService';
import { fetchCategories } from '../services/categoryService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const CreateProduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const weekDays = [
    'domingo',
    'segunda',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    }
  };

  const pickImage = async () => {
    if (imageUris.length >= 3) {
      Alert.alert('Limite atingido', 'Você pode selecionar no máximo 3 imagens.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUris([...imageUris, manipulated.uri]);
    }
  };

  const removeImage = (index) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !categoryId || imageUris.length === 0 || selectedDays.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    try {
      setIsLoading(true);
      const formattedDays = selectedDays.map(index => weekDays[index]);
      const productData = {
        id: uuidv4(),
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        availabilities: formattedDays,
      };
      const product = await createProduct(productData);
      await uploadMultipleProductImages(product, imageUris);
      Alert.alert('Sucesso', 'Produto criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Criar Produto</Text>
      </View>

      <View style={styles.imageContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imageUris.map((uri, idx) => (
            <View key={idx} style={styles.imageThumbWrap}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                <MaterialCommunityIcons name="close-circle" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}
          {imageUris.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <MaterialCommunityIcons name="camera-plus" size={32} color="#666" />
              <Text style={styles.imagePlaceholderText}>Adicionar foto</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Digite o nome do produto"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o produto"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={(text) => {
            // Remove non-numeric characters except decimal point
            const numericValue = text.replace(/[^0-9.]/g, '');
            
            // Ensure only one decimal point
            const parts = numericValue.split('.');
            if (parts.length > 2) {
              setPrice(parts[0] + '.' + parts.slice(1).join(''));
            } else {
              setPrice(numericValue);
            }
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                categoryId === category.id && styles.categoryButtonSelected
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                categoryId === category.id && styles.categoryButtonTextSelected
              ]}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Dias Disponíveis</Text>
        <View style={styles.daysContainer}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDays.includes(index) && styles.dayButtonSelected
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDays.includes(index) && styles.dayButtonTextSelected
              ]}>
                {day.charAt(0)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Criar Produto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  imageContainer: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#fff',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  imageThumbWrap: {
    position: 'relative',
    marginRight: 12,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dayButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateProduct; 
