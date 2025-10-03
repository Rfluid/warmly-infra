import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StackCreateRequest {
  client_id: string;
  stack_name: string;
  template_id: string;
  environment: Record<string, string>;
}

export interface Stack {
  id: string;
  client_id: string;
  name: string;
  template_id: string;
  status: string;
  environment: Record<string, string>;
  created_at: string;
  updated_at: string;
  path: string;
}

export interface StackStatus {
  stack_id: string;
  status: 'running' | 'stopped' | 'partial' | 'unknown';
  containers: Array<{
    name: string;
    state: string;
    status: string;
    image: string;
    health?: string;
  }>;
  updated_at: string;
}

export interface StackUpdateRequest {
  environment?: Record<string, string>;
  files?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class StackManagerService {
  private http = inject(HttpClient);
  private baseUrl = environment.stackManagerApiUrl || 'http://localhost:8080';

  // Create stack
  createStack(request: StackCreateRequest): Observable<Stack> {
    return this.http.post<Stack>(`${this.baseUrl}/api/stacks`, request);
  }

  // Get stack
  getStack(clientId: string, stackName: string): Observable<Stack> {
    return this.http.get<Stack>(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}`);
  }

  // Update stack (files and env)
  updateStack(clientId: string, stackName: string, update: StackUpdateRequest): Observable<Stack> {
    return this.http.patch<Stack>(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}`, update);
  }

  // Get stack status
  getStackStatus(clientId: string, stackName: string): Observable<StackStatus> {
    return this.http.get<StackStatus>(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}/status`);
  }

  // Start stack
  startStack(clientId: string, stackName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}/start`, {});
  }

  // Stop stack
  stopStack(clientId: string, stackName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}/stop`, {});
  }

  // Restart stack
  restartStack(clientId: string, stackName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}/restart`, {});
  }

  // Get logs
  getLogs(clientId: string, stackName: string, tail: number = 100): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}/logs?tail=${tail}`, {
      responseType: 'text'
    });
  }

  // Delete stack
  deleteStack(clientId: string, stackName: string, removeVolumes: boolean = false): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/clients/${clientId}/stacks/${stackName}?removeVolumes=${removeVolumes}`);
  }

  // List stacks for client
  listStacks(clientId: string): Observable<Stack[]> {
    return this.http.get<Stack[]>(`${this.baseUrl}/api/clients/${clientId}/stacks`);
  }

  // Health check for specific services
  checkServiceHealth(serviceUrl: string): Observable<any> {
    return this.http.get(`${serviceUrl}/health`, {
      responseType: 'json'
    });
  }
}
