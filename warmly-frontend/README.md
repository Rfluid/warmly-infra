# Warmly Frontend 🔥

> Beautiful, modern, and responsive Angular frontend for Warmly AI - Built with Angular 19, Tailwind CSS, and love ❤️

![Warmly Design System](https://img.shields.io/badge/Design-Warmly-FF7A59?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎨 **Warmly Design System** - Orange-to-red gradients, glass morphism, premium shadows
- 🚀 **Fully Responsive** - Mobile-first design that looks stunning on all devices
- ⚡ **Blazing Fast** - Lazy-loaded routes, optimized bundles, Angular Signals
- 🔌 **Backend Integrated** - Full integration with Warmly AI backend APIs
- 📊 **Real-time Updates** - WebSocket support for live conversations
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation
- 🎭 **Smooth Animations** - Delightful transitions and micro-interactions

## 🎯 Views

### 1. AI Manager
Configure your AI persona, upload knowledge base documents, and manage tools & policies.

- Persona configuration (company, role, tone)
- Knowledge base upload (drag & drop)
- Tools & policies toggles

### 2. Conversations
Two-pane chat interface for managing customer conversations.

- Contact list with warmth badges
- Real-time chat with lead/AI bubbles
- Quick actions (Create Deal, Open Lead)
- Template dropdowns

### 3. Leads
Comprehensive lead management with advanced filtering.

- Sortable data table
- Warmth-based filtering
- Tag management
- Bulk actions

### 4. Funnel
Kanban-style sales pipeline visualization.

- Drag & drop lead cards
- Status columns (Inactive, Active, Waiting, Won, Lost)
- Warmth indicators
- Deal values

### 5. Broadcast & Automations
Bulk messaging and automated follow-ups.

- Message composer with variables
- Audience targeting
- Automation rules
- Campaign history

### 6. Settings
Application configuration and preferences.

- API connection settings
- Notification preferences
- Theme customization

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Angular CLI (will be installed if not present)
- Warmly AI backend running on `http://localhost:8000`

### Installation

```bash
# Clone the repository
cd /home/rfluid/development/Warmly/infra/warmly-frontend

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve

# Open browser
open http://localhost:4200
```

### Build for Production

```bash
# Build optimized production bundle
npm run build
# or
ng build --configuration=production

# Output will be in dist/warmly-frontend/browser/
```

## 🎨 Design System

### Colors

```css
/* Brand Colors */
--warmly-primary: #FF7A59
--warmly-secondary: #FF4E3A

/* Warmth Levels */
--warmth-cool: #60A5FA   /* 0-39 */
--warmth-warm: #F59E0B   /* 40-69 */
--warmth-hot: #EF4444    /* 70-100 */

/* Surfaces */
--warmly-bg: #F8FAFC
--warmly-surface: #FFFFFF
--warmly-border: #E2E8F0
```

### Tailwind Utilities

```html
<!-- Gradients -->
<div class="gradient-warmly">Orange to red gradient</div>
<div class="gradient-warmly-soft">Subtle background gradient</div>

<!-- Glass Morphism -->
<div class="glass">Glass effect with blur</div>
<div class="glass-strong">Stronger glass effect</div>

<!-- Shadows -->
<button class="shadow-warmly-card">Card shadow</button>
<button class="shadow-warmly-fab">Floating action button shadow</button>

<!-- Border Radius -->
<div class="rounded-warmly-xl">24px radius (cards)</div>
<div class="rounded-warmly-lg">16px radius (controls)</div>
```

### Components

All components follow the Warmly design language:

- **Button**: `variant="primary|secondary|ghost|danger"` `size="sm|md|lg"`
- **Input**: Full form control with labels, errors, hints
- **Card**: `variant="default|elevated|glass"`
- **Warmth Badge**: Automatically styles based on score (cool/warm/hot)

## 📡 API Integration

### Backend Endpoints

The frontend connects to the following Warmly AI backend endpoints:

```typescript
// Messages
POST /api/messages/user        // Send message
POST /api/messages/system       // System instructions
WS   /api/messages/user/websocket  // Real-time chat

// Threads
GET  /api/threads/{id}/state    // Get thread state
GET  /api/threads/{id}/history  // Get history
DEL  /api/threads/{id}          // Clear thread

// Knowledge Base
POST /api/vectorstore/documents // Upload documents

// Graph
GET  /api/graph/mermaid         // Workflow visualization
```

### Configuration

Update `src/environments/environment.ts` with your backend URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',  // Your backend URL
  wsUrl: 'ws://localhost:8000'       // WebSocket URL
};
```

## 📁 Project Structure

```
warmly-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/
│   │   │       └── warmly-api.service.ts    # API client
│   │   ├── features/                         # Feature modules
│   │   │   ├── ai-manager/
│   │   │   ├── conversations/
│   │   │   ├── leads/
│   │   │   ├── funnel/
│   │   │   ├── broadcast/
│   │   │   └── settings/
│   │   ├── layout/
│   │   │   └── floating-sidebar/             # Glass sidebar
│   │   ├── shared/
│   │   │   └── components/                   # Reusable components
│   │   │       ├── button/
│   │   │       ├── input/
│   │   │       ├── card/
│   │   │       └── warmth-badge/
│   │   ├── app.ts                            # Root component
│   │   ├── app.config.ts                     # App configuration
│   │   └── app.routes.ts                     # Routing config
│   ├── environments/
│   │   ├── environment.ts                    # Dev config
│   │   └── environment.prod.ts               # Prod config
│   └── styles.css                            # Global styles + Tailwind
├── tailwind.config.js                        # Tailwind configuration
├── postcss.config.js                         # PostCSS config
└── angular.json                              # Angular CLI config
```

## 🎭 Usage Examples

### Using the Button Component

```typescript
<app-button 
  variant="primary" 
  size="lg"
  [loading]="isLoading"
  (buttonClick)="handleClick()"
