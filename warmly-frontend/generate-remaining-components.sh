#!/bin/bash
# Script to generate remaining component files for Warmly Frontend

echo "🚀 Generating remaining Warmly components..."

# Create Conversations Component
cat > src/app/features/conversations/conversations.component.ts << 'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  warmth: number;
  unread: boolean;
}

interface ChatMessage {
  id: number;
  sender: 'lead' | 'ai';
  content: string;
  time: string;
  avatar?: string;
}

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent, WarmthBadgeComponent],
  template: `
    <div class="p-8 h-screen flex gap-6">
      <!-- Conversations List -->
      <div class="w-80 flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold text-warmly-text-primary">Conversations</h1>
          <span class="px-3 py-1 bg-warmly-primary/10 text-warmly-primary text-sm font-medium rounded-full">
            {{ unreadCount() }} new
          </span>
        </div>

        <div class="relative mb-4">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warmly-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text"
            placeholder="Search conversations..."
            class="w-full pl-10 pr-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 scrollbar-warmly">
          <button
            *ngFor="let contact of filteredContacts()"
            (click)="selectContact(contact)"
            [class]="selectedContact()?.id === contact.id ? 'bg-warmly-primary/10 border-warmly-primary' : 'bg-white hover:bg-warmly-bg'"
            class="w-full p-4 rounded-warmly-lg border border-warmly-border transition-all text-left"
          >
            <div class="flex items-start gap-3">
              <img [src]="contact.avatar" [alt]="contact.name" class="w-12 h-12 rounded-full object-cover"/>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-semibold text-warmly-text-primary truncate">{{ contact.name }}</h3>
                  <span class="text-xs text-warmly-text-muted">{{ contact.time }}</span>
                </div>
                <p class="text-sm text-warmly-text-muted truncate mb-2">{{ contact.lastMessage }}</p>
                <app-warmth-badge [score]="contact.warmth" />
              </div>
              <div *ngIf="contact.unread" class="w-2 h-2 bg-warmly-primary rounded-full"></div>
            </div>
          </button>
        </div>
      </div>

      <!-- Chat Panel -->
      <div class="flex-1 flex flex-col glass rounded-warmly-xl shadow-warmly-glass">
        <div *ngIf="selectedContact()" class="flex items-center justify-between p-4 border-b border-white/20">
          <div class="flex items-center gap-3">
            <img [src]="selectedContact().avatar" [alt]="selectedContact().name" class="w-10 h-10 rounded-full object-cover"/>
            <div>
              <h2 class="font-semibold text-warmly-text-primary">{{ selectedContact().name }}</h2>
              <app-warmth-badge [score]="selectedContact().warmth" />
            </div>
          </div>
          <div class="flex gap-2">
            <app-button variant="secondary" size="sm">Create Deal</app-button>
            <app-button variant="secondary" size="sm">Open Lead</app-button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-warmly">
          <div *ngFor="let message of messages" [class]="message.sender === 'lead' ? 'flex justify-start' : 'flex justify-end'">
            <div [class]="message.sender === 'lead' ? 'bg-white' : 'gradient-warmly text-white'" 
                 class="max-w-md px-4 py-3 rounded-2xl shadow-sm">
              <p class="text-sm">{{ message.content }}</p>
              <span [class]="message.sender === 'lead' ? 'text-warmly-text-muted' : 'text-white/70'" 
                    class="text-xs mt-1 block">{{ message.time }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-white/20">
          <div class="flex gap-2">
            <input 
              type="text"
              placeholder="Type your message..."
              class="flex-1 px-4 py-3 bg-white/50 border border-warmly-border rounded-warmly-lg focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
              [(ngModel)]="messageText"
              (keyup.enter)="sendMessage()"
            />
            <app-button variant="primary" (buttonClick)="sendMessage()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConversationsComponent {
  searchQuery = '';
  messageText = '';
  
  contacts: Contact[] = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=1",
      lastMessage: "Thanks for the demo! I'll discuss with my team.",
      time: "2m ago",
      warmth: 75,
      unread: false
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=2",
      lastMessage: "What's the pricing for enterprise?",
      time: "15m ago",
      warmth: 45,
      unread: true
    },
    {
      id: 3,
      name: "Lisa Thompson",
      avatar: "https://i.pravatar.cc/150?img=3",
      lastMessage: "Can we schedule a call this week?",
      time: "1h ago",
      warmth: 85,
      unread: true
    }
  ];

  messages: ChatMessage[] = [
    {
      id: 1,
      sender: "lead",
      content: "Hi! I saw your demo and I'm interested in learning more.",
      time: "10:30 AM",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      sender: "ai",
      content: "Thanks for reaching out! I'd love to help you explore our solution. What challenges are you facing?",
      time: "10:32 AM"
    }
  ];

  selectedContact = signal<Contact>(this.contacts[0]);

  filteredContacts() {
    if (!this.searchQuery) return this.contacts;
    return this.contacts.filter(c => 
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  unreadCount() {
    return this.contacts.filter(c => c.unread).length;
  }

  selectContact(contact: Contact) {
    this.selectedContact.set(contact);
  }

  sendMessage() {
    if (!this.messageText.trim()) return;
    
    this.messages.push({
      id: this.messages.length + 1,
      sender: 'ai',
      content: this.messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    
    this.messageText = '';
  }
}
EOF

# Create Leads Component
cat > src/app/features/leads/leads.component.ts << 'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, WarmthBadgeComponent],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">Leads</h1>
          <p class="text-warmly-text-muted mt-1">Manage and track all your leads</p>
        </div>
        <div class="flex gap-3">
          <app-button variant="secondary">Import CSV</app-button>
          <app-button variant="primary">Add Lead</app-button>
        </div>
      </div>

      <app-card variant="elevated">
        <!-- Filters -->
        <div class="flex gap-3 mb-6">
          <input 
            type="text"
            placeholder="Search leads..."
            class="flex-1 px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
            [(ngModel)]="searchQuery"
          />
          <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
            <option>All Tags</option>
            <option>High Priority</option>
            <option>Follow Up</option>
          </select>
          <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
            <option>All Warmth</option>
            <option>Hot (70+)</option>
            <option>Warm (40-69)</option>
            <option>Cool (0-39)</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-warmly-border">
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Name</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Email</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Company</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Warmth</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Tags</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Last Activity</th>
                <th class="text-right py-3 px-4 font-semibold text-warmly-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lead of filteredLeads()" class="border-b border-warmly-border hover:bg-warmly-bg transition-colors">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <img [src]="lead.avatar" [alt]="lead.name" class="w-8 h-8 rounded-full"/>
                    <span class="font-medium">{{ lead.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-warmly-text-muted">{{ lead.email }}</td>
                <td class="py-4 px-4">{{ lead.company }}</td>
                <td class="py-4 px-4">
                  <app-warmth-badge [score]="lead.warmth" />
                </td>
                <td class="py-4 px-4">
                  <div class="flex gap-1">
                    <span *ngFor="let tag of lead.tags" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {{ tag }}
                    </span>
                  </div>
                </td>
                <td class="py-4 px-4 text-warmly-text-muted text-sm">{{ lead.lastActivity }}</td>
                <td class="py-4 px-4 text-right">
                  <button class="text-warmly-primary hover:text-warmly-primary/80">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class LeadsComponent {
  searchQuery = '';
  
  leads = [
    { id: 1, name: 'Sarah Chen', email: 'sarah@company.com', company: 'TechCorp', warmth: 75, tags: ['Enterprise', 'Hot Lead'], lastActivity: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Marcus Rodriguez', email: 'marcus@startup.io', company: 'Startup Inc', warmth: 45, tags: ['SMB'], lastActivity: '1 day ago', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Lisa Thompson', email: 'lisa@bigco.com', company: 'BigCo', warmth: 85, tags: ['Enterprise', 'Decision Maker'], lastActivity: '30 min ago', avatar: 'https://i.pravatar.cc/150?img=3' }
  ];

  filteredLeads() {
    if (!this.searchQuery) return this.leads;
    return this.leads.filter(l => 
      l.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
EOF

# Create Funnel, Broadcast, Settings components (simplified)
for component in "funnel" "broadcast" "settings"; do
  componentName=$(echo "$component" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  
  cat > "src/app/features/${component}/${component}.component.ts" << EOF
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-${component}',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: \`
    <div class="p-8 space-y-6">
      <h1 class="text-3xl font-bold text-warmly-text-primary">${componentName}</h1>
      
      <app-card variant="elevated" title="${componentName} View">
        <p class="text-warmly-text-muted">
          This view is under construction. ${componentName} functionality will be implemented here.
        </p>
      </app-card>
    </div>
  \`,
  styles: []
})
export class ${componentName}Component {}
EOF
done

echo "✅ Components generated successfully!"
echo ""
echo "📁 Files created:"
echo "  - src/app/features/conversations/conversations.component.ts"
echo "  - src/app/features/leads/leads.component.ts"
echo "  - src/app/features/funnel/funnel.component.ts"
echo "  - src/app/features/broadcast/broadcast.component.ts"
echo "  - src/app/features/settings/settings.component.ts"
echo ""
echo "🚀 Next steps:"
echo "  1. cd warmly-frontend"
echo "  2. npm install"
echo "  3. npm start"
EOF

chmod +x /home/rfluid/development/Warmly/infra/warmly-frontend/generate-remaining-components.sh

