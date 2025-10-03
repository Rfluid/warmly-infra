# ⚡ WARMLY - QUICK START

## 🚀 Iniciar Tudo Rapidamente

### 1. Backends

```bash
# Stack Manager (porta 8080)
cd /home/rfluid/development/Warmly/infra/stack-manager
go run cmd/api/main.go &

# Warmly-AI (porta 8000)
cd /home/rfluid/development/Warmly/infra/warmly-ai
docker-compose up -d

# Verificar
curl http://localhost:8080/health
curl http://localhost:8000/health
```

### 2. Frontend

```bash
cd /home/rfluid/development/Warmly/infra/warmly-frontend
npm start
```

Acesse: **http://localhost:4200**

---

## 🔑 Primeiro Acesso

1. Clique **"Sign up"**
2. Preencha: `teste@warmly.com` / `123456`
3. **Persona Wizard** aparece (7 passos)
4. Preencha minimamente:
   - Company: "Warmly"
   - Persona: "Maria"
   - Tones: Selecione alguns
   - Summary: "Empresa teste"
   - Continue até o fim
5. **WhatsApp Gate** aparece (aguarde 10s auto-conectar)
6. **Pronto!** Você está no app

---

## 📱 Navegação

- **Conversations** - Chat em tempo real
- **Leads** - Lista de leads
- **Funnel** - Kanban de vendas
- **Broadcast** - Mensagens em massa
- **AI Manager** - Ver/gerenciar stacks (advanced)
- **Settings** - Configurações

---

## ⚠️ Firebase

Configure antes de usar em produção:
```bash
# Edite:
src/environments/environment.ts

# Coloque suas credenciais Firebase reais
```

---

## 🐛 Problemas?

### Login não funciona
→ Configure Firebase real (ver FIREBASE_SETUP.md)

### Erro ao carregar stacks
→ Certifique que Stack Manager está rodando (porta 8080)

### Conversations vazia
→ Normal! Envie mensagens via WAHA para criar threads

---

**Pronto! Agora é só usar! 🎉**


