# Warmly Infrastructure - Orquestração Multitenant

Infraestrutura completa para orquestração de serviços multitenant com Docker Compose, incluindo proxy reverso, serviços de plataforma, bancos de dados compartilhados e stacks isolados por cliente.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Componentes](#-componentes)
- [Pré-requisitos](#-pré-requisitos)
- [Início Rápido](#-início-rápido)
- [Uso](#-uso)
- [Redes Docker](#-redes-docker)
- [Gerenciamento](#-gerenciamento)
- [Adicionando Novos Clientes](#-adicionando-novos-clientes)

## 🎯 Visão Geral

Este projeto fornece uma infraestrutura completa de orquestração multitenant baseada em Docker Compose, com:

- **Proxy Reverso (Traefik)**: Roteamento inteligente de tráfego HTTP com descoberta automática de serviços
- **Serviços de Plataforma**: Dashboard (Dashy), gerenciamento de containers (Portainer), monitoramento de saúde (Gatus)
- **Serviços Compartilhados**: PostgreSQL e Milvus (banco vetorial) compartilhados entre clientes
- **Stacks por Cliente**: Cada cliente possui seu próprio conjunto isolado de serviços
- **Warmly-AI**: Agente de IA com RAG (Retrieval-Augmented Generation) e execução de ferramentas
- **Stack Manager**: Ferramenta de deploy e gerenciamento de stacks

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Rede "edge"                               │
│  ┌──────────────┐    ┌──────────┐    ┌───────────┐         │
│  │   Traefik    │───▶│  Dashy   │    │ Portainer │         │
│  │ (Reverse     │    │(Dashboard)│    │(Container │         │
│  │  Proxy)      │    └──────────┘    │  Mgmt)    │         │
│  └──────┬───────┘                     └───────────┘         │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Rede "shared"                              │
│  ┌─────────────┐              ┌──────────────────┐          │
│  │  PostgreSQL │              │  Milvus Stack    │          │
│  │  (Database) │              │  - etcd          │          │
│  └─────────────┘              │  - minio         │          │
│                                │  - milvus        │          │
│                                └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Stacks de Clientes                              │
│  ┌───────────────────┐    ┌───────────────────┐            │
│  │ Cliente 1         │    │ Cliente 2         │            │
│  │ - attendant       │    │ - services...     │            │
│  │ - api             │    │ ...               │            │
│  │ ...               │    └───────────────────┘            │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes

### 1. Reverse Proxy
- **Traefik v3.1**: Roteamento HTTP com descoberta automática de serviços Docker
- Dashboard disponível em `http://traefik.lvh.me`
- Configurado para usar a rede `edge` para comunicação com serviços expostos

### 2. Serviços de Plataforma

#### Dashy
- Dashboard unificado para todos os serviços
- Acesso: `http://dashboard.lvh.me`
- Configuração: `platform/dashy.conf.yml`

#### Portainer
- Interface web para gerenciamento de containers, imagens e volumes
- Acesso: `http://portainer.lvh.me`

#### Gatus (Healthcheck)
- Monitoramento de saúde e uptime de serviços
- Acesso: `http://status.lvh.me`
- Configuração de monitores: `platform/monitors/`

### 3. Serviços Compartilhados

#### PostgreSQL (Database)
- **Imagem**: `postgres:16`
- **Porta**: Interna na rede `shared`
- **Credenciais padrão**: postgres/postgres
- **Volume**: `prisma_database` para persistência de dados

#### Milvus (Vector Database)
- **Imagem**: `milvusdb/milvus:v2.3.9`
- **Porta**: `19530` (exposta)
- **Dependências**: etcd e MinIO
- **Redes**: `internal` (para etcd/minio) e `shared` (para clientes)
- **Volumes**: `prisma_etcd_data`, `prisma_minio_data`

### 4. Warmly-AI

Agente de IA com capacidades de RAG e execução de ferramentas. Inclui:
- Backend FastAPI (porta 8000)
- Frontend Streamlit (porta 8501)
- Integração com PostgreSQL e Milvus
- Suporte a múltiplos provedores de LLM (Ollama, OpenAI, Gemini, etc.)

**Submodule**: `warmly-ai/`

Documentação completa: Ver [warmly-ai/README.md](warmly-ai/README.md)

### 5. Stack Manager

Ferramenta para deploy e gerenciamento automatizado de stacks de clientes.

**Submodule**: `stack-manager/`

## 📦 Pré-requisitos

- **Docker Engine** 20.10+
- **Docker Compose** v2.0+
- **Git** com suporte a submodules
- **Bash** (para scripts de automação)

### Instalação do Docker

#### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Verificar instalação
```bash
docker --version
docker compose version
```

## 🚀 Início Rápido

### 1. Clonar o Repositório com Submodules

```bash
git clone --recurse-submodules git@github.com:Rfluid/warmly-infra.git
cd warmly-infra

# Se já clonou sem --recurse-submodules:
git submodule update --init --recursive
```

### 2. Inicializar Todas as Stacks

O script `init_all.sh` inicializa todos os serviços na ordem correta:

```bash
./scripts/init_all.sh
```

Opções disponíveis:
- `--pull`: Baixa as imagens mais recentes antes de iniciar
- `--recreate`: Força a recriação de containers
- `--no-color`: Desabilita saída colorida
- `--help`: Mostra ajuda

Exemplo com pull e recreate:
```bash
./scripts/init_all.sh --pull --recreate
```

### 3. Verificar Serviços

Acesse o dashboard para verificar o status de todos os serviços:

```
http://dashboard.lvh.me
```

## 📚 Uso

### Inicialização de Todas as Stacks

O script inicializa os serviços na seguinte ordem:

1. **Redes Docker** (`edge` e `shared`)
2. **Reverse Proxy** (Traefik)
3. **Serviços de Plataforma** (Dashy, Portainer, Healthcheck)
4. **Serviços Compartilhados** (PostgreSQL, Milvus)
5. **Stacks de Clientes** (prisma/attendant primeiro, depois os demais)

```bash
# Inicialização básica
./scripts/init_all.sh

# Com pull de imagens atualizadas
./scripts/init_all.sh --pull

# Forçar recriação de containers
./scripts/init_all.sh --recreate

# Combinado
./scripts/init_all.sh --pull --recreate
```

### Build e Tag do Warmly-AI

#### Desenvolvimento Local

```bash
cd warmly-ai

# Executar localmente (sem Docker)
make run

# Build da imagem Docker
make build

# Iniciar ambiente de desenvolvimento
make dev

# Parar ambiente de desenvolvimento
make dev-down
```

#### Produção

```bash
cd warmly-ai

# 1. Build da imagem com tag latest
make build

# Ou manualmente com tag específica:
docker build -t warmly-ai:latest .
docker build -t warmly-ai:v1.0.0 .

# 2. (Opcional) Tag para registry
docker tag warmly-ai:latest registry.example.com/warmly-ai:latest
docker tag warmly-ai:v1.0.0 registry.example.com/warmly-ai:v1.0.0

# 3. (Opcional) Push para registry
docker push registry.example.com/warmly-ai:latest
docker push registry.example.com/warmly-ai:v1.0.0

# 4. Iniciar em produção
make prod

# Parar ambiente de produção
make prod-down
```

#### Configuração do Warmly-AI

1. Copie o arquivo de exemplo de ambiente:
```bash
cd warmly-ai
cp example.env .env
```

2. Configure as variáveis essenciais em `.env`:
```bash
# Provedor de LLM (ollama, openai, gemini, cohere, anthropic, vertexai)
LLM_PROVIDER=ollama
LLM_MODEL_NAME=mistral

# Conexões (configuradas automaticamente no docker-compose)
POSTGRES_URI=postgresql://postgres:postgres@postgres:5432/postgres
MILVUS_URI=http://milvus:19530

# Google Cloud (para BigQuery)
GOOGLE_APPLICATION_CREDENTIALS=/app/data/service-account.google.json
BIGQUERY_TABLE_ID=seu-projeto.dataset.tabela
```

3. Adicione as credenciais do Google Cloud:
```bash
# Coloque o arquivo JSON da service account em:
warmly-ai/data/service-account.google.json
```

### Deploy do Stack Manager

O Stack Manager é um submodule dedicado ao gerenciamento automatizado de stacks.

```bash
cd stack-manager

# Seguir instruções específicas do stack-manager
# (consulte stack-manager/README.md quando disponível)
```

### Teardown de Todas as Stacks

Para parar e remover todos os containers:

```bash
./scripts/down_all.sh
```

Opções disponíveis:
- `--volumes`: Remove também os volumes nomeados (⚠️ **dados serão perdidos**)
- `--remove-orphans`: Remove containers órfãos
- `--no-color`: Desabilita saída colorida

```bash
# Parar tudo (mantém volumes/dados)
./scripts/down_all.sh

# Parar e remover volumes (ATENÇÃO: perde dados!)
./scripts/down_all.sh --volumes

# Com remoção de órfãos
./scripts/down_all.sh --remove-orphans
```

## 🌐 Redes Docker

O projeto utiliza duas redes principais:

### Rede `edge`
- **Tipo**: bridge (externa)
- **Uso**: Comunicação entre Traefik e serviços expostos publicamente
- **Serviços**: Traefik, Dashy, Portainer, Healthcheck, APIs de clientes
- **Criação**: Automática via `scripts/init_all.sh`

### Rede `shared`
- **Tipo**: bridge (externa)
- **Uso**: Recursos compartilhados entre todos os clientes
- **Serviços**: PostgreSQL, Milvus, stacks de clientes
- **Criação**: Automática via `scripts/init_all.sh`

### Redes Internas de Clientes
Cada stack de cliente pode ter sua própria rede interna para isolamento adicional.

### Criação Manual de Redes (se necessário)

```bash
docker network create --driver bridge edge
docker network create --driver bridge shared
```

## 🎛️ Gerenciamento

### Portainer
Interface web completa para gerenciamento de containers:
```
http://portainer.lvh.me
```

Recursos:
- Visualizar e gerenciar stacks
- Monitorar recursos (CPU, memória, rede)
- Executar comandos em containers
- Gerenciar volumes e redes
- Ver logs em tempo real

### Dashy (Dashboard)
Dashboard centralizado com links para todos os serviços:
```
http://dashboard.lvh.me
```

### Traefik Dashboard
Visualizar roteadores, middlewares e serviços:
```
http://traefik.lvh.me
```

### Gatus (Status Page)
Monitoramento de saúde e uptime:
```
http://status.lvh.me
```

### Comandos Docker Compose Úteis

```bash
# Ver logs de um serviço específico
cd reverse-proxy
docker compose logs -f traefik

# Reiniciar um serviço
cd platform
docker compose restart dashy

# Ver status de containers
docker compose ps

# Escalar um serviço (se suportado)
docker compose up -d --scale service_name=3

# Executar comando em container
docker compose exec service_name bash
```

## 👥 Adicionando Novos Clientes

### Estrutura de Diretórios

```
clients/
├── shared/
│   ├── database/
│   └── vector/
├── cliente1/
│   └── servico1/
│       └── docker-compose.yml
└── cliente2/
    └── servico1/
        └── docker-compose.yml
```

### Passos para Adicionar um Novo Cliente

1. **Criar estrutura de diretórios**:
```bash
mkdir -p clients/novo-cliente/servico1
```

2. **Criar `docker-compose.yml`**:
```yaml
# clients/novo-cliente/servico1/docker-compose.yml
services:
  api:
    image: sua-imagem:latest
    restart: unless-stopped
    networks:
      - edge      # Para exposição via Traefik
      - shared    # Para acessar PostgreSQL e Milvus
    environment:
      POSTGRES_URI: postgresql://postgres:postgres@database:5432/postgres
      MILVUS_URI: http://milvus:19530
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=edge"
      - "traefik.http.routers.novo-cliente-api.rule=Host(`api.novo-cliente.lvh.me`)"
      - "traefik.http.routers.novo-cliente-api.entrypoints=web"
      - "traefik.http.services.novo-cliente-api.loadbalancer.server.port=8000"

networks:
  edge:
    external: true
  shared:
    external: true
```

3. **Adicionar ao Dashboard Dashy** (opcional):
```yaml
# platform/dashy.conf.yml
sections:
  - name: "Novo Cliente"
    icon: "mdi:account-circle-outline"
    items:
      - title: "API"
        url: "http://api.novo-cliente.lvh.me"
        icon: "mdi:api"
```

4. **Adicionar monitor de saúde** (opcional):
```yaml
# platform/monitors/novo-cliente-api.yaml
endpoints:
  - name: "Novo Cliente API"
    url: "http://api.novo-cliente.lvh.me/health"
    interval: 30s
    conditions:
      - "[STATUS] == 200"
```

5. **Inicializar o novo stack**:
```bash
# O script init_all.sh detectará automaticamente o novo cliente
./scripts/init_all.sh
```

### Boas Práticas

- ✅ Use volumes nomeados para persistência de dados
- ✅ Configure health checks em seus serviços
- ✅ Use secrets do Docker para credenciais sensíveis
- ✅ Documente variáveis de ambiente necessárias
- ✅ Use imagens com tags específicas (evite `:latest` em produção)
- ✅ Configure logs adequadamente
- ✅ Use labels do Traefik para roteamento automático

## 🔍 Troubleshooting

### Containers não iniciam

```bash
# Verificar logs
docker compose logs nome-do-servico

# Verificar status
docker compose ps

# Recriar container específico
docker compose up -d --force-recreate nome-do-servico
```

### Problemas de rede

```bash
# Verificar redes existentes
docker network ls

# Inspecionar rede
docker network inspect edge
docker network inspect shared

# Recriar redes (⚠️ para todos os serviços primeiro)
docker network rm edge shared
docker network create --driver bridge edge
docker network create --driver bridge shared
```

### Problemas com Traefik

```bash
# Ver logs do Traefik
cd reverse-proxy
docker compose logs -f traefik

# Acessar dashboard para debug
open http://traefik.lvh.me
```

### Limpar volumes órfãos

```bash
# Listar volumes
docker volume ls

# Remover volumes não utilizados (⚠️ cuidado!)
docker volume prune
```

### Reset completo (⚠️ PERDE TODOS OS DADOS)

```bash
./scripts/down_all.sh --volumes
docker system prune -a --volumes
./scripts/init_all.sh --pull
```

## 📊 Estrutura do Projeto

```
.
├── clients/                    # Stacks de clientes
│   ├── shared/
│   │   ├── database/          # PostgreSQL compartilhado
│   │   └── vector/            # Milvus compartilhado
│   └── {cliente}/
│       └── {servico}/
│           └── docker-compose.yml
├── platform/                   # Serviços de plataforma
│   ├── dashy.yml              # Dashboard
│   ├── dashy.conf.yml         # Configuração do Dashy
│   ├── portainer.yml          # Gerenciamento de containers
│   ├── healthcheck.yml        # Gatus (monitoramento)
│   └── monitors/              # Configurações de health checks
├── reverse-proxy/              # Traefik
│   └── docker-compose.yml
├── scripts/                    # Scripts de automação
│   ├── init_all.sh            # Inicializa todas as stacks
│   ├── down_all.sh            # Para todas as stacks
│   ├── init_waha_webhook.sh   # Webhook específico
│   └── update_waha_worker_api_key.sh
├── warmly-ai/                  # Submodule: Agente de IA
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Makefile
│   └── src/                   # Código-fonte Python
├── stack-manager/              # Submodule: Gerenciador de deploy
└── README.md                   # Este arquivo
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 📞 Suporte

Para questões e suporte:
- Abra uma issue no GitHub
- Consulte a documentação dos submodules individuais
- Verifique logs via Portainer ou Docker CLI

## 🔗 Links Úteis

- **Traefik**: https://doc.traefik.io/traefik/
- **Docker Compose**: https://docs.docker.com/compose/
- **Portainer**: https://docs.portainer.io/
- **Dashy**: https://dashy.to/docs/
- **Milvus**: https://milvus.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/

