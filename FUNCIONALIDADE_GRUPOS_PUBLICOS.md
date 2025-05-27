# Funcionalidade de Grupos Públicos e Solicitação de Participação

## Resumo das Implementações

Este documento descreve as funcionalidades implementadas para permitir que todos os usuários vejam todos os grupos e solicitem participação em grupos dos quais não fazem parte.

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

#### **Store Atualizado (groupStore.js)**
- Novo estado `allGroups` para armazenar todos os grupos
- Função `loadAllGroups()` para carregar todos os grupos
- Função `requestMembership()` para solicitar participação

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

### 3. Tela de Detalhes do Grupo Restrita

#### **GroupDetailScreen.js**
- **Acesso Baseado em Membership**:
  - **Membros Ativos**: Veem todas as informações (produtos, membros, etc.)
  - **Solicitação Pendente**: Veem informações básicas + status de pendência
  - **Não Membros**: Veem informações básicas + botão de solicitar participação

#### **Interface Adaptativa**
- Tabs (Produtos/Membros) só aparecem para membros ativos
- Botões de ação mudam baseado no status:
  - Membro ativo: "Copiar Link de Convite"
  - Pendente: "Solicitação pendente"
  - Não membro: "Solicitar Participação"

#### **Tela de Acesso Restrito**
- Ícone e mensagem explicativa para usuários sem acesso
- Diferenciação visual entre "Aguardando Aprovação" e "Acesso Restrito"

## 🎨 Melhorias de UX

### Indicadores Visuais
- **Badges coloridos** para status de membership
- **Ícones intuitivos** (check-circle, clock-outline, plus)
- **Estados de loading** durante solicitações
- **Feedback visual** imediato após ações

### Navegação Intuitiva
- **Toggle fácil** entre visualizações
- **Botão de explorar** no estado vazio
- **Estatísticas contextuais** que mudam com a visualização

### Mensagens em Português
- Todas as mensagens de erro e sucesso em PT-BR
- Textos explicativos claros
- Confirmações antes de ações importantes

## 🔧 Estrutura Técnica

### Banco de Dados
Utiliza a estrutura existente da tabela `group_members`:
- `status`: 'pendente' | 'ativo'
- `role`: 'admin' | 'membro'
- `invited_by`: ID do usuário que "convidou" (admin do grupo)

### Estados do Zustand
```javascript
{
  groups: [],        // Grupos do usuário
  allGroups: [],     // Todos os grupos
  loading: false,
  error: null
}
```

### Fluxo de Dados
1. **Carregamento**: `fetchAllGroups()` busca grupos + memberships
2. **Enriquecimento**: Adiciona flags `isMember`, `hasPendingRequest`, etc.
3. **Renderização**: Interface se adapta baseada nos flags
4. **Ações**: Solicitações atualizam estado local + backend

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

## ✅ Funcionalidades Testadas

- [x] Toggle entre "Meus Grupos" e "Todos os Grupos"
- [x] Badges de status de membership
- [x] Solicitação de participação
- [x] Validações de duplicação
- [x] Interface restrita para não membros
- [x] Estados de loading e erro
- [x] Mensagens em português
- [x] Sintaxe JavaScript válida

## 🔄 Próximos Passos (Sugestões)

1. **Notificações**: Avisar admins sobre novas solicitações
2. **Aprovação**: Interface para admins aprovarem/negarem solicitações
3. **Busca**: Filtro para encontrar grupos específicos
4. **Categorias**: Organizar grupos por categorias
5. **Convites**: Sistema de convites por link ou email

---

**Status**: ✅ Implementado e funcional
**Compatibilidade**: React Native + Supabase
**Idioma**: Português (PT-BR) 
