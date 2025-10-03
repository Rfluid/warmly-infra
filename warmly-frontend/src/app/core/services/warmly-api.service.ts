import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  id: string;
  thread_id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface InputRequest {
  data: string;
  thread_id: string;
  chat_interface?: string;
  max_retries?: number;
  loop_threshold?: number;
  top_k?: number;
  summarize_message_window?: number;
  summarize_message_keep?: number;
  summarize_system_messages?: boolean;
}

export interface ThreadState {
  values: any;
  metadata: any;
  created_at: string;
  checkpoint_id?: string;
}

export interface Document {
  filename: string;
  content_type: string;
  page_content: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarmlyApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Messages
  sendMessage(request: InputRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/user`, request);
  }

  sendSystemMessage(request: InputRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/system`, request);
  }

  // Threads
  getThreadState(threadId: string): Observable<ThreadState> {
    return this.http.get<ThreadState>(`${this.baseUrl}/api/threads/${threadId}/state`);
  }

  getThreadHistory(threadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/threads/${threadId}/history`);
  }

  clearThread(threadId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/threads/${threadId}`);
  }

  // Vector Store
  uploadDocuments(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    return this.http.post(`${this.baseUrl}/api/vectorstore/documents`, formData);
  }

  // Graph
  getWorkflowGraph(): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/graph/mermaid`, { responseType: 'text' });
  }

  // WebSocket connection
  connectWebSocket(threadId: string): WebSocket {
    const wsUrl = environment.wsUrl || this.baseUrl.replace('http', 'ws');
    return new WebSocket(`${wsUrl}/api/messages/user/websocket`);
  }
}

