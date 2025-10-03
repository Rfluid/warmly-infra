import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  content?: string;
  role?: 'user' | 'assistant';
  thread_id?: string;
  timestamp?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  isConnected = signal(false);
  connectionStatus = signal<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');

  messages$ = this.messageSubject.asObservable();

  connect(threadId?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.connectionStatus.set('connecting');
    
    const wsUrl = environment.wsUrl || environment.apiUrl.replace('http', 'ws');
    const url = threadId 
      ? `${wsUrl}/api/messages/user/websocket?thread_id=${threadId}`
      : `${wsUrl}/api/messages/user/websocket`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected.set(true);
        this.connectionStatus.set('connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.set('error');
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected.set(false);
        this.connectionStatus.set('disconnected');
        this.socket = null;
        
        // Auto-reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
            this.connect(threadId);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.connectionStatus.set('error');
    }
  }

  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected.set(false);
    this.connectionStatus.set('disconnected');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }
}


