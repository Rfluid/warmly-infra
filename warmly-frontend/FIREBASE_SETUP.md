# Firebase Setup - IMPORTANTE!

## ⚠️ ATENÇÃO

O Firebase Authentication está configurado com credenciais de exemplo. Você PRECISA configurar um projeto Firebase real.

## 🔧 Passos para Configurar Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Add project"
3. Nomeie o projeto (ex: "warmly-prod")
4. Siga o wizard de criação

### 2. Ativar Authentication

1. No projeto Firebase, vá em **Authentication**
2. Clique em "Get Started"
3. Ative os providers:
   - ✅ **Email/Password**: Enable
   - ✅ **Google**: Enable (você precisará configurar OAuth consent screen)

### 3. Adicionar Web App

1. Em **Project Settings** → **General**
2. Clique em "Add app" → ícone Web (`</>`)
3. Registre o app
4. Copie as configurações (firebaseConfig)

### 4. Atualizar Configurações

Edite os arquivos de environment com as configurações REAIS:

#### `src/environments/environment.ts` (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000',
  stackManagerApiUrl: 'http://localhost:8080',
  warmlyAiApiUrl: 'http://localhost:8000',
  firebase: {
    apiKey: "AIzaSy...",  // ← Cole aqui
    authDomain: "warmly-prod.firebaseapp.com",
    projectId: "warmly-prod",
    storageBucket: "warmly-prod.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  }
};
```

#### `src/environments/environment.prod.ts` (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.warmly.com',  // ← Ajustar
  wsUrl: 'wss://api.warmly.com',
  stackManagerApiUrl: 'https://stack-manager.warmly.com',
  warmlyAiApiUrl: 'https://api.warmly.com',
  firebase: {
    // Mesmas configurações ou projeto separado para prod
  }
};
```

### 5. Configurar Google OAuth (Opcional mas Recomendado)

Para habilitar "Sign in with Google":

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services** → **OAuth consent screen**
3. Configure:
   - User Type: External (para teste) ou Internal (para uso interno)
   - App name: "Warmly"
   - Support email: seu email
4. Adicione scopes:
   - `openid`
   - `email`
   - `profile`
5. Adicione test users (se External)

### 6. Testar

```bash
cd warmly-frontend
npm start
```

Acesse `http://localhost:4200/login` e teste:
- ✅ Criar conta com email
- ✅ Login com email
- ✅ Login com Google

## 🔒 Segurança

### Regras de Segurança Recomendadas

No Firebase Console → **Authentication** → **Settings**:

#### Email Enumeration Protection
- ✅ Enable (previne descoberta de emails cadastrados)

#### Password Policy
- Minimum length: 8 characters
- Require uppercase
- Require number
- Require special character

### Firestore Rules (se usar no futuro)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /stacks/{stackId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.data.owner == request.auth.uid;
    }
  }
}
```

## 🎯 Produção

Para deploy em produção:

1. **Authorized domains**: Adicione seu domínio
   - Firebase Console → Authentication → Settings → Authorized domains
   - Ex: `warmly.com`, `app.warmly.com`

2. **API Key Restrictions**: Configure no Google Cloud Console
   - HTTP referrers: apenas seus domínios
   - APIs permitidas: apenas as necessárias

3. **Environment Variables**: Use secrets management
   - Não commite credenciais reais
   - Use variáveis de ambiente
   - CI/CD com secrets (GitHub Actions, GitLab CI)

## 📝 Verificação

Checklist antes de ir para produção:

- [ ] Firebase project criado
- [ ] Authentication habilitado (Email + Google)
- [ ] Configurações reais em environment files
- [ ] Google OAuth configurado
- [ ] Test users criados
- [ ] Authorized domains configurados
- [ ] Security rules definidas
- [ ] API keys protegidas

## 🆘 Troubleshooting

### Erro: "Firebase: Error (auth/invalid-api-key)"
- ✅ Verifique se copiou a apiKey correta do Firebase Console
- ✅ Verifique se não há espaços extras

### Erro: "This domain is not authorized"
- ✅ Adicione `localhost` em Authorized domains (dev)
- ✅ Adicione seu domínio de produção

### Google Login não funciona
- ✅ Configure OAuth consent screen
- ✅ Adicione test users
- ✅ Verifique se Google provider está habilitado no Firebase

### Erro: "Firebase: Access to this account has been temporarily disabled"
- ✅ Aguarde alguns minutos (proteção anti-spam)
- ✅ Ou desabilite Email Enumeration Protection temporariamente


