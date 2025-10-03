import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';
import { ConversationsService } from '../../core/services/conversations.service';
import { Conversation, Message } from '../../core/models/message.model';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, WarmthBadgeComponent],
  template: `
    <div class="flex flex-col lg:flex-row h-[calc(100vh-2rem)] md:h-screen gap-4 p-4 md:p-6">
      <!-- Conversations List -->
      <div class="w-full lg:w-80 flex flex-col bg-white rounded-2xl shadow-warmly-lg overflow-hidden">
        <div class="p-4 border-b border-warmly-border">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-warmly-text-primary">Conversations</h2>
            <span *ngIf="unreadCount() > 0" class="px-2 py-1 bg-warmly-primary text-white text-xs rounded-full">
              {{ unreadCount() }}
            </span>
          </div>
          
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterConversations()"
              placeholder="Search conversations..."
              class="w-full px-4 py-2 pl-10 bg-warmly-bg border border-warmly-border rounded-warmly-lg focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
            />
            <span class="absolute left-3 top-2.5 text-warmly-text-muted">🔍</span>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto scrollbar-warmly">
          <div *ngIf="filteredConversations().length === 0" class="p-6 text-center">
            <p class="text-warmly-text-muted">No conversations yet</p>
            <p class="text-xs text-warmly-text-muted mt-2">Start chatting with your leads</p>
          </div>

          <button
            *ngFor="let conv of filteredConversations()"
            (click)="selectConversation(conv)"
            [class]="selectedConv()?.leadId === conv.leadId 
              ? 'bg-warmly-primary/10 border-l-4 border-warmly-primary' 
              : 'hover:bg-warmly-bg border-l-4 border-transparent'"
            class="w-full p-4 border-b border-warmly-border transition-all text-left"
          >
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-warmly flex items-center justify-center text-white font-semibold flex-shrink-0">
                {{ getInitials(conv.lead.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-semibold text-warmly-text-primary truncate">
                    {{ conv.lead.name }}
                  </h3>
                  <span *ngIf="conv.lastMessage" class="text-xs text-warmly-text-muted whitespace-nowrap ml-2">
                    {{ formatTime(conv.lastMessage.timestamp!) }}
                  </span>
                </div>
                <p class="text-sm text-warmly-text-secondary truncate">
                  {{ conv.lastMessage?.text || 'No messages yet' }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <app-warmth-badge [score]="conv.lead.warmth" />
                  <span *ngIf="conv.unreadCount > 0" 
                    class="px-2 py-0.5 bg-warmly-primary text-white text-xs rounded-full">
                    {{ conv.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-warmly-lg overflow-hidden">
        <!-- No Conversation Selected -->
        <div *ngIf="!selectedConv()" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-warmly-bg flex items-center justify-center">
              <span class="text-4xl">💬</span>
            </div>
            <h3 class="text-xl font-semibold text-warmly-text-primary mb-2">No conversation selected</h3>
            <p class="text-warmly-text-secondary">Select a conversation to start chatting</p>
          </div>
        </div>

        <!-- Conversation Selected -->
        <div *ngIf="selectedConv()" class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="p-4 border-b border-warmly-border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-warmly flex items-center justify-center text-white font-semibold">
                {{ getInitials(selectedConv()!.lead.name) }}
              </div>
              <div>
                <h2 class="font-semibold text-warmly-text-primary">
                  {{ selectedConv()!.lead.name }}
                </h2>
                <p class="text-sm text-warmly-text-muted">
                  {{ selectedConv()!.lead.phone }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <app-warmth-badge [score]="selectedConv()!.lead.warmth" />
            </div>
          </div>

          <!-- Messages -->
          <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-warmly bg-warmly-bg/30">
            <!-- No Messages -->
            <div *ngIf="messages().length === 0" class="text-center py-8">
              <p class="text-warmly-text-muted">No messages yet</p>
            </div>

            <!-- Message Bubbles -->
            <div *ngFor="let message of messages()" [class]="message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div [class]="message.sender === 'user' 
                ? 'bg-warmly-primary text-white max-w-[70%] rounded-2xl rounded-br-md px-4 py-3' 
                : message.sender === 'ai'
                ? 'bg-blue-100 text-blue-900 max-w-[70%] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-blue-200'
                : 'bg-white max-w-[70%] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-warmly-border'">
                <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
                <p [class]="message.sender === 'user' ? 'text-white/70' : 'text-warmly-text-muted'" 
                   class="text-xs mt-1">
                  {{ formatTime(message.timestamp!) }}
                </p>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div *ngIf="isTyping()" class="flex justify-start">
              <div class="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-warmly-border">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-warmly-text-muted rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-warmly-text-muted rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-warmly-text-muted rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 border-t border-warmly-border">
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="messageText"
                (keyup.enter)="sendMessage()"
                placeholder="Type your message..."
                [disabled]="isSending()"
                class="flex-1 px-4 py-3 bg-warmly-bg border border-warmly-border rounded-warmly-lg focus:outline-none focus:ring-2 focus:ring-warmly-primary/50 disabled:opacity-50"
              />
              <app-button
                variant="primary"
                [disabled]="!messageText.trim() || isSending()"
                (buttonClick)="sendMessage()"
              >
                {{ isSending() ? '...' : '📤' }}
              </app-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-warmly::-webkit-scrollbar {
      width: 6px;
    }
    .scrollbar-warmly::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .scrollbar-warmly::-webkit-scrollbar-thumb {
      background: #FF7A59;
      border-radius: 10px;
    }
  `]
})
export class ConversationsComponent implements OnInit, AfterViewChecked {
  private conversationsService = inject(ConversationsService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  conversations = signal<Conversation[]>([]);
  filteredConversations = signal<Conversation[]>([]);
  selectedConv = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  
  searchQuery = '';
  messageText = '';
  
  isSending = signal(false);
  isTyping = signal(false);
  unreadCount = signal(0);

  private shouldScrollToBottom = false;

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadConversations() {
    this.conversationsService.getConversations().subscribe({
      next: (convs) => {
        this.conversations.set(convs);
        this.filteredConversations.set(convs);
        this.calculateUnreadCount();
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      }
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConv.set(conv);
    this.messages.set(conv.messages || []);
    this.shouldScrollToBottom = true;
    
    // Mark as read
    this.conversationsService.markAsRead(conv.leadId).subscribe();
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.selectedConv()) return;
    
    this.isSending.set(true);
    const leadId = this.selectedConv()!.leadId;
    const text = this.messageText;
    
    this.messageText = '';
    
    this.conversationsService.sendMessage(leadId, text).subscribe({
      next: (message) => {
        this.messages.update(msgs => [...msgs, message]);
        this.shouldScrollToBottom = true;
        this.isSending.set(false);
        
        // Reload conversations to update list
        this.loadConversations();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending.set(false);
      }
    });
  }

  filterConversations() {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredConversations.set(this.conversations());
      return;
    }
    
    const filtered = this.conversations().filter(c => 
      c.lead.name.toLowerCase().includes(query) ||
      c.lead.phone.includes(query) ||
      (c.lastMessage?.text && c.lastMessage.text.toLowerCase().includes(query))
    );
    this.filteredConversations.set(filtered);
  }

  calculateUnreadCount() {
    const count = this.conversations().reduce((sum, c) => sum + c.unreadCount, 0);
    this.unreadCount.set(count);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatTime(timestamp: Date): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
