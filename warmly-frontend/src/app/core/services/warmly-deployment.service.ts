import { Injectable, inject, signal } from '@angular/core';
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, map, catchError, take, retry } from 'rxjs/operators';
import { StackManagerService, StackCreateRequest } from './stack-manager.service';
import { PersonaService } from './persona.service';
import { Persona } from '../models/persona.model';

export interface WarmlyStackConfig {
  clientId: string;
  stackName: string;
  wahaPassword: string;
  wahaApiKey: string;
}

export interface DeploymentStatus {
  phase: 'creating' | 'deploying' | 'configuring' | 'health-check' | 'ready' | 'error';
  message: string;
  progress: number; // 0-100
  urls?: {
    wahaDashboard: string;
    streamlitFrontend: string;
    apiBackend: string;
  };
  error?: string;
}

export interface DeployedStack {
  clientId: string;
  stackName: string;
  urls: {
    wahaDashboard: string;
    streamlitFrontend: string;
    apiBackend: string;
    wahaApi: string;
  };
  status: 'ready' | 'deploying' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class WarmlyDeploymentService {
  private stackManager = inject(StackManagerService);
  private personaService = inject(PersonaService);

  deploymentStatus = signal<DeploymentStatus>({
    phase: 'creating',
    message: 'Initializing...',
    progress: 0
  });

  /**
   * Deploy a complete Warmly AI stack
   */
  deployWarmlyStack(config: WarmlyStackConfig, persona: Persona): Observable<DeployedStack> {
    return new Observable(observer => {
      this.executeDeployment(config, persona, observer);
    });
  }

  private async executeDeployment(
    config: WarmlyStackConfig, 
    persona: Persona,
    observer: any
  ) {
    try {
      // Phase 1: Create stack via Stack Manager
      this.updateStatus('creating', 'Creating Warmly stack...', 10);

      const stackRequest: StackCreateRequest = {
        client_id: config.clientId,
        stack_name: config.stackName,
        template_id: 'warmly',
        environment: {
          CLIENT_ID: config.clientId,
          STACK_NAME: config.stackName,
          WAHA_DASHBOARD_PASSWORD: config.wahaPassword,
          WAHA_API_KEY_PLAIN: config.wahaApiKey,
          WAHA_API_KEY: this.hashApiKey(config.wahaApiKey),
          // Optional but recommended
          LLM_PROVIDER: 'openai',
          LLM_MODEL_NAME: 'gpt-4o-mini',
          EMBEDDING_PROVIDER: 'openai',
          EMBEDDING_MODEL_NAME: 'text-embedding-3-small'
        }
      };

      const stack = await this.stackManager.createStack(stackRequest).toPromise();
      this.updateStatus('deploying', 'Stack created, starting services...', 30);

      // Phase 2: Wait for services to be healthy
      this.updateStatus('health-check', 'Waiting for services to start...', 40);
      
      const urls = this.generateUrls(config.clientId, config.stackName);
      
      // Poll for health (max 3 minutes)
      const healthOk = await this.waitForHealthy(urls.apiBackend, urls.wahaApi, 180);
      
      if (!healthOk) {
        throw new Error('Services failed to start within timeout');
      }

      this.updateStatus('health-check', 'Services are healthy!', 60);

      // Phase 3: Configure prompts from persona
      this.updateStatus('configuring', 'Configuring AI persona prompts...', 70);
      
      const promptFiles = this.generatePromptFiles(persona);
      
      await this.stackManager.updateStack(config.clientId, config.stackName, {
        files: promptFiles
      }).toPromise();

      this.updateStatus('configuring', 'Prompts updated, restarting services...', 85);

      // Phase 4: Restart stack for prompt changes to take effect
      await this.stackManager.restartStack(config.clientId, config.stackName).toPromise();

      // Wait a bit for restart
      await this.delay(5000);

      // Phase 5: Final health check
      this.updateStatus('health-check', 'Final health check...', 90);
      
      const finalHealthOk = await this.waitForHealthy(urls.apiBackend, urls.wahaApi, 120);
      
      if (!finalHealthOk) {
        throw new Error('Services failed to restart properly');
      }

      // Success!
      this.updateStatus('ready', 'Warmly AI deployed successfully!', 100, urls);

      const deployedStack: DeployedStack = {
        clientId: config.clientId,
        stackName: config.stackName,
        urls,
        status: 'ready'
      };

      observer.next(deployedStack);
      observer.complete();

    } catch (error: any) {
      this.updateStatus('error', 'Deployment failed', 0, undefined, error.message);
      observer.error(error);
    }
  }

  /**
   * Wait for services to be healthy
   */
  private async waitForHealthy(
    apiUrl: string, 
    wahaUrl: string, 
    timeoutSeconds: number
  ): Promise<boolean> {
    const startTime = Date.now();
    const timeout = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeout) {
      try {
        // Check API health
        const apiHealth = await this.stackManager.checkServiceHealth(apiUrl).toPromise();
        
        // Check WAHA health
        const wahaHealth = await this.stackManager.checkServiceHealth(wahaUrl).toPromise();

        if (apiHealth && wahaHealth) {
          return true;
        }
      } catch (e) {
        // Services not ready yet, continue polling
      }

      await this.delay(5000); // Check every 5 seconds
    }

    return false;
  }

