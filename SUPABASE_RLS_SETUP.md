# Configuração RLS para Upload de Imagens de Perfil

## Problema
Durante o processo de cadastro, o usuário ainda não está autenticado, mas precisa fazer upload da imagem de perfil. O Supabase por padrão bloqueia uploads não autenticados.

## Solução: Configurar RLS (Row Level Security)

### 1. Acessar o Dashboard do Supabase
- Vá para [https://supabase.com](https://supabase.com)
- Acesse seu projeto
- Navegue para **Storage** > **Policies**

### 2. Selecionar o Bucket
- Encontre e clique no bucket `profile-images`
- Se o bucket não existir, crie-o primeiro em **Storage** > **Buckets**

### 3. Criar Nova Política
Clique em **"New Policy"** e configure:

#### Política 1: Permitir Upload Público
```sql
-- Nome da Política: Allow public uploads to profile-images
-- Operação: INSERT
-- Definição da Política:
(bucket_id = 'profile-images')
```

#### Política 2: Permitir Leitura Pública (Opcional)
```sql
-- Nome da Política: Allow public read from profile-images  
-- Operação: SELECT
-- Definição da Política:
(bucket_id = 'profile-images')
```

#### Política 3: Permitir Update/Delete para Donos (Opcional)
```sql
-- Nome da Política: Allow owners to update/delete their profile images
-- Operação: UPDATE, DELETE
-- Definição da Política:
(bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### 4. Configuração Alternativa (Mais Restritiva)
Se você quiser uma política mais segura que só permite upload na pasta do próprio usuário:

```sql
-- Para uploads durante cadastro (usar com cuidado)
(bucket_id = 'profile-images' AND starts_with(name, regexp_replace(auth.jwt() ->> 'sub', '-', '', 'g')))
```

### 5. Verificar Configurações do Bucket
Certifique-se de que:
- O bucket `profile-images` está marcado como **Público** se você quer que as imagens sejam acessíveis publicamente
- As políticas estão **habilitadas**

### 6. Teste
Após configurar as políticas:
1. Tente fazer um novo cadastro com imagem
2. Verifique nos logs se o upload foi bem-sucedido
3. Confirme se a imagem aparece no bucket

## Políticas Recomendadas (Final)

Para máxima segurança e funcionalidade:

### Storage Objects (objects):
```sql
-- 1. Permitir inserção pública no bucket profile-images
CREATE POLICY "Public upload to profile-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images');

-- 2. Permitir leitura pública no bucket profile-images  
CREATE POLICY "Public read from profile-images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- 3. Permitir que usuários atualizem/deletem suas próprias imagens
CREATE POLICY "Users can update own profile images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile images" ON storage.objects  
FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Notas Importantes

1. **Segurança**: Permitir uploads públicos pode ser um risco de segurança. Considere implementar validações adicionais no client-side.

2. **Limpeza**: Implemente um processo para limpar imagens órfãs (sem usuário associado).

3. **Limites**: Configure limites de tamanho de arquivo no Supabase para evitar abuse.

4. **Monitoramento**: Monitore o uso do storage para detectar possíveis abusos.

## Troubleshooting

Se ainda assim não funcionar:
1. Verifique se o bucket existe e está configurado como público
2. Confirme se as políticas estão ativas
3. Teste com o SQL Editor do Supabase
4. Verifique os logs de erro no dashboard do Supabase 
