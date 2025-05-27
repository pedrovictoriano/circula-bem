# Funcionalidade de Grupos Públicos e Solicitação de Participação

## Resumo das Implementações

Este documento descreve as funcionalidades implementadas para permitir que todos os usuários vejam todos os grupos e solicitem participação em grupos dos quais não fazem parte, além do gerenciamento de solicitações por administradores.

## 🚀 Funcionalidades Implementadas

### 1. Visualização de Todos os Grupos

#### **GroupsScreen.js**
- **Toggle de Visualização**: Botão no header para alternar entre "Meus Grupos" e "Todos os Grupos"
- **Indicadores Visuais**: 
  - Badge verde "Membro" para grupos que o usuário participa
  - Badge amarelo "Pendente" para grupos com solicitação pendente
  - Botão azul "Solicitar" para grupos que o usuário pode solicitar participação
- **Estatísticas Dinâmicas**: As estatísticas no topo se adaptam ao modo de visualização

#### **Novos Serviços (groupService.js)**
- `fetchAllGroups()`: Busca todos os grupos com informações de membership do usuário
- `requestGroupMembership()`: Permite solicitar participação em um grupo
- `fetchPendingMemberships()`: Busca solicitações pendentes (apenas para admins)
- `approveGroupMembership()`: Aprova solicitação de participação (apenas para admins)
- `rejectGroupMembership()`: Nega solicitação de participação (apenas para admins)

#### **Store Atualizado (groupStore.js)**
- Novo estado `allGroups` para armazenar todos os grupos
- Novo estado `pendingMemberships` para solicitações pendentes
- Função `loadAllGroups()` para carregar todos os grupos
- Função `requestMembership()` para solicitar participação
- Função `loadPendingMemberships()` para carregar solicitações pendentes
- Função `approveMembership()` para aprovar solicitações
- Função `rejectMembership()` para negar solicitações

### 2. Solicitação de Participação

#### **Fluxo de Solicitação**
1. Usuário visualiza grupo na lista "Todos os Grupos"
2. Clica no botão "Solicitar" no card do grupo
3. Confirma a solicitação em um Alert
4. Sistema cria registro na tabela `group_members` com status "pendente"
5. Badge do grupo muda para "Pendente"

#### **Validações Implementadas**
- Verifica se usuário já é membro
- Verifica se já existe solicitação pendente
- Busca admin do grupo para usar como "convidante"
- Tratamento de erros com mensagens em português

### 3. Gerenciamento de Solicitações (Administradores)

#### **Interface de Administração**
- **Aba "Solicitações"**: Aparece automaticamente para admins quando há solicitações pendentes
- **Badge no Header**: Indica o número de solicitações pendentes
- **Auto-Switch**: Troca automaticamente para aba de solicitações quando chegam novas
- **Ações Rápidas**: Botões de aprovar (✓) e negar (✗) para cada solicitação

#### **Fluxo de Aprovação**
1. Admin recebe notificação visual de nova solicitação
2. Acessa aba "Solicitações" no grupo
3. Vê lista de usuários com solicitações pendentes
4. Aprova ou nega cada solicitação individualmente
5. Sistema atualiza status e remove da lista de pendentes

#### **Funcionalidades para Admins**
- **Visualização de Solicitantes**: Nome, foto e dados dos usuários
- **Confirmação de Ações**: Alerts de confirmação antes de aprovar/negar
- **Feedback Imediato**: Mensagens de sucesso após ações
- **Atualização Automática**: Contadores e listas atualizados em tempo real

### 4. Tela de Detalhes do Grupo Restrita

#### **GroupDetailScreen.js**
- **Acesso Baseado em Membership**:
  - **Membros Ativos**: Veem todas as informações (produtos, membros, etc.)
  - **Solicitação Pendente**: Veem informações básicas + status de pendência
  - **Não Membros**: Veem informações básicas + botão de solicitar participação
  - **Administradores**: Acesso completo + aba de gerenciamento de solicitações

#### **Interface Adaptativa**
- Tabs (Produtos/Membros/Solicitações) só aparecem para membros ativos
- Aba de Solicitações só para admins com solicitações pendentes
- Botões de ação mudam baseado no status:
  - Membro ativo: "Copiar Link de Convite"
  - Pendente: "Solicitação pendente"
  - Não membro: "Solicitar Participação"
  - Admin: Todas as opções + gerenciamento de solicitações