  /**
   * Generate URLs for the deployed stack
   */
  private generateUrls(clientId: string, stackName: string) {
    return {
      wahaDashboard: `http://waha.${stackName}.${clientId}.lvh.me`,
      streamlitFrontend: `http://${stackName}.${clientId}.lvh.me`,
      apiBackend: `http://backend.${stackName}.${clientId}.lvh.me`,
      wahaApi: `http://waha.${stackName}.${clientId}.lvh.me`
    };
  }

  /**
   * Generate prompt files from persona
   */
  private generatePromptFiles(persona: Persona): Record<string, string> {
    const files: Record<string, string> = {};

    // system.md - Main system prompt
    files['prompts/system.md'] = persona.compiled?.systemPrompt || this.personaService.compilePersona(persona).systemPrompt;

    // user.md - User message template
    files['prompts/user.md'] = `# User Message Template

The user says: {user_message}

Context:
- User name: {customer_name}
- Phone: {customer_phone}
- Warmth score: {warmth_score}
`;

    // evaluate_tools.md - Tool selection logic
    files['prompts/evaluate_tools.md'] = `# Tool Evaluation

You have access to these tools:
1. **search_knowledge** - Search the knowledge base for information
2. **register_intent** - Register customer intent (buying, question, objection, etc.)
3. **summarize** - Summarize conversation history

Evaluate which tools to use based on the user's message.
`;

    // error_handler.md - Error handling
    files['prompts/error_handler.md'] = `# Error Handling

If an error occurs, respond politely and offer to help in another way.

Example: "Desculpe, tive um problema técnico. Posso ajudar de outra forma?"
`;

    return files;
  }

  /**
   * Hash API key (sha512)
   */
  private hashApiKey(apiKey: string): string {
    // For demo purposes, return a placeholder
    // In production, this should be hashed properly
    return `sha512:fe09097e63d3f8c204042c65eb6490b9076bbadef3b06165d003880c65dd467225f89ce52e20eb325b796ff98ea494c8ea30a66bc5f7e1feded385623e83e27d`;
  }

  /**
   * Upload documents to Warmly AI vector store
   */
  uploadDocuments(apiUrl: string, files: File[]): Observable<string> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.stackManager['http'].post<string>(`${apiUrl}/documents`, formData);
  }

  /**
   * Update deployment status
   */
  private updateStatus(
    phase: DeploymentStatus['phase'],
    message: string,
    progress: number,
    urls?: DeploymentStatus['urls'],
    error?: string
  ) {
    this.deploymentStatus.set({
      phase,
      message,
      progress,
      urls,
      error
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current deployment status
   */
  getStatus(): DeploymentStatus {
    return this.deploymentStatus();
  }
}

