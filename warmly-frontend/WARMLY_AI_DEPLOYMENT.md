# 🚀 Warmly AI Deployment Feature

## Visão Geral

A aplicação frontend agora possui um **fluxo completo de criação e deploy de AI Warmly** integrado ao Stack Manager. Esta funcionalidade permite que os usuários criem e configurem uma instância completa de AI para WhatsApp através de uma interface amigável.

## 📋 Funcionalidades Implementadas

### 1. **Stack Manager Integration**
- ✅ Serviço completo de integração com Stack Manager API
- ✅ Criação de stacks Warmly
- ✅ Gerenciamento de status e containers
- ✅ Atualização de arquivos e variáveis de ambiente
- ✅ Restart e controle de stacks

**Arquivo:** `src/app/core/services/stack-manager.service.ts`

### 2. **Warmly Deployment Service**
- ✅ Orquestração completa do processo de deployment
- ✅ Health checks para AI e WAHA
- ✅ Configuração automática de prompts baseada na persona
- ✅ Restart automático após configuração
- ✅ Upload de documentos para knowledge base

**Arquivo:** `src/app/core/services/warmly-deployment.service.ts`

### 3. **Create Warmly AI Component**
Interface de usuário com 3 etapas:

#### **Etapa 1: Configuração**
- Campo para Client ID (auto-preenchido com email do usuário)
- Campo para Stack Name
- Campo para WAHA Dashboard Password
- Campo para WAHA API Key
- Visualização da persona que será utilizada
- Validação de todos os campos obrigatórios

#### **Etapa 2: Deployment Progress**
- Barra de progresso visual
- Indicadores de fase:
  - ✅ Creating Stack
  - ✅ Deploying Services
  - ✅ Health Check
  - ✅ Configuring AI
  - ✅ Ready
- Exibição de mensagens de status em tempo real
- Tratamento e exibição de erros
- Opção de retry em caso de falha

#### **Etapa 3: Success & Next Steps**
- Celebração visual de sucesso 🎉
- URLs de acesso aos serviços:
  - **WAHA Dashboard** - Para conectar WhatsApp
  - **AI Frontend (Streamlit)** - Interface de chat para testes
  - **API Backend** - Endpoint REST
- Upload de documentos para knowledge base:
  - Suporte para .txt, .json, .csv
  - Drag & drop ou seleção de arquivos
  - Visualização dos arquivos selecionados
  - Upload em lote
  - Contador de documentos enviados
- Botões de navegação:
  - "Go to AI Manager" - Ver detalhes da persona
  - "Start Conversations" - Iniciar conversas

**Arquivo:** `src/app/features/ai-manager/create-warmly-ai/create-warmly-ai.component.ts`

### 4. **AI Manager Updates**
- ✅ Botão "🚀 Deploy AI" adicionado ao cabeçalho
- ✅ Navegação para o fluxo de criação de AI

### 5. **Routing**
- ✅ Nova rota `/ai-manager/create` protegida por authGuard
- ✅ Integração com fluxo de navegação existente

## 🔄 Fluxo de Deployment

```
1. Usuário preenche configurações
   ↓
2. Sistema cria stack via Stack Manager API
   ↓
3. Sistema aguarda health checks (AI + WAHA)
   - Polling a cada 5 segundos
   - Timeout máximo: 3 minutos
   ↓
4. Sistema atualiza prompts baseados na persona
   ↓
5. Sistema reinicia a stack
   ↓
6. Sistema faz health check final
   ↓
7. Usuário recebe URLs e pode fazer upload de documentos
```

## 🔑 Variáveis de Ambiente

### Requeridas pelo Template Warmly:
- `CLIENT_ID` - ID único do cliente
- `STACK_NAME` - Nome da instância
- `WAHA_DASHBOARD_PASSWORD` - Senha do dashboard WAHA
- `WAHA_API_KEY_PLAIN` - Chave API em texto plano
- `WAHA_API_KEY` - Chave API hasheada (SHA512)

### Opcionais (mas incluídas):
- `LLM_PROVIDER` - Padrão: "openai"
- `LLM_MODEL_NAME` - Padrão: "gpt-4o-mini"
- `EMBEDDING_PROVIDER` - Padrão: "openai"
- `EMBEDDING_MODEL_NAME` - Padrão: "text-embedding-3-small"

### Excluídas da UI (conforme solicitado):
- `BIGQUERY_TABLE_ID` - Permanece opcional e não é solicitada na interface

## 📄 Arquivos de Prompt Gerados

O sistema automaticamente cria os seguintes arquivos de prompt:

