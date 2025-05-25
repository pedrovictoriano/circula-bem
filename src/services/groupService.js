import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertIntoTable, getTable, updateTableById, deleteFromTableById } from './supabaseClient';
import { SUPABASE_CONFIG } from '../config/env';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Criar um novo grupo
export const createGroup = async (groupData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    
    console.log('🔧 Configuração Supabase:', {
      URL: SUPABASE_CONFIG?.URL ? 'Configurado' : 'UNDEFINED',
      KEY: SUPABASE_CONFIG?.KEY ? 'Configurado' : 'UNDEFINED'
    });
    
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    if (!SUPABASE_CONFIG?.URL) {
      throw new Error('Configuração do Supabase não encontrada');
    }

    // Gerar handle único baseado no nome
    const handle = generateUniqueHandle(groupData.name);
    
    // Dados do grupo
    const newGroup = {
      id: uuidv4(),
      name: groupData.name.trim(),
      description: groupData.description.trim(),
      handle: handle,
      image_url: groupData.image_url || null,
      invite_link: generateInviteLink(handle),
      created_at: new Date().toISOString().split('T')[0],
    };

    console.log('🏗️ Criando grupo:', newGroup);
    console.log('📡 URL da requisição:', `${SUPABASE_CONFIG.URL}/rest/v1/groups`);

    // Criar o grupo
    const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/groups`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newGroup)
    });

    console.log('📡 Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta do servidor:', errorText);
      throw new Error(`Falha ao criar grupo: ${errorText}`);
    }

    const createdGroup = await response.json();
    const group = Array.isArray(createdGroup) ? createdGroup[0] : createdGroup;

    console.log('✅ Grupo criado no banco:', group);

    // Adicionar o criador como admin do grupo
    await addGroupMember(group.id, userId, userId, 'admin', 'ativo');

    console.log('✅ Grupo criado com sucesso:', group);
    return group;
  } catch (error) {
    console.error('❌ Erro ao criar grupo:', error);
    console.error('❌ Stack trace:', error.stack);
    throw new Error(error.message || 'Falha ao criar grupo');
  }
};

// Upload de imagem do grupo
export const uploadGroupImage = async (groupId, imageUri) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!SUPABASE_CONFIG?.URL) {
      throw new Error('Configuração do Supabase não encontrada para upload');
    }
    
    // Gerar nome único para a imagem
    const uniqueName = `${groupId}/${groupId}_cover.jpg`;
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: uniqueName
    });

    // URL de upload para o bucket group-images
    const uploadUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/group-images/${uniqueName}`;
    console.log('📤 Fazendo upload da imagem do grupo para:', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${token || SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    console.log('📡 Status do upload:', uploadResponse.status, uploadResponse.statusText);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Erro no upload:', errorText);
      throw new Error(`Falha ao fazer upload da imagem do grupo: ${errorText}`);
    }

    // URL pública da imagem
    const imageUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/group-images/${uniqueName}`;
    
    console.log('✅ Imagem do grupo enviada com sucesso:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('❌ Erro detalhado ao fazer upload da imagem do grupo:', error);
    console.error('❌ Stack trace do upload:', error.stack);
    throw new Error(error.message || 'Falha ao fazer upload da imagem do grupo');
  }
};

// Adicionar membro ao grupo
export const addGroupMember = async (groupId, userId, invitedBy, role = 'membro', status = 'pendente') => {
  try {
    const memberData = {
      id: uuidv4(),
      group_id: groupId,
      user_id: userId,
      role: role,
      status: status,
      invited_by: invitedBy,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const result = await insertIntoTable('group_members', memberData);
    console.log('✅ Membro adicionado ao grupo:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao adicionar membro ao grupo:', error);
    throw new Error(error.message || 'Falha ao adicionar membro ao grupo');
  }
};

// Buscar grupos do usuário
export const fetchUserGroups = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando grupos do usuário:', userId);

    // Buscar memberships do usuário
    const membersQuery = `user_id=eq.${userId}&status=eq.ativo&select=group_id,role`;
    const memberships = await getTable('group_members', membersQuery);
    
    if (!memberships || !Array.isArray(memberships) || memberships.length === 0) {
      console.log('⚠️ Nenhum grupo encontrado');
      return [];
    }

    // Buscar detalhes dos grupos
    const groupIds = memberships.map(m => m.group_id);
    const groupsQuery = `id=in.(${groupIds.join(',')})&select=*`;
    const groups = await getTable('groups', groupsQuery);

    if (!groups || !Array.isArray(groups)) {
      return [];
    }

    // Enriquecer dados dos grupos com informações de membership
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const membership = memberships.find(m => m.group_id === group.id);
        
        // Contar membros do grupo
        const memberCountQuery = `group_id=eq.${group.id}&status=eq.ativo&select=id`;
        const members = await getTable('group_members', memberCountQuery);
        const memberCount = members ? members.length : 0;

        return {
          ...group,
          isAdmin: membership?.role === 'admin',
          memberCount: memberCount,
          lastActivity: group.created_at // Placeholder - pode ser melhorado depois
        };
      })
    );

    console.log(`✅ Encontrados ${enrichedGroups.length} grupos`);
    return enrichedGroups;
  } catch (error) {
    console.error('❌ Erro ao buscar grupos do usuário:', error);
    throw new Error(error.message || 'Falha ao buscar grupos');
  }
};

// Buscar detalhes de um grupo específico
export const fetchGroupById = async (groupId) => {
  try {
    const groupQuery = `id=eq.${groupId}&select=*`;
    const groups = await getTable('groups', groupQuery);
    
    if (!groups || groups.length === 0) {
      throw new Error('Grupo não encontrado');
    }

    const group = groups[0];

    // Buscar membros do grupo
    const membersQuery = `group_id=eq.${groupId}&select=*,user_extra_information:user_id(first_name,last_name,image_url,registration_number)`;
    const members = await getTable('group_members', membersQuery);

    return {
      ...group,
      members: members || []
    };
  } catch (error) {
    console.error('❌ Erro ao buscar grupo por ID:', error);
    throw new Error(error.message || 'Falha ao buscar grupo');
  }
};

// Atualizar grupo
export const updateGroup = async (groupId, updateData) => {
  try {
    const result = await updateTableById('groups', groupId, updateData);
    console.log('✅ Grupo atualizado:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao atualizar grupo:', error);
    throw new Error(error.message || 'Falha ao atualizar grupo');
  }
};

// Deletar grupo
export const deleteGroup = async (groupId) => {
  try {
    // Verificar se o usuário é admin do grupo
    const userId = await AsyncStorage.getItem('userId');
    const memberQuery = `group_id=eq.${groupId}&user_id=eq.${userId}&role=eq.admin`;
    const adminCheck = await getTable('group_members', memberQuery);
    
    if (!adminCheck || adminCheck.length === 0) {
      throw new Error('Apenas administradores podem deletar o grupo');
    }

    const result = await deleteFromTableById('groups', groupId);
    console.log('✅ Grupo deletado:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao deletar grupo:', error);
    throw new Error(error.message || 'Falha ao deletar grupo');
  }
};

// Funções auxiliares
const generateUniqueHandle = (name) => {
  const baseHandle = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '-')      // Substitui caracteres especiais por hífen
    .replace(/-+/g, '-')             // Remove hífens duplicados
    .replace(/^-|-$/g, '');          // Remove hífens do início/fim
  
  // Adiciona timestamp para garantir unicidade
  const timestamp = Date.now().toString().slice(-6);
  return `${baseHandle}-${timestamp}`;
};

const generateInviteLink = (handle) => {
  return `https://circulabem.app/groups/join/${handle}`;
}; 
