# Warmly Frontend - Implementation Guide

## 🎯 Project Structure Created

```
warmly-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/
│   │   │       └── warmly-api.service.ts
│   │   ├── features/
│   │   │   ├── ai-manager/
│   │   │   ├── conversations/
│   │   │   ├── leads/
│   │   │   ├── funnel/
│   │   │   ├── broadcast/
│   │   │   └── settings/
│   │   ├── layout/
│   │   │   └── floating-sidebar/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── button/
│   │   │       ├── input/
│   │   │       ├── card/
│   │   │       └── warmth-badge/
│   │   ├── app.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles.css
├── tailwind.config.js
└── package.json
```

## ✅ What's Implemented

### Core Services
- ✅ `WarmlyApiService` - Complete API integration with backend
  - Message sending (POST /api/messages/user)
  - Thread management (GET/DELETE /api/threads)
  - Document upload (POST /api/vectorstore/documents)
  - WebSocket support

### UI Components (All with Warmly Design System)
- ✅ Button Component (primary, secondary, ghost, danger variants)
- ✅ Input Component (with labels, errors, hints)
- ✅ Card Component (default, elevated, glass variants)
- ✅ Warmth Badge Component (cool/warm/hot states)

### Layout
- ✅ Floating Sidebar (collapsible, glass effect)
  - All menu items with icons
  - Active state highlighting with gradient
  - Status indicators (WhatsApp, Persona)
  - Smooth animations

### Features Completed
- ✅ AI Manager View
  - Persona configuration
  - Tone selection (chips)
  - Knowledge base upload (drag & drop)
  - Tools & policies toggles

## 🚧 To Complete

### Remaining Views (Create these files):

#### 1. Conversations View
```typescript
// src/app/features/conversations/conversations.component.ts
```
Features needed:
- Two-pane layout (list + chat)
- Contact list with warmth badges
- Chat bubbles (lead vs AI)
- Template dropdowns
- Real-time updates

#### 2. Leads View
```typescript
// src/app/features/leads/leads.component.ts
```
Features needed:
- Data table with sorting/filtering
- Dynamic tag fields
- Bulk actions
- Side drawer for lead details
- Warmth range filters

#### 3. Funnel View
```typescript
// src/app/features/funnel/funnel.component.ts
```
Features needed:
- Kanban board
- Drag & drop functionality
- Lead cards with warmth
- Insights rail

#### 4. Broadcast View
```typescript
// src/app/features/broadcast/broadcast.component.ts
```
Features needed:
- Message editor with variables
- Audience builder
- Automation rules
- Campaign history

#### 5. Settings View
```typescript
// src/app/features/settings/settings.component.ts
```
Simple placeholder component

## 🎨 Design System Reference

### Colors
- Primary: `#FF7A59`
- Secondary: `#FF4E3A`
- Warmth Cool: `#60A5FA`
- Warmth Warm: `#F59E0B`
- Warmth Hot: `#EF4444`

### Tailwind Classes
```css
.glass                  // Glass morphism effect
.gradient-warmly        // Orange to red gradient
.shadow-warmly-card     // Card shadow
.shadow-warmly-fab      // FAB shadow
.rounded-warmly-xl      // 24px radius
```

## 🔧 Build & Run

```bash
# Install dependencies
cd warmly-frontend
npm install

# Add required packages
npm install @angular/animations @angular/cdk

# Run development server
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build --configuration=production
```

## 🔌 Backend Integration

### API Endpoints Used
- POST `/api/messages/user` - Send message
- POST `/api/messages/system` - System instructions
- GET `/api/threads/{id}/state` - Get thread state
- GET `/api/threads/{id}/history` - Get history
- POST `/api/vectorstore/documents` - Upload docs
- WS `/api/messages/user/websocket` - Real-time chat

### Environment Configuration
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',  // Change to your backend URL
  wsUrl: 'ws://localhost:8000'
};
```

## 📝 Next Steps

1. **Complete Remaining Views**
   - Copy pattern from AIManagerComponent
   - Use existing components (Button, Input, Card, etc.)
   - Follow Warmly design system

2. **Add Guards**
   - Create `persona.guard.ts` for persona existence check
   - Create `whatsapp.guard.ts` for connection check

3. **Add More UI Components**
   - Table component for Leads view
   - Kanban components for Funnel
   - Chat bubble component for Conversations

4. **Integrate Real-time**
   - WebSocket service for live updates
   - Signal-based state management

5. **Testing**
   - Unit tests for services
   - Component tests
   - E2E tests

## 🎯 Quick Template for New Views

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-your-view',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="p-8 space-y-6">
      <h1 class="text-3xl font-bold text-warmly-text-primary">Your View</h1>
      
      <app-card variant="elevated" title="Section Title">
        <!-- Your content here -->
      </app-card>
    </div>
  `,
  styles: []
})
export class YourViewComponent {
  // Component logic here
}
```

## 🐛 Troubleshooting

### Tailwind not working
```bash
# Ensure postcss.config.js exists
echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}" > postcss.config.js
```

### Module not found errors
```bash
npm install --save-dev @types/node
```

### HttpClient errors
Make sure `provideHttpClient()` is in app.config.ts (already added)

## 🚀 Deployment

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/warmly-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx config
Create `nginx.conf`:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://warmly-ai:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- Design Reference: `/warmly-ui/` folder

## 🎉 Demo Data

For testing, mock data is included in views. Replace with real API calls when backend is ready.

## ⚡ Performance Tips

1. Use lazy loading for routes (already configured)
2. Use Angular Signals for reactive state
3. Implement virtual scrolling for large lists
4. Use OnPush change detection where possible
5. Lazy load heavy components

---

**Status**: Core infrastructure complete, views in progress
**Next Priority**: Complete Conversations and Leads views
**Estimated Completion**: 4-6 hours for all views

