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
    
    console.log('📤 Iniciando upload da imagem do grupo');
    console.log('🏷️ GroupId:', groupId);
    console.log('📱 ImageUri:', imageUri);
    console.log('🔧 SUPABASE_CONFIG.URL:', SUPABASE_CONFIG.URL);
    
    // Gerar nome único para a imagem
    const uniqueName = `${groupId}/${groupId}_cover.jpg`;
    console.log('📝 Nome único gerado:', uniqueName);
    
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

    // URL pública da imagem - SEGUINDO O PADRÃO DOS PRODUTOS
    const imageUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/group-images/${uniqueName}`;
    
    console.log('✅ Imagem do grupo enviada com sucesso');
    console.log('🔗 URL pública gerada:', imageUrl);
    console.log('📊 Comparação com padrão de produtos:');
    console.log('  - Produto: ${SUPABASE_CONFIG.URL}/storage/v1/object/public/product-images/${uniqueName}');
    console.log('  - Grupo:   ${SUPABASE_CONFIG.URL}/storage/v1/object/public/group-images/${uniqueName}');
    
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

// Buscar todos os grupos (incluindo os que o usuário não participa)
export const fetchAllGroups = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando todos os grupos para usuário:', userId);

    // Buscar todos os grupos
    const allGroups = await getTable('groups', 'select=*');
    
    if (!allGroups || !Array.isArray(allGroups) || allGroups.length === 0) {
      console.log('⚠️ Nenhum grupo encontrado');
      return [];
    }

    // Buscar todas as memberships do usuário
    const userMembershipsQuery = `user_id=eq.${userId}&select=group_id,role,status`;
    const userMemberships = await getTable('group_members', userMembershipsQuery);

    // Enriquecer dados dos grupos com informações de membership
    const enrichedGroups = await Promise.all(
      allGroups.map(async (group) => {
        const membership = userMemberships?.find(m => m.group_id === group.id);
        
        // Contar membros ativos do grupo
        const memberCountQuery = `group_id=eq.${group.id}&status=eq.ativo&select=id`;
        const members = await getTable('group_members', memberCountQuery);
        const memberCount = members ? members.length : 0;

        return {
          ...group,
          isMember: !!membership,
          isAdmin: membership?.role === 'admin',
          membershipStatus: membership?.status || null,
          memberCount: memberCount,
          lastActivity: group.created_at,
          hasPendingRequest: membership?.status === 'pendente'
        };
      })
    );

    console.log(`✅ Encontrados ${enrichedGroups.length} grupos (todos)`);
    return enrichedGroups;
  } catch (error) {
    console.error('❌ Erro ao buscar todos os grupos:', error);
    throw new Error(error.message || 'Falha ao buscar grupos');
  }
};

// Solicitar participação em um grupo
export const requestGroupMembership = async (groupId) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('📝 Solicitando participação no grupo:', groupId, 'para usuário:', userId);

    // Verificar se já existe uma solicitação ou membership
    const existingMembershipQuery = `group_id=eq.${groupId}&user_id=eq.${userId}`;
    const existingMemberships = await getTable('group_members', existingMembershipQuery);
    
    if (existingMemberships && existingMemberships.length > 0) {
      const existing = existingMemberships[0];
      if (existing.status === 'ativo') {
        throw new Error('Você já é membro deste grupo');
      } else if (existing.status === 'pendente') {
        throw new Error('Você já possui uma solicitação pendente para este grupo');
      }
    }

    // Buscar um admin do grupo para usar como "convidante"
    const adminQuery = `group_id=eq.${groupId}&role=eq.admin&status=eq.ativo&select=user_id&limit=1`;
    const admins = await getTable('group_members', adminQuery);
    
    if (!admins || admins.length === 0) {
      throw new Error('Grupo sem administradores ativos');
    }

    const invitedBy = admins[0].user_id;

    // Criar solicitação de membership
    const membershipRequest = {
      id: uuidv4(),
      group_id: groupId,
      user_id: userId,
      role: 'membro',
      status: 'pendente',
      invited_by: invitedBy,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const result = await insertIntoTable('group_members', membershipRequest);
    console.log('✅ Solicitação de participação criada:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao solicitar participação no grupo:', error);
    throw new Error(error.message || 'Falha ao solicitar participação no grupo');
  }
};

// Buscar solicitações pendentes de um grupo (apenas para admins)
export const fetchPendingMemberships = async (groupId) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando solicitações pendentes do grupo:', groupId);

    // Verificar se o usuário é admin do grupo
    const adminCheck = await checkUserMembership(groupId, userId);
    if (!adminCheck.isAdmin) {
      throw new Error('Apenas administradores podem ver solicitações pendentes');
    }

    // Buscar memberships pendentes
    const pendingQuery = `group_id=eq.${groupId}&status=eq.pendente&select=*`;
    const pendingMemberships = await getTable('group_members', pendingQuery);
    
    if (!pendingMemberships || pendingMemberships.length === 0) {
      console.log('⚠️ Nenhuma solicitação pendente encontrada');
      return [];
    }

    // Para cada solicitação, buscar informações do usuário
    const enrichedPendingMemberships = await Promise.all(
      pendingMemberships.map(async (membership) => {
        try {
          const userQuery = `user_id=eq.${membership.user_id}&select=first_name,last_name,image_url,registration_number`;
          const users = await getTable('user_extra_information', userQuery);
          const user = users && users.length > 0 ? users[0] : null;
          
          return {
            ...membership,
            user: user ? {
              first_name: user.first_name,
              last_name: user.last_name,
              full_name: `${user.first_name} ${user.last_name}`,
              image_url: user.image_url,
              registration_number: user.registration_number
            } : {
              first_name: 'Usuário',
              last_name: 'Desconhecido',
              full_name: 'Usuário Desconhecido',
              image_url: null,
              registration_number: 'N/A'
            }
          };
        } catch (error) {
          console.error('❌ Erro ao buscar dados do solicitante:', error);
          return {
            ...membership,
            user: {
              first_name: 'Usuário',
              last_name: 'Desconhecido',
              full_name: 'Usuário Desconhecido',
              image_url: null,
              registration_number: 'N/A'
            }
          };
        }
      })
    );

    console.log(`✅ Encontradas ${enrichedPendingMemberships.length} solicitações pendentes`);
    return enrichedPendingMemberships;
  } catch (error) {
    console.error('❌ Erro ao buscar solicitações pendentes:', error);
    throw new Error(error.message || 'Falha ao buscar solicitações pendentes');
  }
};

// Aprovar solicitação de participação (apenas para admins)
export const approveGroupMembership = async (membershipId, groupId) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Aprovando solicitação de participação:', membershipId);

    // Verificar se o usuário é admin do grupo
    const adminCheck = await checkUserMembership(groupId, userId);
    if (!adminCheck.isAdmin) {
      throw new Error('Apenas administradores podem aprovar solicitações');
    }

    // Atualizar status para 'ativo'
    const updateData = {
      status: 'ativo',
      joined_at: new Date().toISOString()
    };

    const result = await updateTableById('group_members', membershipId, updateData);
    console.log('✅ Solicitação aprovada:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao aprovar solicitação:', error);
    throw new Error(error.message || 'Falha ao aprovar solicitação');
  }
};

// Negar solicitação de participação (apenas para admins)
export const rejectGroupMembership = async (membershipId, groupId) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('❌ Negando solicitação de participação:', membershipId);

    // Verificar se o usuário é admin do grupo
    const adminCheck = await checkUserMembership(groupId, userId);
    if (!adminCheck.isAdmin) {
      throw new Error('Apenas administradores podem negar solicitações');
    }

    // Remover a solicitação completamente
    const result = await deleteFromTableById('group_members', membershipId);
    console.log('✅ Solicitação negada e removida:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao negar solicitação:', error);
    throw new Error(error.message || 'Falha ao negar solicitação');
  }
};

// Buscar detalhes de um grupo específico
export const fetchGroupById = async (groupId) => {
  try {
    console.log('🔍 Buscando detalhes do grupo:', groupId);
    
    const groupQuery = `id=eq.${groupId}&select=*`;
    const groups = await getTable('groups', groupQuery);
    
    if (!groups || groups.length === 0) {
      throw new Error('Grupo não encontrado');
    }

    const group = groups[0];
    console.log('✅ Grupo encontrado:', group.name);

    // Buscar membros do grupo com informações do usuário
    const membersQuery = `group_id=eq.${groupId}&select=*`;
    const members = await getTable('group_members', membersQuery);
    
    // Para cada membro, buscar informações adicionais do usuário
    const enrichedMembers = await Promise.all(
      (members || []).map(async (member) => {
        try {
          const userQuery = `user_id=eq.${member.user_id}&select=first_name,last_name,image_url,registration_number`;
          const users = await getTable('user_extra_information', userQuery);
          const user = users && users.length > 0 ? users[0] : null;
          
          return {
            ...member,
            user: user ? {
              first_name: user.first_name,
              last_name: user.last_name,
              full_name: `${user.first_name} ${user.last_name}`,
              image_url: user.image_url,
              registration_number: user.registration_number
            } : {
              first_name: 'Usuário',
              last_name: 'Desconhecido',
              full_name: 'Usuário Desconhecido',
              image_url: null,
              registration_number: 'N/A'
            }
          };
        } catch (error) {
          console.error('❌ Erro ao buscar dados do membro:', error);
          return {
            ...member,
            user: {
              first_name: 'Usuário',
              last_name: 'Desconhecido',
              full_name: 'Usuário Desconhecido',
              image_url: null,
              registration_number: 'N/A'
            }
          };
        }
      })
    );

    console.log(`✅ Encontrados ${enrichedMembers.length} membros`);

    return {
      ...group,
      members: enrichedMembers,
      memberCount: enrichedMembers.length,
      adminCount: enrichedMembers.filter(m => m.role === 'admin').length
    };
  } catch (error) {
    console.error('❌ Erro ao buscar grupo por ID:', error);
    throw new Error(error.message || 'Falha ao buscar grupo');
  }
};

// Buscar produtos do grupo
export const fetchGroupProducts = async (groupId) => {
  try {
    console.log('🔍 Buscando produtos do grupo:', groupId);
    
    // Buscar relações grupo-produto
    const groupProductsQuery = `group_id=eq.${groupId}&select=*`;
    const groupProducts = await getTable('group_products', groupProductsQuery);
    
    if (!groupProducts || groupProducts.length === 0) {
      console.log('⚠️ Nenhum produto encontrado no grupo');
      return [];
    }

    // Buscar detalhes dos produtos
    const productIds = groupProducts.map(gp => gp.product_id);
    const productsQuery = `id=in.(${productIds.join(',')})&select=*`;
    const products = await getTable('products', productsQuery);
    
    if (!products || products.length === 0) {
      return [];
    }

    // Para cada produto, buscar imagens e informações do proprietário
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Buscar imagens do produto
          const imagesQuery = `product_id=eq.${product.id}&select=image_url`;
          const images = await getTable('product_images', imagesQuery);
          
          // Buscar informações do proprietário
          const ownerQuery = `user_id=eq.${product.user_id}&select=first_name,last_name,image_url`;
          const owners = await getTable('user_extra_information', ownerQuery);
          const owner = owners && owners.length > 0 ? owners[0] : null;
          
          // Buscar status no grupo
          const groupProduct = groupProducts.find(gp => gp.product_id === product.id);
          
          return {
            ...product,
            images: images ? images.map(img => img.image_url) : [],
            mainImage: images && images.length > 0 ? images[0].image_url : null,
            owner: owner ? {
              name: `${owner.first_name} ${owner.last_name}`,
              image_url: owner.image_url
            } : {
              name: 'Proprietário Desconhecido',
              image_url: null
            },
            groupStatus: groupProduct?.status || 'pendente',
            priceFormatted: `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`
          };
        } catch (error) {
          console.error(`❌ Erro ao processar produto ${product.id}:`, error);
          return {
            ...product,
            images: [],
            mainImage: null,
            owner: { name: 'Proprietário Desconhecido', image_url: null },
            groupStatus: 'pendente',
            priceFormatted: `R$ ${parseFloat(product.price || 0).toFixed(2).replace('.', ',')}`
          };
        }
      })
    );

    console.log(`✅ Encontrados ${enrichedProducts.length} produtos no grupo`);
    return enrichedProducts;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos do grupo:', error);
    throw new Error(error.message || 'Falha ao buscar produtos do grupo');
  }
};

// Verificar se usuário é membro do grupo
export const checkUserMembership = async (groupId, userId = null) => {
  try {
    const currentUserId = userId || await AsyncStorage.getItem('userId');
    if (!currentUserId) {
      return { isMember: false, role: null, status: null };
    }

    const memberQuery = `group_id=eq.${groupId}&user_id=eq.${currentUserId}`;
    const memberships = await getTable('group_members', memberQuery);
    
    if (!memberships || memberships.length === 0) {
      return { isMember: false, role: null, status: null };
    }

    const membership = memberships[0];
    return {
      isMember: true,
      role: membership.role,
      status: membership.status,
      isAdmin: membership.role === 'admin',
      isActive: membership.status === 'ativo'
    };
  } catch (error) {
    console.error('❌ Erro ao verificar membership:', error);
    return { isMember: false, role: null, status: null };
  }
};

// Atualizar grupo
export const updateGroup = async (groupId, updateData) => {
  try {
    console.log('🔄 Atualizando grupo:', groupId);
    console.log('📝 Dados para atualização:', updateData);
    
    const result = await updateTableById('groups', groupId, updateData);
    
    console.log('✅ Grupo atualizado no banco de dados');
    console.log('📊 Resultado da atualização:', result);
    
    // Verificar se a URL da imagem foi salva corretamente
    if (updateData.image_url) {
      console.log('🖼️ URL da imagem salva:', updateData.image_url);
      console.log('🔍 Verificação da URL:');
      console.log('  - Inicia com http:', updateData.image_url.startsWith('http'));
      console.log('  - Contém group-images:', updateData.image_url.includes('group-images'));
      console.log('  - Contém groupId:', updateData.image_url.includes(groupId));
    }
    
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
