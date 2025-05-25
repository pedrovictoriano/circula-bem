# Solução para Erro na Criação de Grupos

## 🔍 Diagnóstico do Problema

O erro estava relacionado à importação incorreta da configuração do Supabase no `groupService.js`.

## ✅ Correções Aplicadas

### 1. **Corrigida importação da configuração**
```javascript
// ❌ Antes (incorreto)
import { SUPABASE_CONFIG } from './api';

// ✅ Depois (correto)
import { SUPABASE_CONFIG } from '../config/env';
```

### 2. **Adicionados logs de debug**
- Logs para verificar se a configuração está carregada
- Logs detalhados do processo de criação
- Stack traces para melhor debugging

### 3. **Validações adicionadas**
- Verificação se `SUPABASE_CONFIG.URL` está definido
- Verificação se o usuário está autenticado
- Tratamento de erros mais específico

## 🧪 Como Testar

### 1. **Verificar logs no console**
Ao tentar criar um grupo, você deve ver logs como:
```
🔧 Carregando configuração do Supabase...
🔧 Configuração Supabase: { URL: 'Configurado', KEY: 'Configurado' }
🏗️ Criando grupo: { id: '...', name: '...', ... }
📡 URL da requisição: https://gcwjfkswymioiwhuaiku.supabase.co/rest/v1/groups
📡 Status da resposta: 201 Created
✅ Grupo criado no banco: { ... }
```

### 2. **Passos para testar**
1. Abra o app
2. Navegue para "Criar Grupo"
3. Preencha nome e descrição
4. (Opcional) Adicione uma foto
5. Toque em "Criar Grupo"
6. Verifique os logs no console

### 3. **Se ainda houver erro**
Verifique se:
- [ ] O bucket `group-images` existe no Supabase Storage
- [ ] As políticas RLS estão configuradas
- [ ] O usuário está logado (token válido)

## 🔧 Configuração do Bucket

Se o bucket `group-images` não existir:

1. Acesse o painel do Supabase
2. Vá em Storage
3. Crie um novo bucket chamado `group-images`
4. Configure como público
5. Adicione as políticas de segurança:

```sql
-- Política para upload (apenas admins)
CREATE POLICY "Admins can upload group images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'group-images' AND
  (storage.foldername(name))[1] IN (
    SELECT g.id::text FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = auth.uid() AND gm.role = 'admin'
  )
);

-- Política para visualização (público)
CREATE POLICY "Public access to group images" ON storage.objects
FOR SELECT USING (bucket_id = 'group-images');
```

## 🚨 Possíveis Erros e Soluções

### Erro: "Configuração do Supabase não encontrada"
**Solução**: Verifique se o arquivo `src/config/env.js` existe e está exportando `SUPABASE_CONFIG`

### Erro: "Usuário não autenticado"
**Solução**: Faça login novamente no app

### Erro: "Falha ao criar grupo: 403"
**Solução**: Configure as políticas RLS na tabela `groups`

### Erro: "Falha ao fazer upload da imagem"
**Solução**: 
1. Verifique se o bucket `group-images` existe
2. Configure as políticas de storage
3. Certifique-se que o bucket é público

## 📝 Logs Importantes

Se você ver estes logs, significa que está funcionando:
- ✅ `Configuração final do Supabase: { URL: 'Configurado', KEY: 'Configurado' }`
- ✅ `Grupo criado no banco: { ... }`
- ✅ `Membro adicionado ao grupo: { ... }`

Se você ver estes logs, há problema:
- ❌ `Configuração do Supabase não encontrada`
- ❌ `Usuário não autenticado`
- ❌ `Falha ao criar grupo: ...`

## 🔄 Próximos Passos

Após corrigir o erro:
1. Teste criar um grupo sem imagem
2. Teste criar um grupo com imagem
3. Verifique se o grupo aparece na lista
4. Teste o refresh da lista de grupos

## 📞 Suporte

Se o erro persistir, compartilhe:
1. Os logs completos do console
2. O erro exato que aparece
3. Se está testando no simulador ou dispositivo real 