>
  Click Me
</app-button>
```

### Using the Warmth Badge

```typescript
<app-warmth-badge [score]="75" />
<!-- Displays: "Hot 75" with red styling -->
```

### Using the Card Component

```typescript
<app-card 
  variant="elevated" 
  title="My Card"
  subtitle="With a subtitle"
>
  <p>Card content goes here</p>
</app-card>
```

### Making API Calls

```typescript
import { WarmlyApiService } from './core/services/warmly-api.service';

export class MyComponent {
  private api = inject(WarmlyApiService);

  sendMessage() {
    this.api.sendMessage({
      data: 'Hello!',
      thread_id: 'thread-123'
    }).subscribe(response => {
      console.log('Response:', response);
    });
  }

  uploadDocs(files: File[]) {
    this.api.uploadDocuments(files).subscribe(result => {
      console.log('Upload complete:', result);
    });
  }
}
```

## 🔧 Development

### Running Linter

```bash
npm run lint
```

### Running Tests

```bash
npm test
```

### Building for Docker

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/warmly-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Troubleshooting

### Tailwind not working

Make sure `postcss.config.js` exists and Tailwind is imported in `styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### API connection errors

1. Check backend is running: `http://localhost:8000/docs`
2. Verify `environment.ts` has correct `apiUrl`
3. Check browser console for CORS errors

### Build errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular
```

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Warmly AI Backend](../warmly-ai/README.md)
- [Design Reference](../warmly-ui/)

## 🎯 Roadmap

- [ ] Add drag-and-drop to Funnel view
- [ ] Implement real-time WebSocket updates
- [ ] Add persona creation wizard
- [ ] Add WhatsApp connection modal
- [ ] Implement auth guards
- [ ] Add dark mode toggle
- [ ] Add internationalization (i18n)
- [ ] Add E2E tests with Cypress
- [ ] Add Storybook for component documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Warmly infrastructure and follows the same license.

## 🙏 Acknowledgments

- Design inspiration from [warmly-ui](../warmly-ui/)
- Built with ❤️ for the Hackathon
- Powered by Angular, Tailwind CSS, and the amazing OSS community

---

**Made with 🔥 by the Warmly Team**

For issues and support, check the [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
