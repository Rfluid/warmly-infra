import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { WarmlyApiService } from '../../core/services/warmly-api.service';

@Component({
  selector: 'app-ai-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">AI Manager</h1>
          <p class="text-warmly-text-muted mt-1">Configure your AI persona and knowledge base</p>
        </div>
      </div>

      <!-- Persona Card -->
      <app-card variant="elevated" title="Persona Configuration">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <app-input 
              label="Company Name" 
              placeholder="Enter company name"
              [(ngModel)]="personaConfig.companyName"
            />
            <app-input 
              label="Persona Name" 
              placeholder="e.g., Sales Assistant"
              [(ngModel)]="personaConfig.personaName"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <app-input 
              label="Role" 
              placeholder="Sales Representative"
              [(ngModel)]="personaConfig.role"
            />
            <app-input 
              label="Language" 
              placeholder="Portuguese, English"
              [(ngModel)]="personaConfig.language"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-warmly-text-primary mb-2">Tone & Style</label>
            <div class="flex flex-wrap gap-2">
              <button 
                *ngFor="let tone of toneOptions" 
                (click)="toggleTone(tone)"
                [class]="getToneClasses(tone)"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                {{ tone }}
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <app-button variant="primary" (buttonClick)="savePersona()">
              Save Configuration
            </app-button>
            <app-button variant="secondary">
              View Compiled Prompt
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Knowledge Base Card -->
      <app-card variant="elevated" title="Knowledge Base">
        <div class="space-y-4">
          <p class="text-sm text-warmly-text-muted">
            Upload documents to enhance the AI's knowledge about your products and services.
          </p>

          <div class="border-2 border-dashed border-warmly-border rounded-warmly-lg p-8 text-center hover:border-warmly-primary transition-colors cursor-pointer"
               (click)="fileInput.click()"
               (drop)="onDrop($event)"
               (dragover)="onDragOver($event)">
            <svg class="mx-auto h-12 w-12 text-warmly-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="mt-2 text-sm text-warmly-text-muted">
              Click to upload or drag and drop
            </p>
            <p class="text-xs text-warmly-text-muted mt-1">
              PDF, CSV, TXT, JSON (max 10MB)
            </p>
          </div>

          <input 
            #fileInput
            type="file" 
            class="hidden" 
            multiple
            accept=".pdf,.csv,.txt,.json"
            (change)="onFileSelect($event)"
          />

          <!-- Uploaded Files -->
          <div *ngIf="uploadedFiles().length > 0" class="space-y-2">
            <h4 class="font-medium text-warmly-text-primary">Uploaded Documents</h4>
            <div class="space-y-2">
              <div *ngFor="let file of uploadedFiles()" class="flex items-center justify-between p-3 bg-warmly-bg rounded-warmly-md">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-warmly-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium">{{ file.name }}</p>
                    <p class="text-xs text-warmly-text-muted">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button class="text-warmly-danger hover:text-warmly-danger/80">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <app-button 
            variant="primary" 
            [disabled]="selectedFiles().length === 0"
            [loading]="uploading()"
            (buttonClick)="uploadFiles()"
          >
            Upload Documents
          </app-button>
        </div>
      </app-card>

      <!-- Tools & Policies Card -->
      <app-card variant="elevated" title="Tools & Policies">
        <div class="space-y-4">
          <div *ngFor="let policy of policies" class="flex items-center justify-between p-4 bg-warmly-bg rounded-warmly-md">
            <div>
              <p class="font-medium text-warmly-text-primary">{{ policy.label }}</p>
              <p class="text-sm text-warmly-text-muted">{{ policy.description }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="policy.enabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
            </label>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class AIManagerComponent {
  private apiService = inject(WarmlyApiService);

  personaConfig = {
    companyName: '',
    personaName: '',
    role: '',
    language: 'Portuguese, English'
  };

  toneOptions = ['Friendly', 'Professional', 'Consultative', 'Technical', 'Premium'];
  selectedTones = signal<string[]>([]);
  
  selectedFiles = signal<File[]>([]);
  uploadedFiles = signal<File[]>([]);
  uploading = signal(false);

  policies = [
    { label: 'Ask for State Before Regional Pricing', description: 'Require location before providing regional prices', enabled: true },
    { label: 'No Total Calculations', description: 'Avoid calculating total prices in conversations', enabled: false },
    { label: 'No External Links', description: 'Prevent sharing external URLs', enabled: true },
    { label: 'Require Approval for Discounts', description: 'Ask human approval before offering discounts', enabled: true }
  ];

  toggleTone(tone: string): void {
    const tones = this.selectedTones();
    const index = tones.indexOf(tone);
    if (index >= 0) {
      this.selectedTones.set(tones.filter(t => t !== tone));
    } else {
      this.selectedTones.set([...tones, tone]);
    }
  }

  getToneClasses(tone: string): string {
    const isSelected = this.selectedTones().includes(tone);
    return isSelected 
      ? 'bg-warmly-primary text-white'
      : 'bg-white border border-warmly-border text-warmly-text-primary hover:border-warmly-primary';
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.set(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      this.selectedFiles.set(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  uploadFiles(): void {
    if (this.selectedFiles().length === 0) return;
    
    this.uploading.set(true);
    this.apiService.uploadDocuments(this.selectedFiles()).subscribe({
      next: () => {
        this.uploadedFiles.set([...this.uploadedFiles(), ...this.selectedFiles()]);
        this.selectedFiles.set([]);
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Error uploading files:', err);
        this.uploading.set(false);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  savePersona(): void {
    console.log('Saving persona configuration:', this.personaConfig, this.selectedTones());
    // Implement save logic
  }
}

