import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PersonaService } from '../../../core/services/persona.service';
import { WarmlyDeploymentService, WarmlyStackConfig, DeployedStack } from '../../../core/services/warmly-deployment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeployedAIsService } from '../../../core/services/deployed-ais.service';

@Component({
  selector: 'app-create-warmly-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-warmly-bg via-white to-warmly-bg/50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-warmly mb-4 shadow-warmly-lg">
            <span class="text-4xl font-bold text-white">🤖</span>
          </div>
          <h1 class="text-4xl font-bold text-warmly-text-primary mb-2">Create Your Warmly AI</h1>
          <p class="text-warmly-text-secondary">Deploy a complete AI-powered WhatsApp assistant</p>
        </div>

        <!-- Step 1: Configuration Form -->
        <div *ngIf="currentStep === 'config'" class="bg-white rounded-3xl shadow-warmly-xl p-8">
          <h2 class="text-2xl font-bold text-warmly-text-primary mb-6">Stack Configuration</h2>

          <div class="space-y-4">
            <app-input
              label="Client ID"
              [(value)]="config.clientId"
              placeholder="acme-corp"
              [required]="true"
              helpText="Unique identifier for your organization"
            />

            <app-input
              label="Stack Name"
              [(value)]="config.stackName"
              placeholder="assistant"
              [required]="true"
              helpText="Name for this AI instance"
            />

            <app-input
              label="WAHA Dashboard Password"
              type="password"
              [(value)]="config.wahaPassword"
              [required]="true"
              helpText="Password to access WhatsApp dashboard"
            />

            <app-input
              label="WAHA API Key"
              type="password"
              [(value)]="config.wahaApiKey"
              [required]="true"
              helpText="API key for WhatsApp integration"
            />

            <div class="pt-4 border-t border-warmly-border">
              <h3 class="font-semibold text-warmly-text-primary mb-3">Your AI Persona</h3>
              <div *ngIf="persona()" class="p-4 bg-warmly-bg rounded-warmly-lg">
                <p><strong>Name:</strong> {{ persona()?.name }}</p>
                <p><strong>Company:</strong> {{ persona()?.company }}</p>
                <p class="text-sm text-warmly-text-muted mt-2">
                  This persona will be used to configure your AI
                </p>
              </div>
              <div *ngIf="!persona()" class="p-4 bg-red-50 border border-red-200 rounded-warmly-lg text-red-700">
                ⚠️ No persona found. Please create a persona first.
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <app-button variant="ghost" (buttonClick)="cancel()">Cancel</app-button>
              <app-button 
                variant="primary" 
                [disabled]="!canDeploy()"
                (buttonClick)="startDeployment()"
              >
                Deploy AI 🚀
              </app-button>
            </div>
          </div>
        </div>

        <!-- Step 2: Deployment Progress -->
        <div *ngIf="currentStep === 'deploying'" class="bg-white rounded-3xl shadow-warmly-xl p-8">
          <h2 class="text-2xl font-bold text-warmly-text-primary mb-6">Deploying Your AI...</h2>

          <!-- Progress Bar -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-warmly-text-primary">{{ deploymentStatus().message }}</span>
              <span class="text-sm text-warmly-text-muted">{{ deploymentStatus().progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-gradient-warmly h-3 rounded-full transition-all duration-500"
                [style.width.%]="deploymentStatus().progress"
              ></div>
            </div>
          </div>

          <!-- Phase Indicators -->
          <div class="space-y-3">
            <div *ngFor="let phase of phases" 
              class="flex items-center gap-3 p-3 rounded-warmly-lg"
              [class]="getPhaseClass(phase.id)"
            >
              <div class="flex-shrink-0">
                <div *ngIf="isPhaseComplete(phase.id)" class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <div *ngIf="isPhaseActive(phase.id)" class="w-6 h-6 rounded-full border-4 border-warmly-primary border-t-transparent animate-spin"></div>
                <div *ngIf="isPhasePending(phase.id)" class="w-6 h-6 rounded-full bg-gray-300"></div>
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ phase.label }}</p>
                <p class="text-sm text-warmly-text-muted">{{ phase.description }}</p>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div *ngIf="deploymentStatus().error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-warmly-lg text-red-700">
            <p class="font-semibold mb-2">❌ Deployment Error</p>
            <p class="text-sm">{{ deploymentStatus().error }}</p>
            <app-button variant="danger" size="sm" class="mt-3" (buttonClick)="retryDeployment()">
              Retry Deployment
            </app-button>
          </div>
        </div>

        <!-- Step 3: Success & Next Steps -->
        <div *ngIf="currentStep === 'ready'" class="space-y-6">
          <!-- Success Card -->
          <div class="bg-white rounded-3xl shadow-warmly-xl p-8 text-center">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
              <span class="text-5xl">🎉</span>
            </div>
            <h2 class="text-3xl font-bold text-warmly-text-primary mb-2">AI Deployed Successfully!</h2>
            <p class="text-warmly-text-secondary mb-6">Your Warmly AI is now running and ready to use</p>
          </div>

          <!-- URLs Card -->
          <app-card title="Access Your Services" variant="elevated">
            <div class="space-y-4">
              <div class="p-4 bg-warmly-bg rounded-warmly-lg">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <p class="font-semibold text-warmly-text-primary">WAHA Dashboard</p>
                    <p class="text-sm text-warmly-text-muted">Login to connect WhatsApp</p>
                  </div>
                  <app-button variant="secondary" size="sm" (buttonClick)="openUrl(deployedStack()!.urls.wahaDashboard)">
                    Open 🔗
                  </app-button>
                </div>
                <code class="text-xs text-warmly-text-muted">{{ deployedStack()?.urls?.wahaDashboard }}</code>
              </div>

              <div class="p-4 bg-warmly-bg rounded-warmly-lg">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <p class="font-semibold text-warmly-text-primary">AI Frontend (Streamlit)</p>
                    <p class="text-sm text-warmly-text-muted">Chat interface for testing</p>
                  </div>
                  <app-button variant="secondary" size="sm" (buttonClick)="openUrl(deployedStack()!.urls.streamlitFrontend)">
                    Open 🔗
                  </app-button>
                </div>
                <code class="text-xs text-warmly-text-muted">{{ deployedStack()?.urls?.streamlitFrontend }}</code>
              </div>

              <div class="p-4 bg-warmly-bg rounded-warmly-lg">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <p class="font-semibold text-warmly-text-primary">API Backend</p>
                    <p class="text-sm text-warmly-text-muted">REST API endpoint</p>
                  </div>
                  <app-button variant="ghost" size="sm" (buttonClick)="copyToClipboard(deployedStack()!.urls.apiBackend)">
                    Copy 📋
                  </app-button>
                </div>
                <code class="text-xs text-warmly-text-muted">{{ deployedStack()?.urls?.apiBackend }}</code>
              </div>
            </div>
          </app-card>

          <!-- Upload Documents Card -->
          <app-card title="📚 Upload Knowledge Base Documents" variant="elevated">
            <p class="text-warmly-text-secondary mb-4">
              Upload documents to enhance your AI's knowledge. Supported formats: .txt, .json, .csv
            </p>

            <div class="border-2 border-dashed border-warmly-border rounded-warmly-lg p-6">
              <input 
                type="file" 
                #fileInput
                multiple
                accept=".txt,.json,.csv"
                (change)="onFilesSelected($event)"
                class="hidden"
              />

              <div *ngIf="selectedFiles().length === 0" class="text-center">
                <p class="text-warmly-text-muted mb-4">Drop files here or click to browse</p>
                <app-button variant="secondary" (buttonClick)="fileInput.click()">
                  Choose Files
                </app-button>
              </div>

              <div *ngIf="selectedFiles().length > 0" class="space-y-2">
                <div *ngFor="let file of selectedFiles(); let i = index" 
                  class="flex items-center justify-between p-3 bg-white rounded-warmly-lg border border-warmly-border">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">📄</span>
                    <div>
                      <p class="font-medium text-sm">{{ file.name }}</p>
                      <p class="text-xs text-warmly-text-muted">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <button (click)="removeFile(i)" class="text-red-600 hover:text-red-700">
                    ✕
                  </button>
                </div>

                <div class="flex gap-2 pt-4">
                  <app-button variant="ghost" (buttonClick)="fileInput.click()">
                    Add More
                  </app-button>
                  <app-button 
                    variant="primary" 
                    [disabled]="isUploading()"
                    (buttonClick)="uploadDocuments()"
                  >
                    {{ isUploading() ? 'Uploading...' : 'Upload ' + selectedFiles().length + ' File(s)' }}
                  </app-button>
                </div>
              </div>
            </div>

            <div *ngIf="uploadedCount() > 0" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-warmly-lg text-green-700">
              ✅ Successfully uploaded {{ uploadedCount() }} document(s)
            </div>
          </app-card>

          <!-- Actions -->
          <div class="flex justify-center gap-3">
            <app-button variant="secondary" (buttonClick)="goToAIManager()">
              Go to AI Manager
            </app-button>
            <app-button variant="primary" (buttonClick)="goToConversations()">
              Go to Dashboard →
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CreateWarmlyAIComponent implements OnInit {
  private router = inject(Router);
  private personaService = inject(PersonaService);
  private deploymentService = inject(WarmlyDeploymentService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private deployedAIsService = inject(DeployedAIsService);

  currentStep: 'config' | 'deploying' | 'ready' = 'config';
  
  config: WarmlyStackConfig = {
    clientId: '',
    stackName: '',
    wahaPassword: '',
    wahaApiKey: ''
  };

  persona = this.personaService.currentPersona;
  deploymentStatus = this.deploymentService.deploymentStatus;
  deployedStack = signal<DeployedStack | null>(null);
  
  selectedFiles = signal<File[]>([]);
  isUploading = signal(false);
  uploadedCount = signal(0);

  phases = [
    { id: 'creating', label: 'Creating Stack', description: 'Setting up infrastructure' },
    { id: 'deploying', label: 'Deploying Services', description: 'Starting containers' },
    { id: 'health-check', label: 'Health Check', description: 'Verifying services' },
    { id: 'configuring', label: 'Configuring AI', description: 'Applying persona settings' },
    { id: 'ready', label: 'Ready', description: 'All systems operational' }
  ];

  ngOnInit() {
    // Auto-fill from user
    const user = this.authService.currentUser();
    if (user) {
      this.config.clientId = user.email?.split('@')[0] || user.uid.substring(0, 8);
      this.config.stackName = 'assistant';
    }

    // Check if persona exists
    if (!this.persona()) {
      this.toastService.warning('Please create a persona first');
      this.router.navigate(['/onboarding/persona']);
    }
  }

  canDeploy(): boolean {
    return !!(
      this.config.clientId &&
      this.config.stackName &&
      this.config.wahaPassword &&
      this.config.wahaApiKey &&
      this.persona()
    );
  }

  startDeployment() {
    if (!this.canDeploy()) return;

    this.currentStep = 'deploying';
    
    this.deploymentService.deployWarmlyStack(this.config, this.persona()!).subscribe({
      next: (deployed) => {
        this.deployedStack.set(deployed);
        this.currentStep = 'ready';
        
        // Save to deployed AIs list
        this.deployedAIsService.addDeployedAI(deployed);
        
        this.toastService.success('Warmly AI deployed successfully! 🎉');
      },
      error: (error) => {
        console.error('Deployment error:', error);
        this.toastService.error('Deployment failed: ' + error.message);
      }
    });
  }

  retryDeployment() {
    this.currentStep = 'config';
  }

  isPhaseComplete(phaseId: string): boolean {
    const currentPhase = this.deploymentStatus().phase;
    const phases = ['creating', 'deploying', 'health-check', 'configuring', 'ready'];
    const currentIndex = phases.indexOf(currentPhase);
    const phaseIndex = phases.indexOf(phaseId);
    return phaseIndex < currentIndex || currentPhase === 'ready';
  }

  isPhaseActive(phaseId: string): boolean {
    return this.deploymentStatus().phase === phaseId;
  }

  isPhasePending(phaseId: string): boolean {
    const currentPhase = this.deploymentStatus().phase;
    const phases = ['creating', 'deploying', 'health-check', 'configuring', 'ready'];
    const currentIndex = phases.indexOf(currentPhase);
    const phaseIndex = phases.indexOf(phaseId);
    return phaseIndex > currentIndex;
  }

  getPhaseClass(phaseId: string): string {
    if (this.isPhaseComplete(phaseId)) return 'bg-green-50';
    if (this.isPhaseActive(phaseId)) return 'bg-warmly-primary/10';
    return 'bg-gray-50';
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    this.selectedFiles.set([...this.selectedFiles(), ...files]);
  }

  removeFile(index: number) {
    const files = this.selectedFiles();
    files.splice(index, 1);
    this.selectedFiles.set([...files]);
  }

  uploadDocuments() {
    if (!this.deployedStack() || this.selectedFiles().length === 0) return;

    this.isUploading.set(true);

    this.deploymentService.uploadDocuments(
      this.deployedStack()!.urls.apiBackend,
      this.selectedFiles()
    ).subscribe({
      next: (result) => {
        this.toastService.success('Documents uploaded successfully!');
        this.uploadedCount.update(c => c + this.selectedFiles().length);
        this.selectedFiles.set([]);
        this.isUploading.set(false);
      },
      error: (error) => {
        this.toastService.error('Upload failed: ' + error.message);
        this.isUploading.set(false);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success('Copied to clipboard!');
    });
  }

  goToAIManager() {
    this.router.navigate(['/ai-manager']);
  }

  goToConversations() {
    this.router.navigate(['/ai-manager']);
  }

  cancel() {
    this.router.navigate(['/ai-manager']);
  }
}

