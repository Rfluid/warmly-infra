# 🚀 Guia Rápido: Deploy de AI Warmly

## Pré-requisitos

Antes de começar, certifique-se de que:

1. ✅ **Stack Manager está rodando**
   ```bash
   cd stack-manager
   go run cmd/api/main.go
   ```
   - Deve estar em: `http://localhost:8080`

2. ✅ **Infraestrutura compartilhada está ativa**
   ```bash
   cd clients/shared
   docker compose -f database/docker-compose.yml up -d
   docker compose -f vector/docker-compose.yml up -d
   ```

3. ✅ **Rede Docker `edge` criada**
   ```bash
   docker network create edge
   ```

4. ✅ **Reverse proxy (Traefik) rodando**
   ```bash
   cd reverse-proxy
   docker compose up -d
   ```

5. ✅ **Frontend rodando**
   ```bash
   cd warmly-frontend
   npm install
   npm start
   ```
   - Acesse: `http://localhost:4200`

---

## Passo a Passo

### 1️⃣ Fazer Login

1. Acesse `http://localhost:4200/login`
2. Faça login com:
   - Email/senha, ou
   - Google Sign-In

### 2️⃣ Criar Persona (se ainda não tiver)

1. Navegue para **AI Manager**
2. Se não tiver persona, será redirecionado para o wizard
3. Complete os 7 passos:
   - Identidade
   - Tom & Estilo
   - Sobre a Empresa
   - Catálogo
   - Playbook
   - Automação
   - Review & Compile

### 3️⃣ Deploy da AI Warmly

1. No **AI Manager**, clique em **"🚀 Deploy AI"**

2. Preencha o formulário:
   ```
   Client ID: acme              (ou seu email antes do @)
   Stack Name: assistant        (nome da sua instância)
   WAHA Dashboard Password: ********
   WAHA API Key: ********
   ```

3. Clique em **"Deploy AI 🚀"**

4. Aguarde o deployment:
   - ⏳ Creating Stack...
   - ⏳ Deploying Services...
   - ⏳ Health Check...
   - ⏳ Configuring AI...
   - ✅ Ready!

   *Tempo estimado: 2-5 minutos*

### 4️⃣ Acessar Serviços

Após o deployment, você receberá 3 URLs:

#### 🔗 WAHA Dashboard
```
http://waha.assistant.acme.lvh.me
```
**Use para:** Conectar seu WhatsApp
1. Clique em "Open"
2. Faça login no dashboard WAHA
3. Escaneie o QR Code com WhatsApp

#### 🔗 AI Frontend (Streamlit)
```
http://assistant.acme.lvh.me
```
**Use para:** Testar conversas com a AI diretamente

#### 🔗 API Backend
```
http://backend.assistant.acme.lvh.me
```
**Use para:** Integração programática via REST API

### 5️⃣ Upload de Documentos (Opcional)

1. Na tela de sucesso, role até **"Upload Knowledge Base Documents"**
2. Clique em **"Choose Files"** ou arraste arquivos
3. Formatos suportados:
   - `.txt` - Textos
   - `.json` - JSON
   - `.csv` - Tabelas CSV
4. Clique em **"Upload X File(s)"**
5. ✅ Documentos serão adicionados à base de conhecimento da AI

### 6️⃣ Conectar WhatsApp

1. Abra o **WAHA Dashboard**: `http://waha.assistant.acme.lvh.me`
2. Faça login com a senha que você definiu
3. Crie uma sessão
4. Escaneie o QR Code com seu WhatsApp
5. ✅ Pronto! Seu WhatsApp está conectado

### 7️⃣ Iniciar Conversas

1. Clique em **"Start Conversations →"**
2. Você será redirecionado para a interface de chat
3. Comece a conversar pelo WhatsApp
4. As mensagens aparecerão em tempo real

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (opcional)

Você pode adicionar mais variáveis editando a stack:

