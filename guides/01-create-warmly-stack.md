# Guia: Criando uma Stack Warmly com o Stack Manager

Este guia fornece instruções detalhadas sobre como criar e implantar uma nova stack Warmly-AI para um cliente usando o Stack Manager.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Visão Geral](#visão-geral)
- [Passo 1: Preparar Informações do Cliente](#passo-1-preparar-informações-do-cliente)
- [Passo 2: Usar o Stack Manager](#passo-2-usar-o-stack-manager)
- [Passo 3: Configurar Credenciais](#passo-3-configurar-credenciais)
- [Passo 4: Personalizar Prompts](#passo-4-personalizar-prompts)
- [Passo 5: Popular o Banco Vetorial](#passo-5-popular-o-banco-vetorial)
- [Passo 6: Deploy da Stack](#passo-6-deploy-da-stack)
- [Passo 7: Configurar Webhook do WAHA](#passo-7-configurar-webhook-do-waha)
- [Verificação e Testes](#verificação-e-testes)
- [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Acesso ao servidor de infraestrutura
- ✅ Docker e Docker Compose instalados e funcionando
- ✅ Stack Manager clonado e atualizado (`git submodule update --init --recursive`)
- ✅ Credenciais do Google Cloud (Service Account) com acesso ao BigQuery
- ✅ Informações do cliente (nome, domínio, ID do WAHA)
- ✅ Documentos/dados para o banco vetorial (opcional, mas recomendado)
- ✅ Chave API do provedor de LLM (OpenAI, Anthropic, etc.) ou Ollama rodando localmente

## 🎯 Visão Geral

O processo de criação de uma stack Warmly envolve:

1. **Preparação**: Coletar informações do cliente
2. **Geração**: Usar o Stack Manager para criar a estrutura
3. **Configuração**: Definir variáveis de ambiente e credenciais
4. **Personalização**: Customizar prompts e comportamento do agente
5. **Deploy**: Implantar a stack e inicializar serviços
6. **Integração**: Conectar com WAHA (WhatsApp) e testar

```
┌─────────────────────────────────────────────────────────────┐
│                    Stack Manager                             │
│                         ↓                                    │
│              Gera estrutura do cliente                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│   clients/{cliente}/warmly-ai/                               │
│   ├── docker-compose.yml                                    │
│   ├── .env                                                  │
│   ├── data/                                                 │
│   │   └── service-account.google.json                       │
│   └── prompts/                                              │
│       ├── system.md                                         │
│       ├── evaluate_tools.md                                 │
│       └── ...                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Deploy e Inicialização
```

## 📝 Passo 1: Preparar Informações do Cliente

Colete as seguintes informações antes de começar:

### Informações Obrigatórias

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Nome do Cliente** | Identificador único do cliente | `acme-corp` |
| **Domínio** | Subdomínio para acesso via Traefik | `acme.lvh.me` ou `acme.seudominio.com` |
| **ID do Cliente WAHA** | ID usado pelo WAHA para identificar este cliente | `acme-123` ou `5511999999999` |
| **BigQuery Table ID** | Tabela para registro de intenções | `seu-projeto.warmly.purchase_intents` |
| **LLM Provider** | Provedor do modelo de linguagem | `openai`, `anthropic`, `gemini`, `ollama` |
| **LLM Model** | Modelo específico | `gpt-4o`, `claude-3-5-sonnet-20241022`, `mistral` |

### Informações Opcionais

- **Documentos para RAG**: PDFs, TXTs, DOCXs com informações do cliente
- **Porta customizada**: Se não quiser usar portas automáticas
- **Configurações específicas**: Temperatura do LLM, top_k, etc.

### Template de Coleta

Crie um arquivo `cliente-info.txt`:

```txt
# Informações do Cliente: ACME Corp
# Data: 2025-10-03

## Identificação
CLIENTE_ID=acme-corp
CLIENTE_NOME="ACME Corporation"
DOMINIO=acme.lvh.me

## WAHA Integration
WAHA_CLIENT_ID=5511999999999
WAHA_WEBHOOK_URL=http://warmly-ai-acme:8000/api/waha/webhook

## BigQuery
BIGQUERY_PROJECT_ID=warmly-production
BIGQUERY_DATASET=clients_data
BIGQUERY_TABLE_ID=warmly-production.clients_data.purchase_intents

## LLM Configuration
LLM_PROVIDER=openai
LLM_MODEL_NAME=gpt-4o
LLM_API_KEY=sk-proj-...
LLM_TEMPERATURE=0

## Network Configuration
REDE_EDGE=edge
REDE_SHARED=shared
PORTA_BACKEND=8000
PORTA_FRONTEND=8501
```

## 🚀 Passo 2: Usar o Stack Manager

### Opção A: Comando CLI do Stack Manager

```bash
cd /home/rfluid/development/Warmly/infra/stack-manager

# Criar nova stack para o cliente
./stack-manager create \
  --client-name acme-corp \
  --domain acme.lvh.me \
  --waha-id 5511999999999 \
  --bigquery-table warmly-production.clients_data.purchase_intents \
  --llm-provider openai \
  --llm-model gpt-4o

# Output esperado:
# ✅ Stack criada em: /home/rfluid/development/Warmly/infra/clients/acme-corp/warmly-ai
# ℹ️  Próximos passos:
#    1. Configurar .env com suas credenciais
#    2. Adicionar service-account.google.json em data/
#    3. Personalizar prompts/ conforme necessário
#    4. Executar: ./scripts/init_all.sh
```

### Opção B: Criação Manual (se Stack Manager não estiver disponível)

Se o stack manager ainda não estiver completamente implementado, você pode criar manualmente:

```bash
cd /home/rfluid/development/Warmly/infra

# 1. Criar estrutura de diretórios
mkdir -p clients/acme-corp/warmly-ai/{data,prompts}

# 2. Copiar template do warmly-ai
cp -r warmly-ai/docker-compose.yml clients/acme-corp/warmly-ai/
cp warmly-ai/example.env clients/acme-corp/warmly-ai/.env
cp -r warmly-ai/prompts/* clients/acme-corp/warmly-ai/prompts/

# 3. Renomear arquivos de exemplo
cd clients/acme-corp/warmly-ai/prompts
for file in *.example.md; do
  mv "$file" "${file%.example.md}.md"
done
```

### Estrutura Gerada

Após executar o Stack Manager, você terá:

```
clients/acme-corp/warmly-ai/
├── docker-compose.yml          # Configuração dos serviços
├── .env                        # Variáveis de ambiente
├── data/                       # Dados persistentes
│   ├── service-account.google.json  # Credenciais GCP (adicionar)
│   └── documents/              # Documentos para RAG (opcional)
├── prompts/                    # Prompts customizáveis
│   ├── system.md              # Prompt de sistema (personalidade)
│   ├── evaluate_tools.md      # Lógica de seleção de ferramentas
│   ├── evaluate_tools_parallel.md
│   ├── error_handler.md       # Tratamento de erros
│   ├── summarize.md           # Sumarização de conversas
│   └── user.md                # Template de mensagens do usuário
└── README.md                  # Documentação específica do cliente
```

## 🔐 Passo 3: Configurar Credenciais

### 3.1. Editar `.env`

Navegue até o diretório da stack e edite o arquivo `.env`:

```bash
cd clients/acme-corp/warmly-ai
nano .env  # ou vim, code, etc.
```

Configure as seguintes variáveis **essenciais**:

```bash
# ============================================
# CONFIGURAÇÃO DO CLIENTE: ACME Corp
# ============================================

# Ambiente
ENV=production

# LLM Configuration
LLM_PROVIDER=openai
LLM_MODEL_NAME=gpt-4o
LLM_API_KEY=sk-proj-SUAS_CREDENCIAIS_AQUI
LLM_TEMPERATURE=0

# Tool Evaluator (pode usar o mesmo ou modelo mais barato)
TOOL_EVALUATOR_LLM_PROVIDER=openai
TOOL_EVALUATOR_LLM_MODEL_NAME=gpt-4o-mini
TOOL_EVALUATOR_LLM_API_KEY=sk-proj-SUAS_CREDENCIAIS_AQUI
TOOL_EVALUATOR_LLM_TEMPERATURE=0

# Summarizer (pode usar modelo mais barato)
SUMMARIZE_LLM_PROVIDER=openai
SUMMARIZE_LLM_MODEL_NAME=gpt-4o-mini
SUMMARIZE_LLM_API_KEY=sk-proj-SUAS_CREDENCIAIS_AQUI
SUMMARIZE_LLM_TEMPERATURE=0

# Text Embedding
TEXT_EMBEDDING_PROVIDER=openai
TEXT_EMBEDDING_MODEL_NAME=text-embedding-3-small
TEXT_EMBEDDING_API_KEY=sk-proj-SUAS_CREDENCIAIS_AQUI

# Paths (dentro do container)
DATA_DIR=/app/data
PROMPTS_DIR=/app/prompts

# API URL (interno)
API_URL=http://localhost:8000

# Database (usa PostgreSQL compartilhado)
POSTGRES_URI=postgresql://postgres:postgres@database:5432/postgres?sslmode=disable

# Vector Database (usa Milvus compartilhado)
MILVUS_URI=http://milvus:19530
MILVUS_COLLECTION=acme_corp_collection
RAG_AVAILABLE=true

# BigQuery
GOOGLE_APPLICATION_CREDENTIALS=/app/data/service-account.google.json
BIGQUERY_TABLE_ID=warmly-production.clients_data.purchase_intents

# Features
PARALLEL_GENERATION=false
```

### 3.2. Adicionar Service Account do Google Cloud

```bash
# Copiar arquivo de credenciais para o diretório data/
cp ~/Downloads/warmly-production-sa-key.json \
   clients/acme-corp/warmly-ai/data/service-account.google.json

# Ajustar permissões
chmod 600 clients/acme-corp/warmly-ai/data/service-account.google.json
```

**Importante**: A Service Account precisa ter a role **"BigQuery Data Editor"** no projeto.

### 3.3. Configurar docker-compose.yml

Edite o `docker-compose.yml` para incluir labels do Traefik e configurações de rede:

```yaml
services:
  warmly-ai:
    image: warmly-ai:latest
    container_name: warmly-ai-acme
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_URI: postgresql://postgres:postgres@database:5432/postgres?sslmode=disable
      MILVUS_URI: http://milvus:19530
      DATA_DIR: /app/data
      PROMPTS_DIR: /app/prompts
      API_URL: http://localhost:8000
    volumes:
      - ./data:/app/data
      - ./prompts:/app/prompts
    networks:
      - edge    # Para acesso via Traefik
      - shared  # Para PostgreSQL e Milvus
    labels:
      # Backend API
      - "traefik.enable=true"
      - "traefik.docker.network=edge"
      - "traefik.http.routers.acme-api.rule=Host(`api.acme.lvh.me`)"
      - "traefik.http.routers.acme-api.entrypoints=web"
      - "traefik.http.services.acme-api.loadbalancer.server.port=8000"
      
      # Frontend (opcional, se quiser expor)
      - "traefik.http.routers.acme-frontend.rule=Host(`chat.acme.lvh.me`)"
      - "traefik.http.routers.acme-frontend.entrypoints=web"
      - "traefik.http.services.acme-frontend.loadbalancer.server.port=8501"

networks:
  edge:
    external: true
  shared:
    external: true
```

## 🎨 Passo 4: Personalizar Prompts

Veja o guia detalhado em [02-edit-prompts.md](./02-edit-prompts.md).

Resumo rápido:

```bash
cd clients/acme-corp/warmly-ai/prompts

# Editar personalidade do agente
nano system.md

# Editar lógica de seleção de ferramentas
nano evaluate_tools.md
```

## 📚 Passo 5: Popular o Banco Vetorial

### 5.1. Preparar Documentos

```bash
cd clients/acme-corp/warmly-ai/data
mkdir -p documents

# Copiar documentos do cliente (PDFs, TXTs, etc.)
cp /path/to/client/docs/* documents/
```

### 5.2. Upload via API

Existem duas formas de popular o banco vetorial:

#### Opção A: Via Frontend Streamlit

1. Acesse `http://chat.acme.lvh.me` (se exposto)
2. Use a interface de upload de documentos
3. Aguarde o processamento

#### Opção B: Via API REST

```bash
# Fazer upload de documentos via API
curl -X POST "http://api.acme.lvh.me/api/vectorstore/upload" \
  -F "files=@documents/catalogo-produtos.pdf" \
  -F "files=@documents/politicas-vendas.txt"

# Response esperado:
# {
#   "message": "2 documents uploaded successfully",
#   "collection": "acme_corp_collection"
# }
```

#### Opção C: Script Python

```python
#!/usr/bin/env python3
# upload_docs.py
import requests
from pathlib import Path

API_URL = "http://api.acme.lvh.me"
DOCS_DIR = Path("./data/documents")

files = []
for doc in DOCS_DIR.glob("*"):
    if doc.is_file():
        files.append(("files", (doc.name, open(doc, "rb"))))

response = requests.post(
    f"{API_URL}/api/vectorstore/upload",
    files=files
)

print(response.json())
```

Executar:

```bash
python3 upload_docs.py
```

## 🚀 Passo 6: Deploy da Stack

### 6.1. Build da Imagem Warmly-AI (se necessário)

Se ainda não tiver a imagem `warmly-ai:latest`:

```bash
cd /home/rfluid/development/Warmly/infra/warmly-ai

# Build da imagem
make build

# Ou manualmente:
docker build -t warmly-ai:latest .

# Verificar
docker images | grep warmly-ai
```

### 6.2. Inicializar Todas as Stacks

```bash
cd /home/rfluid/development/Warmly/infra

# Inicializar tudo (incluindo a nova stack)
./scripts/init_all.sh

# Ou apenas a stack do cliente
cd clients/acme-corp/warmly-ai
docker compose up -d
```

### 6.3. Verificar Logs

```bash
# Ver logs da stack
cd clients/acme-corp/warmly-ai
docker compose logs -f

# Verificar se está saudável
docker compose ps
```

Output esperado:

```
NAME                IMAGE              STATUS
warmly-ai-acme      warmly-ai:latest   Up 2 minutes (healthy)
```

## 📲 Passo 7: Configurar Webhook do WAHA

### 7.1. Obter Informações do WAHA

Você precisará:
- **WAHA_URL**: URL da instância WAHA (ex: `http://waha:3000`)
- **WAHA_API_KEY**: Chave API do WAHA
- **SESSION_ID**: ID da sessão do WhatsApp (geralmente o número)

### 7.2. Configurar Webhook

Edite e execute o script:

```bash
cd /home/rfluid/development/Warmly/infra/scripts

# Configurar variáveis
export WAHA_API_KEY_PLAIN="sua-chave-api-waha"
export WEBHOOK_URL="http://warmly-ai-acme:8000/api/waha/webhook"

# Executar script
./init_waha_webhook.sh

# Output esperado:
# ⏳ Waiting for Waha to become available...
# ✅ Waha is up. Configuring webhook for session 'default'...
# ✅ Webhook registered successfully.
```

### 7.3. Testar Integração WAHA → Warmly-AI

Envie uma mensagem via WhatsApp para o número configurado:

```
Olá! Quero saber sobre os produtos.
```

Verifique os logs:

```bash
cd clients/acme-corp/warmly-ai
docker compose logs -f warmly-ai

# Você deve ver:
# [INFO] Received webhook from WAHA: customer_id=5511999999999
# [INFO] Processing message: "Olá! Quero saber sobre os produtos."
# [INFO] Using RAG tool to search knowledge base...
# [INFO] Sending response via WAHA...
```

## ✅ Verificação e Testes

### 1. Health Check da API

```bash
curl http://api.acme.lvh.me/health

# Response esperado:
# {"status": "healthy", "version": "1.0.0"}
```

### 2. Teste de Conversa via API

```bash
curl -X POST "http://api.acme.lvh.me/api/messages/send" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, quais produtos vocês oferecem?",
    "thread_id": "test-123",
    "customer_id": "test-customer"
  }'
```

### 3. Verificar BigQuery

Envie uma mensagem que gere intenção de compra e verifique no BigQuery:

```sql
SELECT *
FROM `warmly-production.clients_data.purchase_intents`
WHERE customer_id = '5511999999999'
ORDER BY event_timestamp DESC
LIMIT 10;
```

### 4. Teste End-to-End via WhatsApp

1. **Enviar mensagem inicial**: "Olá!"
2. **Perguntar sobre produto**: "Quero saber sobre o produto X"
3. **Expressar intenção**: "Ok, vou comprar o produto X"
4. **Verificar confirmação**: Deve receber confirmação via WhatsApp
5. **Verificar BigQuery**: Deve ter registro da intenção

### 5. Monitorar via Dashboards

- **Dashy**: `http://dashboard.lvh.me` - Adicionar links para a nova stack
- **Portainer**: `http://portainer.lvh.me` - Ver containers e logs
- **Traefik**: `http://traefik.lvh.me` - Ver roteadores configurados

## 🐛 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker compose logs warmly-ai

# Verificar configuração
docker compose config

# Recriar container
docker compose up -d --force-recreate warmly-ai
```

### Problema: Não conecta ao PostgreSQL

```bash
# Verificar se database está rodando
docker ps | grep database

# Testar conexão manualmente
docker exec warmly-ai-acme psql postgresql://postgres:postgres@database:5432/postgres -c "SELECT 1"
```

### Problema: Não conecta ao Milvus

```bash
# Verificar se Milvus está rodando
docker ps | grep milvus

# Testar conexão
docker exec warmly-ai-acme curl http://milvus:19530/healthz
```

### Problema: BigQuery - Permission Denied

```bash
# Verificar se service account tem permissões
gcloud projects get-iam-policy warmly-production \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:*warmly*"

# Adicionar role se necessário
gcloud projects add-iam-policy-binding warmly-production \
  --member="serviceAccount:warmly-sa@warmly-production.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"
```

### Problema: Webhook WAHA não funciona

```bash
# Verificar se WAHA alcança o container
docker exec waha curl http://warmly-ai-acme:8000/health

# Verificar logs do WAHA
docker logs waha -f

# Reconfigurar webhook
export WAHA_API_KEY_PLAIN="..."
export WEBHOOK_URL="http://warmly-ai-acme:8000/api/waha/webhook"
./scripts/init_waha_webhook.sh
```

### Problema: LLM não responde

```bash
# Verificar variáveis de ambiente
docker exec warmly-ai-acme env | grep LLM

# Testar API key
docker exec warmly-ai-acme python3 -c "
import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('LLM_API_KEY'))
print(client.models.list())
"
```

## 📊 Próximos Passos

Após criar e implantar a stack:

1. ✅ **Adicionar ao Dashboard**: Edite `platform/dashy.conf.yml` para incluir links
2. ✅ **Configurar Monitoramento**: Adicione health checks em `platform/monitors/`
3. ✅ **Documentar Customizações**: Crie um README específico do cliente
4. ✅ **Treinar a IA**: Adicione mais documentos ao banco vetorial
5. ✅ **Refinar Prompts**: Ajuste o comportamento baseado em feedback
6. ✅ **Backup**: Configure backup dos volumes de dados

## 📚 Referências

- [Guia de Edição de Prompts](./02-edit-prompts.md)
- [IDs de Cliente WAHA ↔ BigQuery](./03-client-ids-waha-bigquery.md)
- [Warmly-AI README](../warmly-ai/README.md)
- [README Principal](../README.md)

## 🆘 Suporte

Em caso de problemas:
1. Consulte a seção de Troubleshooting
2. Verifique os logs: `docker compose logs -f`
3. Abra uma issue no repositório
4. Contate a equipe de infraestrutura

