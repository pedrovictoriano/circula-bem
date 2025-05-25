import { SUPABASE_CONFIG } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadProfileImage = async (userId, imageUri) => {
  try {    
    // Gerar nome único para a imagem do perfil
    const uniqueName = `${userId}/profile_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: uniqueName
    });

    // URL de upload para o bucket profile-images
    const uploadUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/profile-images/${uniqueName}`;
    console.log('Uploading profile image to:', uploadUrl);

    // Headers adequados para upload público
    const headers = {
      'apikey': SUPABASE_CONFIG.KEY,
      'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`,
      'Content-Type': 'multipart/form-data',
    };

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    console.log('Profile Image Upload Response:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Profile Image Upload Error Response:', errorText);
      throw new Error(`Falha ao fazer upload da imagem de perfil: ${errorText}`);
    }

    // URL pública da imagem
    const imageUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/profile-images/${uniqueName}`;
    
    console.log('Profile image uploaded successfully:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Erro detalhado ao fazer upload da imagem de perfil:', error);
    throw new Error(error.message || 'Falha ao fazer upload da imagem de perfil');
  }
}; 
