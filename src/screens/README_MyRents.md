# Tela de Meus Aluguéis - MyRentsScreen

## Descrição
A tela **MyRentsScreen** exibe todos os aluguéis do usuário logado, permitindo filtrar por status (todos, ativos, finalizados, pendentes, cancelados) e visualizar detalhes de cada aluguel.

## 🔄 **Atualização - Nova Estrutura de Aluguéis**

A estrutura da tabela `rents` foi atualizada para ser mais eficiente:

### **Mudanças Principais:**
- **Array de Datas**: Um aluguel agora contém múltiplas datas em um único registro
- **Status Enum**: Status oficial do banco (`pendente`, `confirmado`, `em andamento`, `concluído`, `cancelado`)
- **Valor Total**: Campo `total_amount` armazena o valor total em centavos
- **ID Único**: Chave primária simples em vez de composta

## Funcionalidades Implementadas

### 1. **Busca de Aluguéis**
- Integração com Supabase para buscar aluguéis reais do banco de dados
- Consulta relaciona tabelas: `rents`, `products`, `product_images`, e `user_extra_information`
- Carregamento assíncrono com indicadores visuais
- **NOVO**: Processamento de arrays de datas e valores totais

### 2. **Filtros por Status**
- **Todos**: Exibe todos os aluguéis
- **Ativos**: Aluguéis confirmados ou em andamento
- **Finalizados**: Aluguéis concluídos
- **Pendentes**: Aluguéis aguardando confirmação
- **NOVO**: **Cancelados**: Aluguéis cancelados

### 3. **Estados de Interface**
- **Loading**: Spinner durante carregamento
- **Empty State**: Mensagem quando não há aluguéis
- **Error Handling**: Tratamento de erros com alertas informativos
- **Pull to Refresh**: Atualização dos dados
- **NOVO**: Exibição de número de dias e valor total

### 4. **Gerenciamento de Estado**
- Utiliza **Zustand** para gerenciamento global do estado
- Store centralizado em `src/stores/rentStore.js`
- Funções otimizadas para performance
- **NOVO**: Suporte a estatísticas de cancelados

## Estrutura de Arquivos

```
src/
├── screens/
│   ├── MyRentsScreen.js          # Tela principal (ATUALIZADA)
│   ├── SelectDateScreen.js       # Seleção de datas (ATUALIZADA)
│   └── FinalizeRentalScreen.js   # Finalização (ATUALIZADA)
├── stores/
│   └── rentStore.js              # Store Zustand (ATUALIZADA)
├── services/
│   ├── rentService.js            # Serviços para API (ATUALIZADA)
│   └── api.js                    # Funções de criação (ATUALIZADA)
└── temp/
    └── insertTestData.js         # Dados de teste (ATUALIZADA)
```

## Como Testar

### 1. **Nova Estrutura do Banco**
```sql
-- Estrutura atualizada da tabela rents:
create table public.rents (
  id uuid not null default gen_random_uuid (),
  product_id uuid null,
  user_id uuid null,
  status public.rent_status null,      -- NOVO: enum status
  total_amount integer null,           -- NOVO: valor em centavos
  dates date[] null,                   -- NOVO: array de datas
  constraint rents_pkey primary key (id)
);

-- Enum de status:
create type public.rent_status as enum (
  'pendente',
  'confirmado', 
  'em andamento',
  'cancelado',
  'concluído'
);
```

### 2. **Dados de Teste Atualizados**
O arquivo `src/temp/insertTestData.js` foi atualizado para:
- Criar produtos com categorias reais
- Inserir aluguéis com arrays de datas
- Usar os novos status enum
- Calcular valores totais em centavos

### 3. **Como Executar Testes**
```javascript
// No console do React Native:
import { insertTestRentData } from './src/temp/insertTestData';
await insertTestRentData();
```

## Fluxo de Dados Atualizado

1. **Inicialização**: `useEffect` chama `loadRents()`
2. **Store**: `rentStore.loadRents()` executa
3. **Serviço**: `rentService.fetchUserRents()` busca dados
4. **Queries**:
   - Busca aluguéis com `dates[]`, `status`, `total_amount`
   - Para cada aluguel, busca dados do produto
   - Busca imagens do produto
   - Busca informações do proprietário
5. **Processamento**: 
   - Mapeia status do banco para interface
   - Calcula período (primeira até última data)
   - Formata valores monetários
6. **Atualização**: Store atualiza e componente re-renderiza

## Status dos Aluguéis

### **Mapeamento Status (Banco → Interface):**
- **`pendente`** → 🟡 **Pendente**: Aguardando confirmação
- **`confirmado`** → 🟢 **Ativo**: Confirmado
- **`em andamento`** → 🟢 **Ativo**: Em andamento
- **`concluído`** → ⚫ **Finalizado**: Concluído
- **`cancelado`** → 🔴 **Cancelado**: Cancelado

## Próximos Passos

1. **Implementar navegação**: Ao clicar em um aluguel, navegar para detalhes
2. **Adicionar ações**: Cancelar, avaliar, estender aluguel
3. **Melhorar filtros**: Por período, por produto, por proprietário
4. **Notificações**: Alertas para vencimentos
5. **Atualização de status**: Interface para mudar status
6. **Relatórios**: Dashboard com estatísticas detalhadas

## Troubleshooting

### Problemas Comuns

1. **"Nenhum aluguel encontrado"**
   - Verifique se o usuário está logado
   - Confirme se existem dados na tabela `rents` com a nova estrutura
   - Use o botão de debug para testar

2. **Erro ao processar datas**
   - Verifique se o campo `dates` é um array válido
   - Confirme se as datas estão no formato correto (YYYY-MM-DD)

3. **Status não aparece corretamente**
   - Verifique se o enum `rent_status` está configurado no banco
   - Confirme se o mapeamento de status está funcionando

4. **Valores não aparecem**
   - Verifique se `total_amount` está armazenado em centavos
   - Confirme se a conversão para reais está correta

### Migração de Dados

Se você tem dados antigos na estrutura anterior:
1. Faça backup dos dados existentes
2. Crie novos registros na estrutura atualizada
3. Teste a nova funcionalidade
4. Remova dados antigos após confirmação

### Logs Úteis
O sistema registra logs detalhados no console:
- Processamento de arrays de datas
- Mapeamento de status
- Cálculos de valores
- Erros de consulta
