import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, Conversation } from '../models/message.model';
import { AuthService } from './auth.service';
import { LeadsService } from './leads.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private leadsService = inject(LeadsService);
  private baseUrl = environment.apiUrl;

  conversations = signal<Conversation[]>([]);
  activeConversation = signal<Conversation | null>(null);

  private readonly MESSAGES_STORAGE_KEY = 'warmly_messages';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
    if (stored) {
      try {
        const conversations = JSON.parse(stored);
        this.conversations.set(conversations);
      } catch (e) {
        console.error('Failed to parse messages:', e);
        this.initializeSampleConversations();
      }
    } else {
      this.initializeSampleConversations();
    }
  }

  private initializeSampleConversations(): void {
    const leads = this.leadsService.leads();
    if (leads.length === 0) return;

    const sampleConversations: Conversation[] = leads.slice(0, 3).map((lead, index) => {
      const messages: Message[] = [
        {
          id: `msg-${index}-1`,
          leadId: lead.id!,
          sender: 'lead',
          text: 'Olá! Gostaria de saber mais sobre os produtos.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true
        },
        {
          id: `msg-${index}-2`,
          leadId: lead.id!,
          sender: 'ai',
          text: `Olá ${lead.name}! Fico feliz em ajudar. Temos várias opções disponíveis. Qual tipo de solução você está procurando?`,
          timestamp: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
          read: true
        },
        {
          id: `msg-${index}-3`,
          leadId: lead.id!,
          sender: 'lead',
          text: 'Estou interessado no plano premium.',
          timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
          read: true
        },
        {
          id: `msg-${index}-4`,
          leadId: lead.id!,
          sender: 'ai',
          text: 'Ótima escolha! O plano Premium inclui todas as funcionalidades avançadas. Posso te enviar mais detalhes?',
          timestamp: new Date(Date.now() - 22.5 * 60 * 60 * 1000),
          read: true
        }
      ];

      return {
        leadId: lead.id!,
        lead: {
          name: lead.name,
          phone: lead.phone,
          warmth: lead.warmth
        },
        lastMessage: messages[messages.length - 1],
        unreadCount: 0,
        messages
      };
    });

    this.conversations.set(sampleConversations);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.MESSAGES_STORAGE_KEY, JSON.stringify(this.conversations()));
  }

  // Get all conversations
  getConversations(): Observable<Conversation[]> {
    return of(this.conversations());
  }

  // Get conversation by lead ID
  getConversation(leadId: string): Observable<Conversation | undefined> {
    const conv = this.conversations().find(c => c.leadId === leadId);
    if (conv) {
      this.activeConversation.set(conv);
    }
    return of(conv);
  }

  // Send message
  sendMessage(leadId: string, text: string, mediaUrl?: string): Observable<Message> {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      leadId,
      sender: 'user',
      text,
      mediaUrl,
      timestamp: new Date(),
      read: true
    };

    // Add message to conversation
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.leadId === leadId);
      if (index !== -1) {
        const updated = { ...convs[index] };
        updated.messages = [...updated.messages, newMessage];
        updated.lastMessage = newMessage;
        
        const newConvs = [...convs];
        newConvs[index] = updated;
        
        // Move conversation to top
        newConvs.unshift(newConvs.splice(index, 1)[0]);
        return newConvs;
      }
      return convs;
    });

    this.saveToStorage();

    // Simulate AI response after 2 seconds
    setTimeout(() => {
      this.simulateAIResponse(leadId, text);
    }, 2000);

    return of(newMessage);
  }

  private simulateAIResponse(leadId: string, userMessage: string): void {
    const responses = [
      'Entendi! Vou verificar isso para você.',
      'Ótima pergunta! Deixe-me te ajudar com isso.',
      'Com certeza! Posso te dar mais informações sobre isso.',
      'Perfeito! Vou preparar as informações que você precisa.',
      'Excelente! Vamos prosseguir com isso.'
    ];

    const aiMessage: Message = {
      id: Math.random().toString(36).substring(7),
      leadId,
      sender: 'ai',
      text: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      read: true
    };

    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.leadId === leadId);
      if (index !== -1) {
        const updated = { ...convs[index] };
        updated.messages = [...updated.messages, aiMessage];
        updated.lastMessage = aiMessage;
        
        const newConvs = [...convs];
        newConvs[index] = updated;
        return newConvs;
      }
      return convs;
    });

    this.saveToStorage();
  }

  // Mark conversation as read
  markAsRead(leadId: string): Observable<boolean> {
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.leadId === leadId);
      if (index !== -1) {
        const updated = { ...convs[index] };
        updated.unreadCount = 0;
        updated.messages = updated.messages.map(m => ({ ...m, read: true }));
        
        const newConvs = [...convs];
        newConvs[index] = updated;
        return newConvs;
      }
      return convs;
    });

    this.saveToStorage();
    return of(true);
  }

  // Delete conversation
  deleteConversation(leadId: string): Observable<boolean> {
    this.conversations.update(convs => convs.filter(c => c.leadId !== leadId));
    this.saveToStorage();
    return of(true);
  }

  // Get total unread count
  getTotalUnreadCount(): number {
    return this.conversations().reduce((sum, conv) => sum + conv.unreadCount, 0);
  }
}


