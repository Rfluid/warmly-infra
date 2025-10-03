import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PersonaService } from '../../core/services/persona.service';
import { Persona } from '../../core/models/persona.model';
import { ToastService } from '../../core/services/toast.service';
import { DeployedAIsService } from '../../core/services/deployed-ais.service';
import { DeployedStack } from '../../core/services/warmly-deployment.service';

@Component({
  selector: 'app-ai-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">AI Manager</h1>
          <p class="text-warmly-text-secondary mt-1">Manage your AI instances and persona</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="primary" (buttonClick)="createWarmlyAI()"
            >🚀 Deploy New AI</app-button
          >
          <app-button variant="secondary" (buttonClick)="editPersona()">Edit Persona</app-button>
        </div>
      </div>

      <!-- Deployed AIs -->
      <div *ngIf="deployedAIs().length > 0">
        <h2 class="text-2xl font-bold text-warmly-text-primary mb-4">Your AI Instances</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let ai of deployedAIs()"
            class="bg-white rounded-warmly-xl shadow-warmly-lg p-6 hover:shadow-warmly-xl transition-shadow"
          >
            <!-- AI Card -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-warmly-text-primary">{{ ai.stackName }}</h3>
                <p class="text-sm text-warmly-text-muted">{{ ai.clientId }}</p>
              </div>
              <div
                class="w-12 h-12 rounded-full bg-gradient-warmly flex items-center justify-center text-2xl"
              >
                🤖
              </div>
            </div>

            <!-- Status -->
            <div class="mb-4">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm"
                [class]="
                  ai.status === 'ready'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                "
              >
                {{ ai.status === 'ready' ? '✓ Active' : '⏳ ' + ai.status }}
              </span>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-2">
              <app-button variant="secondary" class="w-full" (buttonClick)="openWAHADashboard(ai)">
                📱 WAHA Dashboard
              </app-button>

              <app-button variant="ghost" class="w-full" (buttonClick)="openStreamlit(ai)">
                💬 Test Chat
              </app-button>

              <div class="flex gap-2">
                <app-button variant="ghost" size="sm" class="flex-1" (buttonClick)="copyAPIUrl(ai)">
                  📋 Copy API
                </app-button>
                <app-button
                  variant="ghost"
                  size="sm"
                  class="flex-1 text-red-600 hover:bg-red-50"
                  (buttonClick)="deleteAI(ai)"
                >
                  🗑️ Delete
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No AIs Deployed -->
      <div *ngIf="deployedAIs().length === 0" class="text-center py-12">
        <div
          class="w-20 h-20 mx-auto mb-4 rounded-full bg-warmly-bg flex items-center justify-center"
        >
          <span class="text-4xl">🚀</span>
        </div>
        <h3 class="text-xl font-semibold text-warmly-text-primary mb-2">No AI Instances Yet</h3>
        <p class="text-warmly-text-secondary mb-4">Deploy your first Warmly AI to get started</p>
        <app-button variant="primary" (buttonClick)="createWarmlyAI()">🚀 Deploy AI</app-button>
      </div>

      <!-- No Persona -->
      <div *ngIf="!persona()" class="text-center py-12">
        <div
          class="w-20 h-20 mx-auto mb-4 rounded-full bg-warmly-bg flex items-center justify-center"
        >
          <span class="text-4xl">🤖</span>
        </div>
        <h3 class="text-xl font-semibold text-warmly-text-primary mb-2">No AI Persona Found</h3>
        <p class="text-warmly-text-secondary mb-4">Create your AI persona to get started</p>
        <app-button variant="primary" (buttonClick)="recreatePersona()">Create Persona</app-button>
      </div>

      <!-- Persona Overview -->
      <div *ngIf="persona()" class="">
        <!-- Identity Card -->
        <app-card title="Identity & Basic Info" variant="elevated">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-warmly-text-muted">Persona Name</p>
              <p class="font-semibold text-warmly-text-primary">{{ persona()?.name }}</p>
            </div>
            <div>
              <p class="text-sm text-warmly-text-muted">Company</p>
              <p class="font-semibold text-warmly-text-primary">{{ persona()?.company }}</p>
            </div>
            <div>
              <p class="text-sm text-warmly-text-muted">Industry</p>
              <p class="font-semibold text-warmly-text-primary">{{ persona()?.industry }}</p>
            </div>
            <div>
              <p class="text-sm text-warmly-text-muted">Speaker Role</p>
              <p class="font-semibold text-warmly-text-primary">
                {{ persona()?.speakerRole === 'human' ? 'Human Representative' : 'Brand Voice' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-warmly-text-muted">Languages</p>
              <p class="font-semibold text-warmly-text-primary">
                {{ persona()?.languages?.join(', ') }}
              </p>
            </div>
            <div>
              <p class="text-sm text-warmly-text-muted">Emoji Level</p>
              <p class="font-semibold text-warmly-text-primary">{{ persona()?.emojiLevel }}</p>
            </div>
          </div>
        </app-card>

        <!-- Tone & Style -->
        <app-card title="Tone & Communication Style" variant="elevated">
          <div class="space-y-3">
            <div>
              <p class="text-sm text-warmly-text-muted mb-2">Tone Attributes</p>
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let tone of persona()?.tone"
                  class="px-3 py-1 bg-warmly-primary/10 text-warmly-primary rounded-full text-sm"
                >
                  {{ tone }}
                </span>
              </div>
            </div>

            <div *ngIf="persona()?.favoritePhrases && persona()!.favoritePhrases!.length > 0">
              <p class="text-sm text-warmly-text-muted mb-2">Favorite Phrases</p>
              <ul class="list-disc list-inside text-sm">
                <li *ngFor="let phrase of persona()?.favoritePhrases">{{ phrase }}</li>
              </ul>
            </div>
          </div>
        </app-card>

        <!-- Company Info -->
        <app-card title="About the Company" variant="elevated">
          <p class="text-warmly-text-secondary">{{ persona()?.summary }}</p>

          <div *ngIf="persona()?.socialProof && persona()!.socialProof!.length > 0" class="mt-4">
            <p class="text-sm font-medium text-warmly-text-muted mb-2">Social Proof</p>
            <ul class="list-disc list-inside text-sm space-y-1">
              <li *ngFor="let proof of persona()?.socialProof" class="text-warmly-text-secondary">
                {{ proof }}
              </li>
            </ul>
          </div>
        </app-card>

        <!-- Conversation Playbook -->
        <app-card title="Conversation Playbook" variant="elevated">
          <div class="space-y-4">
            <div>
              <p class="text-sm text-warmly-text-muted mb-2">Opening Message</p>
              <p class="p-3 bg-warmly-bg rounded-warmly-lg text-sm">
                {{ persona()?.conversation?.opening }}
              </p>
            </div>

            <div
              *ngIf="
                persona()?.conversation?.diagnostics &&
                persona()!.conversation!.diagnostics.length > 0
              "
            >
              <p class="text-sm text-warmly-text-muted mb-2">Diagnostic Questions</p>
              <ul class="list-decimal list-inside text-sm space-y-1">
                <li *ngFor="let q of persona()?.conversation?.diagnostics">{{ q }}</li>
              </ul>
            </div>

            <div class="flex gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span
                  [class]="persona()?.conversation?.allowImage ? 'text-green-600' : 'text-red-600'"
                >
                  {{ persona()?.conversation?.allowImage ? '✓' : '✗' }}
                </span>
                <span>Images</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  [class]="persona()?.conversation?.allowAudio ? 'text-green-600' : 'text-red-600'"
                >
                  {{ persona()?.conversation?.allowAudio ? '✓' : '✗' }}
                </span>
                <span>Audio</span>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Automation Settings -->
        <app-card title="Automation Settings" variant="elevated">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-warmly-text-muted">Warmth Threshold</p>
              <p class="font-semibold text-warmly-text-primary">
                {{ persona()?.automation?.warmthThreshold }}
              </p>
            </div>
            <div *ngIf="persona()?.automation?.quietHours">
              <p class="text-sm text-warmly-text-muted">Quiet Hours</p>
              <p class="font-semibold text-warmly-text-primary">
                {{ persona()?.automation?.quietHours }}
              </p>
            </div>
            <div *ngIf="persona()?.automation?.rateLimit">
              <p class="text-sm text-warmly-text-muted">Rate Limit</p>
              <p class="font-semibold text-warmly-text-primary">
                {{ persona()?.automation?.rateLimit }}
              </p>
            </div>
          </div>
        </app-card>

        <!-- System Prompt -->
        <app-card title="Compiled System Prompt" variant="elevated">
          <div class="relative">
            <pre class="p-4 bg-warmly-bg rounded-warmly-lg text-sm overflow-x-auto">{{
              persona()?.compiled?.systemPrompt || 'Not generated yet'
            }}</pre>
            <app-button
              variant="ghost"
              size="sm"
              (buttonClick)="copySystemPrompt()"
              class="absolute top-2 right-2"
            >
              📋 Copy
            </app-button>
          </div>
        </app-card>

        <!-- Knowledge Base (Placeholder) -->
        <app-card title="Knowledge Base & Files" variant="elevated">
          <div class="text-center py-8 text-warmly-text-muted">
            <p class="mb-4">📄 Upload documents, PDFs, and price lists</p>
            <app-button variant="secondary">Upload Files</app-button>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [],
})
export class AIManagerComponent implements OnInit {
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private deployedAIsService = inject(DeployedAIsService);

  persona = signal<Persona | null>(null);
  deployedAIs = this.deployedAIsService.deployedAIs;

  ngOnInit() {
    this.loadPersona();
  }

  loadPersona() {
    this.personaService.getPersona().subscribe({
      next: (persona) => {
        this.persona.set(persona);
      },
    });
  }

  editPersona() {
    // Navigate to persona wizard in edit mode
    this.router.navigate(['/onboarding/persona']);
  }

  recreatePersona() {
    if (this.persona()) {
      if (confirm('This will reset your current persona. Continue?')) {
        this.router.navigate(['/onboarding/persona']);
      }
    } else {
      this.router.navigate(['/onboarding/persona']);
    }
  }

  copySystemPrompt() {
    const prompt = this.persona()?.compiled?.systemPrompt || '';
    navigator.clipboard.writeText(prompt).then(() => {
      this.toastService.success('System prompt copied to clipboard');
    });
  }

  createWarmlyAI() {
    this.router.navigate(['/ai-manager/create']);
  }

  openWAHADashboard(ai: DeployedStack) {
    window.open(ai.urls.wahaDashboard, '_blank');
  }

  openStreamlit(ai: DeployedStack) {
    window.open(ai.urls.streamlitFrontend, '_blank');
  }

  copyAPIUrl(ai: DeployedStack) {
    navigator.clipboard.writeText(ai.urls.apiBackend).then(() => {
      this.toastService.success('API URL copied to clipboard');
    });
  }

  deleteAI(ai: DeployedStack) {
    if (
      confirm(
        `Are you sure you want to delete AI instance "${ai.stackName}"? This will only remove it from the list, not delete the actual stack.`,
      )
    ) {
      this.deployedAIsService.removeDeployedAI(ai.clientId, ai.stackName);
      this.toastService.success('AI instance removed from list');
    }
  }
}