```bash
curl -X PATCH http://localhost:8080/api/clients/acme/stacks/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "environment": {
      "OPENAI_API_KEY": "sk-...",
      "LLM_MODEL_NAME": "gpt-4",
      "BIGQUERY_TABLE_ID": "project.dataset.table"
    }
  }'
```

### Atualizar Prompts

```bash
curl -X PATCH http://localhost:8080/api/clients/acme/stacks/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "files": {
      "prompts/system.md": "# Novo prompt\n..."
    }
  }'
```

### Reiniciar Stack

```bash
curl -X POST http://localhost:8080/api/clients/acme/stacks/assistant/restart
```

---

## 🚨 Troubleshooting

### ❌ Erro: "Services failed to start within timeout"

**Solução:**
1. Verifique se PostgreSQL e Milvus estão rodando:
   ```bash
   docker ps | grep -E "postgres|milvus"
   ```
2. Verifique logs da stack:
   ```bash
   curl http://localhost:8080/api/clients/acme/stacks/assistant/logs?tail=100
   ```

### ❌ Erro: "Stack Manager API indisponível"

**Solução:**
1. Verifique se Stack Manager está rodando:
   ```bash
   curl http://localhost:8080/health
   ```
2. Inicie o Stack Manager se necessário

### ❌ Erro: "No persona found"

**Solução:**
1. Vá para **AI Manager** → **"Create Persona"**
2. Complete o wizard de criação

### ❌ WhatsApp não conecta

**Solução:**
1. Verifique se o WAHA está rodando:
   ```bash
   curl http://waha.assistant.acme.lvh.me/health
   ```
2. Limpe o cache do WhatsApp no celular
3. Tente novamente

### ❌ Upload de documentos falha

**Solução:**
1. Verifique se o backend está saudável:
   ```bash
   curl http://backend.assistant.acme.lvh.me/health
   ```
2. Verifique o tamanho dos arquivos (máx ~10MB por arquivo)
3. Use apenas formatos suportados: .txt, .json, .csv

---

## 📊 Monitoramento

### Ver Status da Stack

```bash
curl http://localhost:8080/api/clients/acme/stacks/assistant/status
```

### Ver Logs em Tempo Real

```bash
curl http://localhost:8080/api/clients/acme/stacks/assistant/logs?tail=50
```

### Listar Todas as Stacks do Cliente

```bash
curl http://localhost:8080/api/clients/acme/stacks
```

---

## 🎓 Exemplos de Uso

### Teste Rápido da AI

1. Abra o Streamlit: `http://assistant.acme.lvh.me`
2. Digite: "Olá, quero saber mais sobre seus produtos"
3. A AI responderá baseada na persona criada

### Teste via WhatsApp

1. Conecte seu WhatsApp no WAHA
2. Envie mensagem para o número conectado
3. A AI responderá automaticamente
4. Veja as conversas em tempo real no frontend

### API REST

```bash
# Enviar mensagem via API
curl -X POST http://backend.assistant.acme.lvh.me/agent/messages/user \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá!",
    "thread_id": "waha:5511999999999@c.us"
  }'
```

---

## 🔄 Próximos Passos

Após o deployment bem-sucedido:

1. ✅ Explore a interface de **Conversas**
2. ✅ Gerencie **Leads** que entram
3. ✅ Use o **Funil** para acompanhar vendas
4. ✅ Configure **Automações** para respostas automáticas
5. ✅ Envie **Broadcasts** para segmentos de clientes
6. ✅ Monitore o **Warmth Score** dos leads

---

## 📞 Suporte

Se encontrar problemas:

1. 📖 Leia a documentação completa: `WARMLY_AI_DEPLOYMENT.md`
2. 🔍 Verifique os logs da stack
3. 🐛 Abra uma issue no repositório
4. 💬 Entre em contato com o suporte

---

**Bom trabalho! Sua AI Warmly está pronta para atender clientes! 🎉**

---

*Última atualização: 03 de Outubro de 2025*