## 🎨 Melhorias de UX

### Indicadores Visuais
- **Badges coloridos** para status de membership
- **Ícones intuitivos** (check-circle, clock-outline, plus, account-clock)
- **Estados de loading** durante solicitações
- **Feedback visual** imediato após ações
- **Badge no header** para solicitações pendentes

### Navegação Intuitiva
- **Toggle fácil** entre visualizações
- **Botão de explorar** no estado vazio
- **Estatísticas contextuais** que mudam com a visualização
- **Auto-switch** para aba de solicitações

### Mensagens em Português
- Todas as mensagens de erro e sucesso em PT-BR
- Textos explicativos claros
- Confirmações antes de ações importantes
- Feedback específico para cada ação

## 🔧 Estrutura Técnica

### Banco de Dados
Utiliza a estrutura existente da tabela `group_members`:
- `status`: 'pendente' | 'ativo'
- `role`: 'admin' | 'membro'
- `invited_by`: ID do usuário que "convidou" (admin do grupo)

### Estados do Zustand
```javascript
{
  groups: [],                // Grupos do usuário
  allGroups: [],            // Todos os grupos
  pendingMemberships: [],   // Solicitações pendentes (admins)
  loading: false,
  error: null
}
```

### Fluxo de Dados
1. **Carregamento**: `fetchAllGroups()` busca grupos + memberships
2. **Enriquecimento**: Adiciona flags `isMember`, `hasPendingRequest`, etc.
3. **Renderização**: Interface se adapta baseada nos flags
4. **Ações**: Solicitações atualizam estado local + backend
5. **Gerenciamento**: Admins podem aprovar/negar solicitações

## 📱 Experiência do Usuário

### Cenário 1: Usuário Explorando Grupos
1. Acessa "Grupos" → vê apenas seus grupos
2. Clica no ícone de explorar → vê todos os grupos
3. Identifica grupos interessantes pelos badges
4. Solicita participação com um clique

### Cenário 2: Usuário Visualizando Grupo Específico
1. Clica em um grupo que não participa
2. Vê informações básicas (nome, descrição, estatísticas)
3. Clica em "Solicitar Participação"
4. Recebe confirmação e aguarda aprovação

### Cenário 3: Usuário com Solicitação Pendente
1. Vê badge "Pendente" na lista de grupos
2. Ao acessar o grupo, vê status "Aguardando Aprovação"
3. Não pode ver produtos/membros até aprovação

### Cenário 4: Administrador Gerenciando Solicitações
1. Recebe indicador visual de nova solicitação
2. Acessa grupo e vê aba "Solicitações" destacada
3. Revisa informações do solicitante
4. Aprova ou nega com confirmação
5. Vê feedback imediato da ação

## ✅ Funcionalidades Testadas

- [x] Toggle entre "Meus Grupos" e "Todos os Grupos"
- [x] Badges de status de membership
- [x] Solicitação de participação
- [x] Validações de duplicação
- [x] Interface restrita para não membros
- [x] Estados de loading e erro
- [x] Mensagens em português
- [x] Sintaxe JavaScript válida
- [x] **NOVO**: Aba de solicitações para admins
- [x] **NOVO**: Aprovação de solicitações
- [x] **NOVO**: Negação de solicitações
- [x] **NOVO**: Indicadores visuais para admins
- [x] **NOVO**: Auto-switch para aba de solicitações
- [x] **NOVO**: Validações de permissão para admins

## 🔄 Próximos Passos (Sugestões)

1. **Notificações Push**: Avisar admins sobre novas solicitações em tempo real
2. **Histórico**: Log de aprovações/negações para auditoria
3. **Busca**: Filtro para encontrar grupos específicos
4. **Categorias**: Organizar grupos por categorias
5. **Convites**: Sistema de convites por link ou email
6. **Bulk Actions**: Aprovar/negar múltiplas solicitações de uma vez
7. **Motivos**: Campo opcional para justificar negação de solicitações

---

**Status**: ✅ Implementado e funcional (incluindo gerenciamento por admins)
**Compatibilidade**: React Native + Supabase
**Idioma**: Português (PT-BR) 
