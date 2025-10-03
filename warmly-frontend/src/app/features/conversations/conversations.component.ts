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
  imports: [CommonModule, FormsModule, ButtonComponent, WarmthBadgeComponent],
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
            [class]="selectedContact().id === contact.id ? 'bg-warmly-primary/10 border-warmly-primary' : 'bg-white hover:bg-warmly-bg'"
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