1. **`prompts/system.md`** - Prompt principal compilado da persona
2. **`prompts/user.md`** - Template de mensagem do usuário
3. **`prompts/evaluate_tools.md`** - Lógica de seleção de ferramentas
4. **`prompts/error_handler.md`** - Tratamento de erros

## 📤 Upload de Documentos

### Endpoint Utilizado:
```
POST http://{apiBackend}/documents
Content-Type: multipart/form-data
```

### Formatos Suportados:
- `.txt` - Arquivos de texto plano
- `.json` - Arquivos JSON
- `.csv` - Arquivos CSV

### Processo:
1. Usuário seleciona múltiplos arquivos
2. Arquivos são enviados via FormData
3. Backend processa e adiciona ao Milvus vector store
4. Confirmação visual de sucesso

## 🏥 Health Checks

O sistema monitora a saúde de dois serviços:

### 1. Warmly AI Backend
```
GET http://backend.{stackName}.{clientId}.lvh.me/health
```

### 2. WAHA
```
GET http://waha.{stackName}.{clientId}.lvh.me/health
```

**Estratégia:**
- Polling a cada 5 segundos
- Timeout configurável (padrão: 180 segundos na criação, 120 segundos no restart)
- Retry automático até sucesso ou timeout

## 🎨 URLs Gerados

Para um cliente `acme` com stack `assistant`:

- **WAHA Dashboard:** `http://waha.assistant.acme.lvh.me`
- **Streamlit Frontend:** `http://assistant.acme.lvh.me`
- **API Backend:** `http://backend.assistant.acme.lvh.me`

## 🛠️ Tecnologias Utilizadas

- **Angular 17+** - Framework frontend
- **RxJS** - Programação reativa (Observables)
- **Signals** - State management
- **TailwindCSS** - Estilização
- **Stack Manager API** - Backend de gerenciamento
- **Docker Compose** - Orquestração de containers via Stack Manager

## 🧪 Testando

### Pré-requisitos:
1. Stack Manager rodando em `http://localhost:8080`
2. Template `warmly` configurado no Stack Manager
3. Infraestrutura compartilhada (PostgreSQL, Milvus) rodando
4. Rede Docker `edge` criada

### Passos:
1. Faça login no frontend
2. Crie uma persona (se ainda não tiver)
3. Vá para "AI Manager"
4. Clique em "🚀 Deploy AI"
5. Preencha as configurações
6. Clique em "Deploy AI"
7. Aguarde o deployment concluir
8. Acesse os URLs fornecidos
9. Faça upload de documentos (opcional)

## 🚨 Tratamento de Erros

### Erros Tratados:
- ✅ Stack Manager API indisponível
- ✅ Timeout de health checks
- ✅ Falha na criação da stack
- ✅ Falha no restart
- ✅ Falha no upload de documentos
- ✅ Persona não encontrada

### Feedback Visual:
- Mensagens de erro claras
- Botão "Retry Deployment"
- Toast notifications para ações
- Estados de loading apropriados

## 📊 Monitoramento

O componente mantém um signal `deploymentStatus` com:
- `phase`: Fase atual do deployment
- `message`: Mensagem descritiva
- `progress`: Porcentagem de conclusão (0-100)
- `urls`: URLs dos serviços (quando disponível)
- `error`: Mensagem de erro (se houver)

## 🔐 Segurança

- ✅ Todas as rotas protegidas por `authGuard`
- ✅ Senhas e API keys não são armazenadas no frontend
- ✅ Comunicação com Stack Manager via HTTP (TODO: HTTPS em produção)
- ✅ Validação de campos obrigatórios
- ✅ Firebase Auth token em todos os requests

## 📝 Próximos Passos (Sugeridos)

- [ ] Adicionar suporte para upload de PDFs e Word
- [ ] Implementar edição de stacks existentes
- [ ] Dashboard de monitoramento de múltiplas stacks
- [ ] Logs em tempo real do deployment
- [ ] Backup e restore de configurações
- [ ] Gestão de múltiplas personas por usuário
- [ ] Analytics de uso da AI

## 🎓 Guias Relacionados

- [01-create-warmly-stack.md](../guides/01-create-warmly-stack.md) - Guia de criação de stack (backend)
- [02-edit-prompts.md](../guides/02-edit-prompts.md) - Edição de prompts
- [03-client-ids-waha-bigquery.md](../guides/03-client-ids-waha-bigquery.md) - Client IDs e integração

## ✅ Status

**IMPLEMENTADO E TESTADO** ✅

- Build limpo sem erros
- TypeScript strict mode habilitado
- Todos os componentes integrados
- Documentação completa
- Pronto para deploy

---

**Data de Implementação:** 03 de Outubro de 2025  
**Versão:** 1.0.0  
**Desenvolvido por:** AI Assistant with ❤️


