# Guia: Editando Prompts da Stack Warmly-AI

Este guia explica como personalizar o comportamento do agente Warmly-AI através da edição dos arquivos de prompt após a stack ter sido criada e implantada.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquivos de Prompt Disponíveis](#arquivos-de-prompt-disponíveis)
- [Como Editar Prompts](#como-editar-prompts)
- [Prompt: system.md](#prompt-systemmd)
- [Prompt: evaluate_tools.md](#prompt-evaluate_toolsmd)
- [Prompt: error_handler.md](#prompt-error_handlermd)
- [Prompt: summarize.md](#prompt-summarizemd)
- [Aplicar Alterações](#aplicar-alterações)
- [Boas Práticas](#boas-práticas)
- [Exemplos de Customização](#exemplos-de-customização)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O comportamento do agente Warmly-AI é altamente configurável através de prompts em Markdown. Esses arquivos controlam:

- **Personalidade e tom** do agente
- **Lógica de decisão** sobre qual ferramenta usar (RAG, registro de intenção, resposta direta)
- **Tratamento de erros** e recuperação
- **Sumarização** de conversas longas
- **Formatação** de mensagens

```
┌──────────────────────────────────────────────────────────┐
│                  Arquivos de Prompt                       │
├──────────────────────────────────────────────────────────┤
│  system.md             → Personalidade e instruções base  │
│  evaluate_tools.md     → Decisão de qual ferramenta usar │
│  error_handler.md      → Como lidar com erros            │
│  summarize.md          → Como resumir conversas          │
│  user.md              → Template de mensagens do usuário │
└──────────────────────────────────────────────────────────┘
                            ↓
                  Carregados em runtime
                            ↓
              Influenciam comportamento do LLM
```

**Vantagem**: Você pode modificar o comportamento sem recompilar código!

## 📂 Arquivos de Prompt Disponíveis

Após criar uma stack, você encontrará os seguintes prompts em `clients/{cliente}/warmly-ai/prompts/`:

| Arquivo | Propósito | Quando é usado |
|---------|-----------|----------------|
| `system.md` | Define personalidade, tom e regras gerais do agente | A cada conversa, como contexto inicial |
| `evaluate_tools.md` | Lógica para decidir entre RAG, register_intent ou generate_response | A cada turno, para escolher a próxima ação |
| `evaluate_tools_parallel.md` | Versão paralela que gera resposta junto com avaliação | Quando `PARALLEL_GENERATION=true` |
| `error_handler.md` | Instruções sobre como recuperar de erros | Quando ocorre um erro durante execução |
| `summarize.md` | Como resumir o histórico de conversas | Quando conversa fica muito longa |
| `user.md` | Template para formatar mensagens do usuário | A cada mensagem do usuário |

## 🛠️ Como Editar Prompts

### Método 1: Edição Direta no Servidor (Recomendado para Produção)

```bash
# 1. Navegar até o diretório de prompts
cd /home/rfluid/development/Warmly/infra/clients/{cliente}/warmly-ai/prompts

# 2. Editar o prompt desejado
nano system.md
# ou
vim system.md
# ou
code system.md  # se tiver VS Code instalado

# 3. Salvar o arquivo

# 4. Reiniciar o container para aplicar (ver seção "Aplicar Alterações")
```

### Método 2: Edição Local e Deploy via Git (Recomendado para Desenvolvimento)

```bash
# 1. Clonar ou pull do repositório
cd /path/to/local/warmly-infra
git pull

# 2. Editar localmente
code clients/acme-corp/warmly-ai/prompts/system.md

# 3. Testar localmente (opcional)
cd clients/acme-corp/warmly-ai
docker compose up

# 4. Commit e push
git add .
git commit -m "chore(acme): customize system prompt"
git push

# 5. No servidor, fazer pull e reiniciar
cd /home/rfluid/development/Warmly/infra
git pull
cd clients/acme-corp/warmly-ai
docker compose restart warmly-ai
```

### Método 3: Montagem de Volume (para testes rápidos)

Os prompts já são montados como volume no `docker-compose.yml`:

```yaml
volumes:
  - ./prompts:/app/prompts
```

Isso significa que **edições nos arquivos são refletidas imediatamente** após reiniciar o container (não precisa rebuild).

## 📝 Prompt: system.md

Este é o prompt mais importante. Define a **personalidade** e **regras gerais** do agente.

### Localização

```
clients/{cliente}/warmly-ai/prompts/system.md
```

### Estrutura Recomendada

```markdown
# System Instructions for {Cliente} AI Agent

## Role & Purpose

[Descreva o papel do agente para este cliente específico]

## Core Principles

1. **Princípio 1**
   - Detalhes...

2. **Princípio 2**
   - Detalhes...

## Personality Guidelines

- **Tone:** [Formal/Casual/Profissional/Amigável]
- **Language:** [Português/Inglês/Espanhol]
- **Style:** [Conciso/Detalhado]

## Specific Instructions

[Instruções específicas para este cliente]

## Example Behaviors

### ✅ Good:
- User: ...
  AI: ...

### ❌ Avoid:
- User: ...
  AI: ... (por que evitar)
```

### Exemplo: E-commerce de Eletrônicos

```markdown
# System Instructions for TechStore AI Agent

## Role & Purpose

Você é o assistente virtual da TechStore, especializado em produtos eletrônicos. 
Seu objetivo é ajudar clientes a encontrar produtos, esclarecer dúvidas técnicas 
e registrar intenções de compra de forma natural e profissional.

## Core Principles

1. **Expertise Técnica**
   - Você é profundamente conhecedor de especificações técnicas.
   - Sempre busque no banco de dados (RAG) quando falar sobre produtos.
   - Use linguagem técnica apropriada mas acessível.

2. **Foco em Vendas Consultivas**
   - Não seja pushy, mas identifique oportunidades de venda.
   - Faça perguntas para entender as necessidades do cliente.
   - Registre intenção de compra apenas quando o cliente demonstrar decisão clara.

3. **Suporte Pós-venda**
   - Forneça informações sobre garantia e suporte.
   - Direcione para canais apropriados quando necessário.

## Personality Guidelines

- **Tone:** Profissional e prestativo, com toque de entusiasmo por tecnologia
- **Language:** Português brasileiro
- **Style:** Claro e objetivo, mas amigável

## Product Knowledge

Sempre que um cliente mencionar ou perguntar sobre um produto:
1. **PRIMEIRO** use RAG para buscar informações oficiais
2. Apresente especificações relevantes
3. Mencione diferenciais competitivos
4. Informe preço e disponibilidade (se no documento)

## Purchase Intent Detection

Registre intenção de compra quando o cliente usar frases como:
- "Quero comprar..."
- "Pode anotar/registrar pedido de..."
- "Vou levar o..."
- "Fecha negócio do..."

## Example Behaviors

### ✅ Good:

- User: _"Quero um notebook para edição de vídeo"_
  AI: _"Ótimo! Para edição de vídeo, recomendo modelos com processador forte 
       e placa de vídeo dedicada. Deixa eu buscar as melhores opções que 
       temos disponíveis..."_ (usa RAG)

- User: _"Ok, vou levar o MacBook Pro M3"_
  AI: _(Primeiro usa RAG para confirmar product_id)_
       _(Depois registra intenção)_
       _"Perfeito! Registrei seu interesse no MacBook Pro M3. Nossa equipe 
       de vendas entrará em contato em breve para finalizar sua compra. 
       Posso ajudar com mais alguma coisa?"_

### ❌ Avoid:

- Mencionar que você é uma IA ou falar sobre suas limitações técnicas
- Inventar especificações de produtos (sempre use RAG)
- Registrar intenção sem buscar o product_id primeiro
- Ser excessivamente técnico com clientes leigos
```

### Exemplo: Serviço Médico

```markdown
# System Instructions for ClinicCare AI Agent

## Role & Purpose

Você é a assistente virtual da ClinicCare, responsável por ajudar pacientes 
com informações sobre serviços médicos, agendamentos e dúvidas gerais de saúde.

⚠️ **IMPORTANTE**: Você NÃO faz diagnósticos médicos nem prescreve tratamentos.

## Core Principles

1. **Confidencialidade e Empatia**
   - Trate todas as informações com sensibilidade.
   - Demonstre empatia e compreensão.
   - Encoraje os pacientes a consultar profissionais de saúde.

2. **Informação, Não Diagnóstico**
   - Forneça informações sobre serviços disponíveis.
   - NÃO interprete sintomas nem faça diagnósticos.
   - Sempre recomende consulta com médico para questões clínicas.

3. **Facilitação de Agendamento**
   - Registre intenção quando o paciente quiser marcar consulta.
   - Explique procedimentos e preparos necessários.

## Personality Guidelines

- **Tone:** Acolhedor, calmo e profissional
- **Language:** Português brasileiro formal mas acessível
- **Style:** Claro e compassivo

## Limitations (sempre lembrar)

❌ NÃO faça: diagnósticos, prescrições, interpretação de exames
✅ FAÇA: forneça informações, esclareça dúvidas sobre serviços, registre intenções

## Example Behaviors

### ✅ Good:

- User: _"Estou com dor de cabeça há 3 dias"_
  AI: _"Sinto muito que esteja passando por isso. Dores de cabeça persistentes 
       merecem atenção médica. Posso ajudar a agendar uma consulta com um 
       de nossos clínicos gerais para avaliar seu caso adequadamente?"_

### ❌ Avoid:

- User: _"Estou com dor de cabeça"_
  AI: _"Pode ser enxaqueca, tome um analgésico"_ (NUNCA!)
```

## 🔧 Prompt: evaluate_tools.md

Este prompt define a **lógica de decisão** do agente: quando usar cada ferramenta.

### Localização

```
clients/{cliente}/warmly-ai/prompts/evaluate_tools.md
```

### Ferramentas Disponíveis

1. **`rag`**: Busca informações no banco vetorial
2. **`register_intent`**: Registra intenção de compra no BigQuery
3. **`generate_response`**: Responde diretamente sem ferramentas

### Estrutura do Arquivo

```markdown
# Tool Selection Guide for {Cliente}

**Task**: Analyze user input and choose the appropriate tool.

## Available Tools

1. **`rag`** - Search knowledge base
2. **`register_intent`** - Register purchase intent
3. **`generate_response`** - Reply directly

## Rules for Tool Selection

### Use `rag` if:
- [Condições específicas]
→ Set `rag_query` with: [formato]

### Use `register_intent` if:
- [Condições específicas]
→ Set `intent_payload` with: [formato]

### Use `generate_response` if:
- [Condições específicas]
→ No payload required

## Multi-Step Logic

[Explicar fluxos que requerem múltiplas etapas]
```

### Exemplo de Customização: E-commerce

```markdown
# Tool Selection Guide for TechStore

## Rules for Tool Selection

### Use `rag` if:

- User asks about a product (name, specs, price, availability)
- User mentions a product code or model
- User asks "what do you have" or similar exploratory questions
- You need to find the `product_id` for intent registration

→ Set `rag_query` with: the product name or user's question

**Examples:**
- User: "Quais notebooks vocês têm?" → `rag_query: "notebooks disponíveis"`
- User: "Quanto custa o iPhone 15?" → `rag_query: "iPhone 15 preço"`

### Use `register_intent` if:

- User explicitly says they want to buy: "quero comprar", "vou levar", "fecha negócio"
- You ALREADY used `rag` in a previous step and have the `product_id`
- User confirmed purchase decision after you presented product info

→ Set `intent_payload` with:
```json
{
  "product_id": "from rag result or slugified name",
  "product_description": "official product name from rag"
}
```

⚠️ **NEVER** use this tool without first using `rag` to find product details!

**Examples:**
- User: "Ok, vou levar o MacBook Pro" 
  → FIRST: `rag` with "MacBook Pro"
  → THEN: `register_intent` with product_id from rag result

### Use `generate_response` if:

- Simple greeting: "oi", "olá", "bom dia"
- Thank you / goodbye: "obrigado", "tchau"
- General chat not requiring tools: "como você está?"
- You just registered an intent (to confirm to user)
- `rag` found no results (to inform user)

→ No payload required

## Multi-Step Logic for Purchases

Correct flow:
1. User: "Quero comprar iPhone 15"
2. You: Use `rag` with "iPhone 15"
3. RAG returns: { product_id: "iphone-15-pro", ... }
4. You: Use `register_intent` with that product_id
5. You: Use `generate_response` to confirm

❌ Wrong: Registering intent without RAG first!
```

### Exemplo: Customização para Registro de Leads

Se o cliente não vende produtos mas quer capturar leads:

```markdown
### Use `register_intent` if:

- User wants to schedule a consultation: "quero agendar", "marcar consulta"
- User wants to receive a quote: "quero orçamento", "quanto custa"
- User wants to be contacted: "podem me ligar", "entrem em contato"

→ Set `intent_payload` with:
```json
{
  "product_id": "service-consultation" or "service-quote",
  "product_description": "describe the service they're interested in"
}
```
```

## 🚨 Prompt: error_handler.md

Define como o agente se recupera de erros.

### Localização

```
clients/{cliente}/warmly-ai/prompts/error_handler.md
```

### Exemplo de Customização

```markdown
# Error Handling Instructions for TechStore

When an error occurs during tool execution:

1. **Stay Calm and Professional**
   - Don't expose technical details to the user
   - Apologize for the inconvenience

2. **Provide Helpful Response**
   - Explain what you were trying to do (in simple terms)
   - Suggest alternative actions

3. **Specific Error Cases**

   **If RAG fails:**
   - "Desculpe, estou com dificuldade para acessar nosso catálogo no momento. 
      Que tal tentar novamente em alguns segundos? Ou posso transferir você 
      para um atendente humano."

   **If register_intent fails:**
   - "Registrei seu interesse, mas houve um probleminha técnico. Não se preocupe, 
      nossa equipe já foi notificada e entrará em contato com você em breve. 
      Pode me passar seu nome e telefone para garantir?"

   **If general error:**
   - "Ops, algo não saiu como esperado. Vou anotar sua solicitação e nossa 
      equipe retornará seu contato. Pode me passar seu email ou telefone?"

4. **Never Say:**
   - ❌ "System error"
   - ❌ "Exception occurred"
   - ❌ "Database connection failed"
   - ❌ "500 Internal Server Error"

5. **Always Log:**
   - Error is automatically logged, don't worry about it
```

## 📊 Prompt: summarize.md

Controla como o histórico de conversas é resumido quando fica muito longo.

### Localização

```
clients/{cliente}/warmly-ai/prompts/summarize.md
```

### Exemplo

```markdown
# Conversation Summarization Instructions for TechStore

## Task

Summarize the conversation history concisely while preserving key information.

## What to Preserve

1. **Product Interest**: Any products the user asked about
2. **Purchase Decisions**: Products user decided to buy
3. **Customer Needs**: Technical requirements or use cases mentioned
4. **Important Context**: Budget constraints, urgency, preferences

## What to Discard

- Repeated greetings
- Redundant clarifications
- Off-topic small talk (unless it reveals customer needs)

## Format

```
Summary:
- User interested in: [products/services]
- User decided to purchase: [if any]
- User needs: [requirements mentioned]
- Next step: [if pending]
```

## Example

Original (10 messages):
- User: Oi
- AI: Olá! Como posso ajudar?
- User: Quero um notebook
- AI: Para que uso?
- User: Edição de vídeo
- AI: Recomendo modelos com GPU dedicada...
- User: Qual o melhor?
- AI: MacBook Pro M3...
- User: Ok vou levar
- AI: Registrado!

Summarized:
```
Summary:
- User needs laptop for video editing
- Recommended MacBook Pro M3 (high-performance GPU)
- User decided to purchase MacBook Pro M3
- Intent already registered in system
```
```

## 🔄 Aplicar Alterações

Após editar os prompts, você precisa reiniciar o container para que as mudanças tenham efeito.

### Método 1: Restart (Rápido, sem downtime significativo)

```bash
cd /home/rfluid/development/Warmly/infra/clients/{cliente}/warmly-ai

# Reiniciar apenas o serviço warmly-ai
docker compose restart warmly-ai

# Verificar logs
docker compose logs -f warmly-ai
```

### Método 2: Recreate (se houver problemas)

```bash
cd /home/rfluid/development/Warmly/infra/clients/{cliente}/warmly-ai

# Parar e recriar o container
docker compose up -d --force-recreate warmly-ai

# Verificar logs
docker compose logs -f warmly-ai
```

### Método 3: Down/Up (downtime maior, mas limpa estado)

```bash
cd /home/rfluid/development/Warmly/infra/clients/{cliente}/warmly-ai

# Parar completamente
docker compose down

# Iniciar novamente
docker compose up -d

# Verificar
docker compose ps
docker compose logs -f
```

### Verificar se Mudanças Foram Aplicadas

```bash
# Entrar no container e verificar conteúdo do prompt
docker exec warmly-ai-{cliente} cat /app/prompts/system.md | head -20

# Ou testar diretamente via API
curl -X POST "http://api.{cliente}.lvh.me/api/messages/send" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "teste para verificar novo comportamento",
    "thread_id": "test-prompt-change",
    "customer_id": "test"
  }'
```

## ✅ Boas Práticas

### 1. Versionamento

Sempre versione os prompts no Git:

```bash
git add clients/{cliente}/warmly-ai/prompts/
git commit -m "feat({cliente}): update system prompt to be more formal"
git push
```

### 2. Backup Antes de Editar

```bash
cp clients/{cliente}/warmly-ai/prompts/system.md \
   clients/{cliente}/warmly-ai/prompts/system.md.backup-$(date +%Y%m%d)
```

### 3. Teste em Ambiente Separado Primeiro

Se possível, teste mudanças em um ambiente de dev/staging:

```bash
# Copiar stack para teste
cp -r clients/acme-corp clients/acme-corp-staging

# Modificar docker-compose para usar portas diferentes
# Testar as mudanças
# Depois aplicar em produção
```

### 4. Documente Customizações Importantes

Crie um `CHANGELOG.md` para cada cliente:

```markdown
# Changelog - ACME Corp Warmly-AI

## 2025-10-03
- Modified system.md to use more formal tone
- Added specific product knowledge about industrial equipment
- Updated evaluate_tools.md to prioritize quote requests

## 2025-09-15
- Initial deployment
- Based on warmly-ai v1.0.0
```

### 5. Use Comentários nos Prompts

Markdown suporta comentários HTML:

```markdown
<!-- CUSTOMIZAÇÃO ACME: Adicionado em 2025-10-03 
     Motivo: Cliente pediu tom mais técnico -->

## Technical Specifications

[...]
```

### 6. Validação de Sintaxe

Os prompts são Markdown, então valide a sintaxe:

```bash
# Instalar markdownlint (opcional)
npm install -g markdownlint-cli

# Validar
markdownlint clients/*/warmly-ai/prompts/*.md
```

## 🎨 Exemplos de Customização

### Exemplo 1: Mudando Tom de Formal para Casual

**Antes (system.md):**
```markdown
- **Tone:** Professional and formal
- Responses should be polite and respectful
- Use proper grammar and full sentences
```

**Depois (system.md):**
```markdown
- **Tone:** Friendly and casual
- Responses can use emojis 😊 and informal language
- Keep it light and conversational, like chatting with a friend
```

### Exemplo 2: Adicionando Conhecimento Específico de Domínio

**No system.md, adicionar:**

```markdown
## Domain-Specific Knowledge: Medical Devices

You have expert knowledge in:
- ISO 13485 certification requirements
- FDA approval processes for Class II devices
- GMP (Good Manufacturing Practice) standards
- Medical device lifecycle management

When discussing products, always mention:
1. Certification status
2. Regulatory approvals
3. Compliance standards met
```

### Exemplo 3: Customizando Fluxo de Vendas

**No evaluate_tools.md:**

```markdown
## Custom Sales Flow: Qualification First

Before registering intent, ALWAYS:
1. Ask about budget: "Qual sua faixa de investimento?"
2. Ask about timeline: "Para quando você precisa?"
3. Ask about decision-maker: "Você é o responsável pela compra?"

Only register intent if:
- Budget is confirmed
- Timeline is within 30 days
- User is decision-maker or has approval

Otherwise, use `generate_response` to nurture the lead.
```

### Exemplo 4: Multilíngue

**No system.md:**

```markdown
## Language Support

- Detect user's language from first message
- Respond in the same language
- Supported: Portuguese (pt-BR), English (en), Spanish (es)

Examples:
- User: "Hola" → Respond in Spanish
- User: "Hi" → Respond in English
- User: "Oi" → Respond in Portuguese (default)
```

## 🐛 Troubleshooting

### Problema: Mudanças não têm efeito após restart

**Causa**: Prompts podem estar em cache

```bash
# Solução 1: Forçar recreate
docker compose up -d --force-recreate warmly-ai

# Solução 2: Verificar se volume está montado corretamente
docker inspect warmly-ai-{cliente} | grep -A 10 Mounts

# Solução 3: Limpar cache do Python (se aplicável)
docker exec warmly-ai-{cliente} find /app -name "*.pyc" -delete
docker exec warmly-ai-{cliente} find /app -name "__pycache__" -type d -exec rm -rf {} +
docker compose restart warmly-ai
```

### Problema: Syntax error nos prompts

**Causa**: Markdown malformado ou caracteres especiais

```bash
# Verificar sintaxe
markdownlint clients/{cliente}/warmly-ai/prompts/system.md

# Validar no container
docker exec warmly-ai-{cliente} python3 -c "
import sys
sys.path.append('/app')
from src.system_prompt.main import SystemPromptBuilder
builder = SystemPromptBuilder()
print('Prompt loaded successfully!')
print(builder.prompt[:200])
"
```

### Problema: Agente não segue instruções do prompt

**Possíveis causas**:

1. **LLM não é poderoso o suficiente**: Use modelo mais avançado
2. **Prompt muito longo**: LLMs têm limite de contexto
3. **Instruções conflitantes**: Revise consistência
4. **Temperature muito alta**: Reduza em `.env`

```bash
# Verificar configuração do LLM
docker exec warmly-ai-{cliente} env | grep LLM

# Ajustar temperature (0 = mais determinístico)
# No .env:
LLM_TEMPERATURE=0
TOOL_EVALUATOR_LLM_TEMPERATURE=0
```

### Problema: Prompts não carregando (FileNotFoundError)

```bash
# Verificar estrutura de diretórios
docker exec warmly-ai-{cliente} ls -la /app/prompts/

# Verificar variável PROMPTS_DIR
docker exec warmly-ai-{cliente} echo $PROMPTS_DIR

# Verificar montagem de volume
docker compose config | grep -A 5 volumes
```

## 📚 Recursos Adicionais

- [Warmly-AI README](../warmly-ai/README.md)
- [Guia de Criação de Stack](./01-create-warmly-stack.md)
- [IDs WAHA ↔ BigQuery](./03-client-ids-waha-bigquery.md)
- [LangChain Prompt Engineering](https://python.langchain.com/docs/modules/model_io/prompts/)

## 🆘 Suporte

Se precisar de ajuda:
1. Consulte exemplos em `warmly-ai/prompts/*.example.md`
2. Verifique logs: `docker compose logs -f warmly-ai`
3. Teste mudanças incrementalmente
4. Abra uma issue se encontrar bugs

