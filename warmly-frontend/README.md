# Warmly Frontend

A complete, production-ready Angular web application for managing AI-powered WhatsApp conversations, leads, and sales automation.

## 🚀 Features

### Authentication
- ✅ Firebase Authentication (Google & Email/Password)
- ✅ Auth guards and interceptors
- ✅ Automatic token management

### Onboarding
- ✅ 7-Step Persona Creation Wizard
  - Identity & Basic Info
  - Tone & Communication Style
  - Company Information
  - Catalog & Pricing
  - Conversation Playbook
  - Automation Settings
  - Final Review & Creation
- ✅ Draft saving and recovery
- ✅ AI-powered persona compilation

### WhatsApp Integration
- ✅ Connection Gate with QR Code
- ✅ Non-dismissable blocking modal until connected
- ✅ Real-time connection status
- ✅ Mock mode for development

### Conversations
- ✅ Real-time chat interface
- ✅ Two-pane layout (list + chat)
- ✅ Warmth score badges
- ✅ Message search and filtering
- ✅ Typing indicators
- ✅ Unread message counts
- ✅ Auto-scroll to bottom

### Leads Management
- ✅ Smart Tags (dynamic fields)
  - Text, Select, Multiselect, Number, Date, Boolean
  - User-defined tag schemas
  - Bulk tag operations
- ✅ Advanced filtering
  - Warmth score ranges
  - Status filtering
  - Tag-based filtering
  - Search functionality
- ✅ CRUD operations
- ✅ CSV Import/Export
- ✅ Bulk operations

### Sales Funnel
- ✅ Kanban board with drag & drop
- ✅ 5 pipeline stages: Inactive → Active → Waiting Contact → Won/Lost
- ✅ Real-time status updates
- ✅ Conversion rate tracking
- ✅ Average warmth per stage
- ✅ Stats dashboard

### Broadcast & Automations
- ✅ Bulk message sender
  - Filter by warmth, status, tags
  - Preview recipients
  - Rate limiting
  - Send history
- ✅ Automation Rules
  - Warmth range-based
  - Inactivity-based
  - Drip sequences
  - Toggle active/inactive
  - Execution history

### AI Manager
- ✅ View & edit persona
- ✅ System prompt compilation
- ✅ Persona overview cards
- ✅ Knowledge base management
- ✅ Copy system prompt

### Settings
- ✅ Profile management
- ✅ WhatsApp connection control
- ✅ Notification preferences
- ✅ Data export
- ✅ Account management

### UI/UX
- ✅ Modern, warm gradient theme (coral/red-orange)
- ✅ Fully responsive (mobile-first)
- ✅ TailwindCSS styling
- ✅ Beautiful animations & transitions
- ✅ Toast notifications
- ✅ Modal system
- ✅ Empty states
- ✅ Loading states
- ✅ Error handling

## 🛠️ Tech Stack

- **Framework**: Angular 17+ (Standalone Components)
- **Styling**: TailwindCSS
- **State Management**: Angular Signals
- **Authentication**: Firebase Auth
- **Database**: Firestore (client-side) + LocalStorage (demo mode)
- **HTTP**: Angular HttpClient with interceptors
- **Router**: Angular Router with guards

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up Firebase
# Copy your Firebase config to src/environments/environment.ts

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at https://firebase.google.com
2. Enable Authentication (Google & Email/Password)
3. Enable Firestore
4. Copy your Firebase config to `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000',
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

### Backend API (Optional)

The app works in demo mode with localStorage, but can connect to a real backend:

- Set `apiUrl` in environment files
- Backend should implement the following endpoints:
  - `POST /api/auth/*` - Authentication
  - `GET /api/leads` - Get leads
  - `POST /api/messages` - Send messages
  - `GET /api/conversations` - Get conversations
  - `WebSocket /ws` - Real-time updates

## 📱 Features Walkthrough

### First-Time User Flow

1. **Login/Register** → Firebase authentication
2. **Persona Wizard** → 7-step AI configuration
3. **WhatsApp Gate** → QR code connection (non-dismissable until connected)
4. **Main App** → Full access to all features

### Main Navigation

- **Conversations**: Chat with leads
- **Leads**: Manage contacts with smart tags
- **Funnel**: Kanban pipeline
- **Broadcast**: Bulk messages & automations
- **AI Manager**: View/edit AI persona
- **Settings**: Account & preferences

## 🎨 Design System

### Colors

- **Primary Gradient**: `#FF7A59` (coral) → `#FF4E3A` (red-orange)
- **Text Primary**: `#0F172A` (slate-900)
- **Text Secondary**: `#334155` (slate-600)
- **Success**: `#22C55E`
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`

### Components

- **Button**: Primary, Secondary, Ghost, Danger variants
- **Card**: Default, Elevated, Glass variants
- **Modal**: Blocking and non-blocking
- **Badge**: Warmth-aware (cool, warm, hot)
- **Table**: Sortable with advanced filtering
- **Toast**: Global notification system

## 📊 Data Models

### Persona
- Identity (name, company, role, languages)
- Tone & Style (tone chips, emojis, phrases)
- Company info & compliance
- Catalog & pricing rules
- Conversation playbook
- Automation settings
- Compiled system prompt

### Lead
- Basic info (name, phone, email)
- Warmth score (0-100)
- Status (inactive/active/waiting/won/lost)
- Dynamic tags (user-defined schemas)
- Activity timestamps

### Conversation
- Lead reference
- Message history
- Unread count
- Last message

### Automation
- Type (warmth_range, inactivity, drip)
- Filters (warmth, tags, status)
- Schedule (cadence, quiet hours)
- Template
- Execution stats

### Bulk Message
- Message content
- Recipient filters
- Status (draft/scheduled/sending/sent/failed)
- Success/fail counts

## 🔐 Security

- Firebase Authentication tokens
- HTTP interceptor for automatic token injection
- Auth guards on protected routes
- Firestore security rules (configure in Firebase Console)

## 🚢 Deployment

### Firebase Hosting

```bash
# Build
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Other Platforms

The built files are in `dist/warmly-frontend/` and can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Google Cloud Storage
- Any static hosting

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Code coverage
npm run test:coverage
```

## 📝 Development Notes

### Mock Mode

The app runs in "mock mode" by default, using localStorage instead of real APIs. This allows:
- ✅ Full UI testing without backend
- ✅ Sample data initialization
- ✅ Offline development

To enable real API mode, update `environment.ts` with your backend URL.

### State Management

Uses Angular Signals for reactive state:
- Services hold `signal()` state
- Components use `computed()` for derived values
- Automatic change detection

### Styling

TailwindCSS with custom Warmly theme:
- Utility-first approach
- Custom color palette
- Responsive breakpoints
- Custom components in `@layer`

## 🐛 Known Issues & Limitations

- File upload for persona catalog not fully implemented (UI only)
- Real-time WebSocket connection needs backend
- Some automation features are UI-ready but need backend integration
- Image/audio attachments in conversations need backend support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ using:
- Angular
- TailwindCSS
- Firebase
- And many amazing open-source libraries

---

**Made by Warmly Team** | © 2025

