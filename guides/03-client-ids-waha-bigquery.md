# Guia: IDs de Cliente - WAHA ↔ BigQuery

Este guia documenta a correspondência entre os IDs de cliente gerados pela stack Warmly-AI no BigQuery e os IDs dos clientes recebidos pelo WAHA (WhatsApp API).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Fluxo de Dados](#fluxo-de-dados)
- [Formato dos IDs](#formato-dos-ids)
- [Como os IDs são Propagados](#como-os-ids-são-propagados)
- [Rastreamento no BigQuery](#rastreamento-no-bigquery)
- [Exemplos Práticos](#exemplos-práticos)
- [Consultas SQL Úteis](#consultas-sql-úteis)
- [Troubleshooting](#troubleshooting)
- [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

O sistema mantém **correspondência 1:1** entre:
- **customer_id** no BigQuery (coluna na tabela de intenções)
- **ID do cliente** recebido pelo WAHA (geralmente o número de telefone WhatsApp)

```
┌──────────────────────────────────────────────────────────────┐
│                     Fluxo de Identificação                    │
└──────────────────────────────────────────────────────────────┘

    WhatsApp Message                WAHA Webhook              Warmly-AI API
         │                               │                          │
         │  From: +5511999999999        │                          │
         ├──────────────────────────────>│                          │
         │                               │ POST /api/waha/webhook   │
         │                               │ { "from": "5511999999999" }
         │                               ├─────────────────────────>│
         │                               │                          │
         │                               │                    customer_id = "5511999999999"
         │                               │                          │
         │                               │                    Register Intent
         │                               │                          │
         │                               │                          ▼
         │                               │                    BigQuery Insert
         │                               │                    {
         │                               │                      "customer_id": "5511999999999",
         │                               │                      "product_id": "...",
         │                               │                      ...
         │                               │                    }
```

**Regra Fundamental**: O `customer_id` no BigQuery é **exatamente o mesmo** ID que o WAHA envia no webhook.

## 📊 Fluxo de Dados

### 1. Mensagem Chega via WhatsApp

Um cliente envia uma mensagem pelo WhatsApp:

```
Número: +55 11 99999-9999
Mensagem: "Quero comprar o produto X"
```

### 2. WAHA Processa e Envia Webhook

O WAHA recebe a mensagem e envia um webhook para o Warmly-AI:

```http
POST http://warmly-ai-acme:8000/api/waha/webhook
Content-Type: application/json

{
  "event": "message",
  "session": "default",
  "payload": {
    "id": "msg_abc123",
    "timestamp": 1696348800,
    "from": "5511999999999",
    "fromMe": false,
    "body": "Quero comprar o produto X",
    "hasMedia": false,
    ...
  }
}
```

**Campo-chave**: `payload.from` = `"5511999999999"`

### 3. Warmly-AI Extrai customer_id

O código do Warmly-AI extrai o ID do cliente do webhook:

```python
# Pseudo-código (baseado na implementação real)
customer_id = webhook_payload["payload"]["from"]
# customer_id = "5511999999999"
```

### 4. Processamento e Registro de Intenção

Quando o agente detecta intenção de compra, registra no BigQuery:

```python
# src/register_intent/main.py
async def register(
    self, 
    customer_id: str,  # "5511999999999"
    product_id: str, 
    product_description: str | None
) -> dict:
    row_to_insert = {
        "event_id": str(uuid.uuid4()),
        "customer_id": customer_id,  # ← Mesmo ID do WAHA
        "product_id": product_id,
        "product_description": product_description,
        "intention_date": now_utc.strftime("%Y-%m-%d %H:%M:%S.%f"),
        "event_timestamp": now_utc.isoformat(),
    }
    
    self.client.insert_rows_json(env.BIGQUERY_TABLE_ID, [row_to_insert])
```

### 5. Dados no BigQuery

A tabela no BigQuery terá o registro:

| event_id | customer_id | product_id | product_description | intention_date | event_timestamp |
|----------|-------------|------------|---------------------|----------------|-----------------|
| uuid-... | 5511999999999 | iphone-15 | iPhone 15 Pro 256GB | 2025-10-03 14:30:00 | 2025-10-03T14:30:00Z |

## 🔢 Formato dos IDs

### IDs do WAHA

O WAHA envia IDs no formato:

- **Apenas números** (sem `+` ou espaços)
- **Código do país + DDD + número**

Exemplos:
- Brasil: `5511999999999` (55 = país, 11 = DDD, 999999999 = número)
- EUA: `15551234567` (1 = país, 555 = área, 1234567 = número)
- Portugal: `351912345678` (351 = país, 912345678 = número)

### customer_id no BigQuery

O `customer_id` no BigQuery é armazenado como **STRING** com o mesmo formato:

```sql
CREATE TABLE `project.dataset.purchase_intents` (
  event_id STRING NOT NULL,
  customer_id STRING NOT NULL,  -- Formato: "5511999999999"
  product_id STRING NOT NULL,
  product_description STRING,
  intention_date TIMESTAMP NOT NULL,
  event_timestamp TIMESTAMP NOT NULL
);
```

**Importante**: 
- ✅ Use STRING, não INT64 (números longos podem ter overflow)
- ✅ Mantenha formato consistente (sem `+`, `-`, espaços)
- ✅ Preserve zeros à esquerda (se houver)

## 🔄 Como os IDs são Propagados

### Caminho Completo

```
WhatsApp User
    ↓ (sends message from +55 11 99999-9999)
WAHA Server
    ↓ (webhook with from: "5511999999999")
Warmly-AI REST API
    ↓ (extracts customer_id)
Agent Workflow
    ↓ (processes conversation)
Register Intent Tool
    ↓ (customer_id parameter)
BigQuery Insert
    ↓ (customer_id column)
BigQuery Table
```

### Código Relevante

#### 1. Recepção do Webhook (REST API)

```python
# src/rest/messages.py ou similar
@app.post("/api/waha/webhook")
async def waha_webhook(request: Request):
    webhook_data = await request.json()
    
    # Extrair customer_id do payload do WAHA
    customer_id = webhook_data["payload"]["from"]
    message_body = webhook_data["payload"]["body"]
    
    # Passar para o agente
    response = await process_message(
        message=message_body,
        customer_id=customer_id,  # ← ID propagado
        ...
    )
    
    return {"status": "ok"}
```

#### 2. Processamento pelo Agente

```python
# src/agent/workflow.py ou start.py
async def start(
    input: list[BaseMessage],
    config: RunnableConfig,
    customer_id: str,  # ← ID recebido
    ...
):
    # O customer_id é armazenado no config ou state
    # e fica disponível durante toda a conversa
    ...
```

#### 3. Registro no BigQuery

```python
# src/register_intent/main.py
class IntentRegistrar:
    async def register(
        self, 
        customer_id: str,  # ← Mesmo ID original
        product_id: str, 
        product_description: str | None
    ) -> dict:
        row_to_insert = {
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,  # ← Gravado exatamente como recebido
            ...
        }
        
        errors = self.client.insert_rows_json(
            env.BIGQUERY_TABLE_ID, 
            [row_to_insert]
        )
```

## 🔍 Rastreamento no BigQuery

### Schema da Tabela de Intenções

```sql
-- Tabela típica de purchase_intents
CREATE TABLE `warmly-production.clients_data.purchase_intents` (
  event_id STRING NOT NULL,           -- UUID único do evento
  customer_id STRING NOT NULL,        -- ID do WAHA (ex: "5511999999999")
  product_id STRING NOT NULL,         -- ID do produto
  product_description STRING,         -- Descrição do produto
  intention_date TIMESTAMP NOT NULL,  -- Data/hora da intenção
  event_timestamp TIMESTAMP NOT NULL, -- Timestamp do evento
  
  -- Campos opcionais/adicionais:
  session_id STRING,                  -- ID da sessão de conversa
  source STRING,                      -- "whatsapp", "web", etc.
  metadata JSON                       -- Dados adicionais
)
PARTITION BY DATE(intention_date)
CLUSTER BY customer_id;
```

### Relacionamento com Outros Dados

Se você tem uma tabela de clientes, pode fazer JOIN:

```sql
-- Tabela de clientes (hipotética)
CREATE TABLE `warmly-production.clients_data.customers` (
  customer_id STRING NOT NULL,        -- Mesmo formato: "5511999999999"
  name STRING,
  email STRING,
  phone STRING,                       -- Formato legível: "+55 11 99999-9999"
  created_at TIMESTAMP
);

-- JOIN entre intenções e dados do cliente
SELECT 
  i.event_id,
  i.customer_id,
  c.name,
  c.email,
  i.product_id,
  i.product_description,
  i.intention_date
FROM `warmly-production.clients_data.purchase_intents` i
LEFT JOIN `warmly-production.clients_data.customers` c
  ON i.customer_id = c.customer_id
WHERE i.intention_date >= CURRENT_DATE()
ORDER BY i.intention_date DESC;
```

## 💡 Exemplos Práticos

### Exemplo 1: Fluxo Completo

**Cenário**: Cliente "João" com WhatsApp +55 11 98765-4321 quer comprar iPhone.

#### Passo 1: João envia mensagem

```
WhatsApp: +55 11 98765-4321
Mensagem: "Quero comprar o iPhone 15"
```

#### Passo 2: WAHA envia webhook

```json
{
  "event": "message",
  "payload": {
    "from": "5511987654321",
    "body": "Quero comprar o iPhone 15"
  }
}
```

#### Passo 3: Warmly-AI processa

```
customer_id = "5511987654321"
→ Usa RAG para buscar "iPhone 15"
→ Encontra product_id = "iphone-15-pro-256gb"
→ Registra intenção no BigQuery
```

#### Passo 4: Registro no BigQuery

```sql
INSERT INTO purchase_intents VALUES (
  'event-uuid-123',              -- event_id
  '5511987654321',               -- customer_id (← do WAHA)
  'iphone-15-pro-256gb',         -- product_id
  'iPhone 15 Pro 256GB Preto',   -- product_description
  '2025-10-03 15:45:30',         -- intention_date
  '2025-10-03T15:45:30.123Z'     -- event_timestamp
);
```

#### Passo 5: Consulta para análise

```sql
SELECT *
FROM `warmly-production.clients_data.purchase_intents`
WHERE customer_id = '5511987654321'
ORDER BY intention_date DESC;
```

**Resultado**: Você vê todas as intenções de compra do João usando o mesmo ID do WhatsApp.

### Exemplo 2: Múltiplos Clientes, Múltiplos Produtos

```sql
-- Ver resumo de intenções por cliente
SELECT 
  customer_id,
  COUNT(*) as total_intents,
  COUNT(DISTINCT product_id) as unique_products,
  MIN(intention_date) as first_intent,
  MAX(intention_date) as last_intent
FROM `warmly-production.clients_data.purchase_intents`
WHERE intention_date >= '2025-10-01'
GROUP BY customer_id
ORDER BY total_intents DESC
LIMIT 20;
```

**Resultado**:
| customer_id | total_intents | unique_products | first_intent | last_intent |
|-------------|---------------|-----------------|--------------|-------------|
| 5511987654321 | 5 | 3 | 2025-10-01 | 2025-10-03 |
| 5521987654322 | 3 | 2 | 2025-10-02 | 2025-10-03 |
| ... | ... | ... | ... | ... |

### Exemplo 3: Rastreamento de Campanha

Se você tiver múltiplas stacks ou campanhas:

```sql
-- Adicionar coluna 'source' para identificar origem
ALTER TABLE purchase_intents ADD COLUMN source STRING;

-- Modificar código para incluir source
row_to_insert = {
    "event_id": str(uuid.uuid4()),
    "customer_id": customer_id,
    "product_id": product_id,
    "product_description": product_description,
    "intention_date": now_utc.strftime("%Y-%m-%d %H:%M:%S.%f"),
    "event_timestamp": now_utc.isoformat(),
    "source": "whatsapp-campaign-october"  # ← Identificador
}

-- Consultar por campanha
SELECT 
  source,
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(*) as total_intents
FROM `warmly-production.clients_data.purchase_intents`
GROUP BY source;
```

## 📝 Consultas SQL Úteis

### 1. Buscar intenções de um cliente específico

```sql
SELECT 
  event_id,
  product_id,
  product_description,
  intention_date
FROM `warmly-production.clients_data.purchase_intents`
WHERE customer_id = '5511999999999'
ORDER BY intention_date DESC;
```

### 2. Clientes mais ativos (top 10)

```sql
SELECT 
  customer_id,
  COUNT(*) as total_intents,
  ARRAY_AGG(DISTINCT product_id ORDER BY product_id) as products,
  MIN(intention_date) as first_seen,
  MAX(intention_date) as last_seen
FROM `warmly-production.clients_data.purchase_intents`
GROUP BY customer_id
ORDER BY total_intents DESC
LIMIT 10;
```

### 3. Produtos mais desejados

```sql
SELECT 
  product_id,
  product_description,
  COUNT(*) as intent_count,
  COUNT(DISTINCT customer_id) as unique_customers
FROM `warmly-production.clients_data.purchase_intents`
WHERE intention_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY product_id, product_description
ORDER BY intent_count DESC
LIMIT 20;
```

### 4. Conversão: clientes com múltiplas intenções

```sql
-- Clientes que demonstraram interesse em múltiplos produtos
SELECT 
  customer_id,
  COUNT(DISTINCT product_id) as different_products,
  STRING_AGG(DISTINCT product_description, ', ') as products_list
FROM `warmly-production.clients_data.purchase_intents`
GROUP BY customer_id
HAVING COUNT(DISTINCT product_id) > 1
ORDER BY different_products DESC;
```

### 5. Análise temporal: intenções por dia

```sql
SELECT 
  DATE(intention_date) as date,
  COUNT(*) as total_intents,
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(DISTINCT product_id) as unique_products
FROM `warmly-production.clients_data.purchase_intents`
WHERE intention_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY date
ORDER BY date DESC;
```

### 6. Validar correspondência WAHA → BigQuery

```sql
-- Verificar se todos os customer_ids têm formato válido (apenas números)
SELECT 
  customer_id,
  LENGTH(customer_id) as id_length,
  REGEXP_CONTAINS(customer_id, r'^[0-9]+$') as is_valid_format
FROM `warmly-production.clients_data.purchase_intents`
WHERE NOT REGEXP_CONTAINS(customer_id, r'^[0-9]+$')  -- IDs inválidos
LIMIT 100;
```

## 🐛 Troubleshooting

### Problema: IDs não correspondem

**Sintoma**: Você vê IDs diferentes no BigQuery do que no WAHA.

**Possíveis causas**:

1. **Transformação acidental do ID**

```python
# ❌ ERRADO - não faça isso:
customer_id = f"+{webhook_data['payload']['from']}"  # Adiciona '+'
customer_id = webhook_data['payload']['from'].replace('55', '')  # Remove código país

# ✅ CORRETO - use exatamente como recebido:
customer_id = webhook_data['payload']['from']  # "5511999999999"
```

2. **Campo errado sendo usado**

```python
# Verifique qual campo você está usando
# WAHA pode ter: 'from', 'chatId', 'author', etc.
# Use sempre o campo correto e consistente
```

**Solução**: Adicione logs para rastrear:

```python
logger.info(f"WAHA webhook received - from: {webhook_data['payload']['from']}")
logger.info(f"Registering intent - customer_id: {customer_id}")
```

### Problema: customer_id NULL no BigQuery

**Sintoma**: Registros com `customer_id` vazio ou NULL.

**Causa**: O webhook do WAHA não está enviando o campo `from` ou está vazio.

**Solução**:

```python
# Adicionar validação
customer_id = webhook_data.get("payload", {}).get("from")
if not customer_id:
    logger.error(f"Missing customer_id in webhook: {webhook_data}")
    raise ValueError("customer_id is required")

# Continuar com o processamento
```

### Problema: IDs duplicados com formatos diferentes

**Sintoma**: Mesmo cliente aparece com IDs diferentes:
- `5511999999999`
- `+5511999999999`
- `55 11 99999-9999`

**Causa**: Inconsistência na normalização.

**Solução**: Padronizar no ponto de entrada:

```python
def normalize_phone_id(raw_id: str) -> str:
    """
    Normaliza ID de telefone para formato consistente.
    Remove: +, espaços, hífens, parênteses
    """
    return ''.join(char for char in raw_id if char.isdigit())

# Uso:
customer_id = normalize_phone_id(webhook_data['payload']['from'])
# Entrada: "+55 11 99999-9999" → Saída: "5511999999999"
```

### Problema: Não consegue correlacionar com outras tabelas

**Sintoma**: JOIN entre `purchase_intents` e `customers` não retorna resultados.

**Causa**: Formatos de `customer_id` diferentes nas tabelas.

**Solução**:

```sql
-- Verificar formatos
SELECT DISTINCT customer_id, LENGTH(customer_id)
FROM `project.dataset.purchase_intents`
LIMIT 10;

SELECT DISTINCT customer_id, LENGTH(customer_id)
FROM `project.dataset.customers`
LIMIT 10;

-- Se precisar normalizar no JOIN:
SELECT *
FROM `project.dataset.purchase_intents` i
JOIN `project.dataset.customers` c
  ON REGEXP_REPLACE(i.customer_id, r'[^0-9]', '') = 
     REGEXP_REPLACE(c.customer_id, r'[^0-9]', '');
```

## ✅ Boas Práticas

### 1. Sempre Use STRING para customer_id

```sql
-- ✅ CORRETO
customer_id STRING NOT NULL

-- ❌ ERRADO (overflow em números grandes)
customer_id INT64 NOT NULL
```

### 2. Preserve o Formato Original

```python
# ✅ CORRETO - use como recebido
customer_id = webhook_data['payload']['from']

# ❌ ERRADO - não modifique
customer_id = format_phone_number(webhook_data['payload']['from'])
```

### 3. Adicione Índices/Clustering

```sql
-- Para queries mais rápidas
CREATE TABLE purchase_intents (
  ...
)
PARTITION BY DATE(intention_date)
CLUSTER BY customer_id;  -- ← Melhora performance de queries por cliente
```

### 4. Log para Auditoria

```python
logger.info(
    f"Intent registered - "
    f"customer_id={customer_id}, "
    f"product_id={product_id}, "
    f"event_id={event_id}"
)
```

### 5. Validação de Dados

```python
def validate_customer_id(customer_id: str) -> bool:
    """Valida formato do customer_id"""
    if not customer_id:
        return False
    if not customer_id.isdigit():
        return False
    if len(customer_id) < 10 or len(customer_id) > 15:
        return False
    return True

# Uso:
if not validate_customer_id(customer_id):
    raise ValueError(f"Invalid customer_id: {customer_id}")
```

### 6. Documentação no Schema

```sql
-- Adicione comentários descritivos
CREATE TABLE purchase_intents (
  event_id STRING NOT NULL 
    OPTIONS(description="UUID único do evento"),
  customer_id STRING NOT NULL 
    OPTIONS(description="ID do cliente do WAHA (formato: apenas dígitos, ex: 5511999999999)"),
  ...
);
```

## 📚 Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Formato** | Apenas dígitos, sem `+`, espaços ou hífens |
| **Origem** | Campo `from` do webhook do WAHA |
| **Destino** | Coluna `customer_id` no BigQuery |
| **Tipo** | STRING (não INT) |
| **Correspondência** | 1:1 exato, sem transformações |
| **Uso** | Rastreamento de intenções por cliente |

**Regra de Ouro**: O `customer_id` no BigQuery é **exatamente** o que o WAHA envia, sem modificações.

## 🔗 Referências

- [Guia de Criação de Stack](./01-create-warmly-stack.md)
- [Guia de Edição de Prompts](./02-edit-prompts.md)
- [WAHA Documentation](https://waha.devlike.pro/)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)

## 🆘 Suporte

Em caso de dúvidas sobre IDs:
1. Verifique logs do webhook: `docker compose logs -f warmly-ai`
2. Consulte tabela BigQuery para validar formato
3. Compare com dados do WAHA
4. Abra uma issue se encontrar inconsistências

