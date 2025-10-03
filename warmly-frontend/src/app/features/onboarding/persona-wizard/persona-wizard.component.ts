import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';
import { PersonaService } from '../../../core/services/persona.service';
import { Persona } from '../../../core/models/persona.model';

interface PersonaData {
  // Step 1: Identity
  companyName: string;
  sector: string;
  speakerRole: 'human' | 'brand';
  personaName: string;
  addressForm: string;
  languages: string[];
  
  // Step 2: Tone & Style
  tones: string[];
  emojiLevel: 'none' | 'low' | 'medium' | 'high';
  regionalisms: string;
  favoritePhrases: string[];
  bannedPhrases: string[];
  
  // Step 3: Company Info
  companySummary: string;
  socialProof: string[];
  complianceToggles: {
    lgpdOptout: boolean;
    noTotals: boolean;
    noLinks: boolean;
    askStateForPricing: boolean;
  };
  
  // Step 4: Catalog & Pricing
  mainPriceTable: string;
  regionalPricing: boolean;
  minOrder: number;
  negotiationPolicy: string;
  topProducts: string[];
  
  // Step 5: Conversation Playbook
  openingMessage: string;
  diagnosticQuestions: string[];
  allowImage: boolean;
  allowAudio: boolean;
  objections: Array<{question: string; response: string}>;
  dealTriggers: string[];
  
  // Step 6: Automations
  warmthThreshold: number;
  followupRanges: Array<{min: number; max: number; cadence: number}>;
  quietHours: string;
  rateLimit: string;
  
  // Step 7: Final
  notes: string;
}

@Component({
  selector: 'app-persona-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-warmly-bg via-white to-warmly-bg/50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-2xl font-bold text-warmly-text-primary">Create Your AI Persona</h1>
            <span class="text-sm text-warmly-text-muted">Step {{ currentStep }} of 7</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-warmly h-2 rounded-full transition-all duration-300"
              [style.width.%]="(currentStep / 7) * 100"
            ></div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-3xl shadow-warmly-xl p-8 space-y-6">
          <!-- Step 1: Identity -->
          <div *ngIf="currentStep === 1">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">1. Identity & Basic Info</h2>
            
            <div class="space-y-6">
              <app-input
                label="Company Name"
                placeholder="Acme Corp"
                [(value)]="personaData.companyName"
                [required]="true"
              />
              
              <app-input
                label="Sector/Industry"
                placeholder="E-commerce, SaaS, Consulting..."
                [(value)]="personaData.sector"
              />
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-3">
                  Who is speaking?
                </label>
                <div class="flex gap-4">
                  <label class="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="speakerRole" 
                      value="human"
                      [(ngModel)]="personaData.speakerRole"
                      class="sr-only peer"
                    />
                    <div class="p-4 border-2 rounded-warmly-lg peer-checked:border-warmly-primary peer-checked:bg-warmly-primary/5 transition-all">
                      <p class="font-medium">👤 Human Representative</p>
                      <p class="text-sm text-warmly-text-muted">Ex: Sales rep, Support agent</p>
                    </div>
                  </label>
                  <label class="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="speakerRole" 
                      value="brand"
                      [(ngModel)]="personaData.speakerRole"
                      class="sr-only peer"
                    />
                    <div class="p-4 border-2 rounded-warmly-lg peer-checked:border-warmly-primary peer-checked:bg-warmly-primary/5 transition-all">
                      <p class="font-medium">🏢 Brand Voice</p>
                      <p class="text-sm text-warmly-text-muted">Ex: Company itself</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <app-input
                label="Persona Name"
                placeholder="Maria (Sales), Support Bot..."
                [(value)]="personaData.personaName"
              />
              
              <app-input
                label="Form of Address"
                placeholder="você, tu, senhor(a)..."
                [(value)]="personaData.addressForm"
              />
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Languages (comma separated)
                </label>
                <input
                  type="text"
                  [(ngModel)]="languagesInput"
                  placeholder="Portuguese, English, Spanish"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Tone & Style -->
          <div *ngIf="currentStep === 2">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">2. Tone & Communication Style</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-3">
                  Tone (select all that apply)
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngFor="let tone of availableTones"
                    (click)="toggleTone(tone)"
                    [class]="personaData.tones.includes(tone) 
                      ? 'px-4 py-2 rounded-full bg-warmly-primary text-white' 
                      : 'px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="transition-all"
                  >
                    {{ tone }}
                  </button>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-3">
                  Emoji Level
                </label>
                <div class="grid grid-cols-4 gap-3">
                  <label *ngFor="let level of ['none', 'low', 'medium', 'high']" class="cursor-pointer">
                    <input 
                      type="radio" 
                      name="emojiLevel" 
                      [value]="level"
                      [(ngModel)]="personaData.emojiLevel"
                      class="sr-only peer"
                    />
                    <div class="p-3 border-2 rounded-warmly-lg text-center peer-checked:border-warmly-primary peer-checked:bg-warmly-primary/5">
                      {{ level | titlecase }}
                    </div>
                  </label>
                </div>
              </div>
              
              <app-input
                label="Regionalisms/Slang (optional)"
                placeholder="Use gírias paulistas, sotaque nordestino..."
                [(value)]="personaData.regionalisms"
              />
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Favorite Phrases (one per line)
                </label>
                <textarea
                  [(ngModel)]="favoritePhrasesText"
                  rows="3"
                  placeholder="Como posso ajudar?&#10;Fico à disposição!&#10;Vamos resolver isso juntos"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Banned Phrases (one per line)
                </label>
                <textarea
                  [(ngModel)]="bannedPhrasesText"
                  rows="3"
                  placeholder="problema&#10;complicado&#10;impossível"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 3: Company Info -->
          <div *ngIf="currentStep === 3">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">3. About Your Company</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Company Summary (3-5 sentences)
                </label>
                <textarea
                  [(ngModel)]="personaData.companySummary"
                  rows="5"
                  placeholder="Tell customers what your company does, what makes it special..."
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Social Proof (optional - one per line)
                </label>
                <textarea
                  [(ngModel)]="socialProofText"
                  rows="3"
                  placeholder="+10,000 clientes satisfeitos&#10;Presentes em 5 países&#10;Nota 4.9/5 no TrustPilot"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <div class="space-y-3">
                <h3 class="font-medium text-warmly-text-primary">Compliance & Policies</h3>
                
                <label class="flex items-center gap-3 p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.complianceToggles.lgpdOptout"
                    class="w-5 h-5"
                  />
                  <div>
                    <p class="font-medium">LGPD Opt-out Compliance</p>
                    <p class="text-sm text-warmly-text-muted">Respect opt-out requests</p>
                  </div>
                </label>
                
                <label class="flex items-center gap-3 p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.complianceToggles.noTotals"
                    class="w-5 h-5"
                  />
                  <div>
                    <p class="font-medium">Never Calculate Total Prices</p>
                    <p class="text-sm text-warmly-text-muted">Avoid giving exact totals in chat</p>
                  </div>
                </label>
                
                <label class="flex items-center gap-3 p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.complianceToggles.noLinks"
                    class="w-5 h-5"
                  />
                  <div>
                    <p class="font-medium">No External Links</p>
                    <p class="text-sm text-warmly-text-muted">Don't share external URLs</p>
                  </div>
                </label>
                
                <label class="flex items-center gap-3 p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.complianceToggles.askStateForPricing"
                    class="w-5 h-5"
                  />
                  <div>
                    <p class="font-medium">Ask for State Before Regional Pricing</p>
                    <p class="text-sm text-warmly-text-muted">Required for location-based prices</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 4: Catalog & Pricing -->
          <div *ngIf="currentStep === 4">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">4. Catalog & Pricing</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Main Price Table/Catalog
                </label>
                <div class="border-2 border-dashed border-warmly-border rounded-warmly-lg p-6 text-center">
                  <p class="text-warmly-text-muted mb-2">📄 Upload PDF, CSV, or XLSX</p>
                  <p class="text-xs text-warmly-text-muted mb-4">We'll extract products and prices</p>
                  <input 
                    type="file" 
                    accept=".pdf,.csv,.xlsx,.xls"
                    class="hidden"
                    #fileInput
                  />
                  <app-button variant="secondary" (buttonClick)="fileInput.click()">
                    Choose File
                  </app-button>
                </div>
              </div>
              
              <label class="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  [(ngModel)]="personaData.regionalPricing"
                  class="w-5 h-5"
                />
                <span class="font-medium">Enable Regional Pricing</span>
              </label>
              
              <app-input
                label="Minimum Order Value (optional)"
                type="number"
                placeholder="100"
                [(value)]="minOrderStr"
              />
              
              <app-input
                label="Negotiation Policy"
                placeholder="No discounts, Manager approval required, 10% max discount..."
                [(value)]="personaData.negotiationPolicy"
              />
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Top 5 Products to Highlight (one per line)
                </label>
                <textarea
                  [(ngModel)]="topProductsText"
                  rows="5"
                  placeholder="Product A&#10;Product B&#10;Product C"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 5: Conversation Playbook -->
          <div *ngIf="currentStep === 5">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">5. Conversation Playbook</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Opening Message
                </label>
                <textarea
                  [(ngModel)]="personaData.openingMessage"
                  rows="3"
                  placeholder="Olá! Bem-vindo à [Company]. Como posso ajudar você hoje?"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Top 5 Diagnostic Questions (one per line)
                </label>
                <textarea
                  [(ngModel)]="diagnosticQuestionsText"
                  rows="5"
                  placeholder="O que você está procurando?&#10;Qual é o seu orçamento?&#10;Para quando você precisa?"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <div class="flex gap-6">
                <label class="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.allowImage"
                    class="w-5 h-5"
                  />
                  <span>Allow Image Attachments</span>
                </label>
                
                <label class="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="personaData.allowAudio"
                    class="w-5 h-5"
                  />
                  <span>Allow Audio Messages</span>
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Common Objections & Responses
                </label>
                <div class="space-y-3">
                  <div *ngFor="let obj of personaData.objections; let i = index" class="flex gap-2">
                    <input
                      [(ngModel)]="obj.question"
                      placeholder="Objection: 'Too expensive...'"
                      class="flex-1 px-4 py-2 border rounded-warmly-lg"
                    />
                    <input
                      [(ngModel)]="obj.response"
                      placeholder="Response: 'Let me explain the value...'"
                      class="flex-1 px-4 py-2 border rounded-warmly-lg"
                    />
                    <button 
                      (click)="removeObjection(i)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-warmly-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <app-button variant="ghost" (buttonClick)="addObjection()">
                    + Add Objection
                  </app-button>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Deal Triggers (phrases that indicate buying intent, one per line)
                </label>
                <textarea
                  [(ngModel)]="dealTriggersText"
                  rows="3"
                  placeholder="quero comprar&#10;me envia o boleto&#10;fechar pedido"
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 6: Automations -->
          <div *ngIf="currentStep === 6">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">6. Automations & Follow-ups</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Warmth Threshold (0-100)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="personaData.warmthThreshold"
                  class="w-full"
                />
                <p class="text-sm text-warmly-text-muted mt-1">
                  Current: {{ personaData.warmthThreshold }} - 
                  {{ personaData.warmthThreshold >= 70 ? 'Hot 🔥' : personaData.warmthThreshold >= 40 ? 'Warm 🌡️' : 'Cool ❄️' }}
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-3">
                  Follow-up Rules by Warmth Range
                </label>
                <div class="space-y-3">
                  <div *ngFor="let rule of personaData.followupRanges; let i = index" class="flex gap-2 items-center">
                    <input
                      type="number"
                      [(ngModel)]="rule.min"
                      placeholder="Min"
                      class="w-20 px-3 py-2 border rounded-warmly-lg"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      [(ngModel)]="rule.max"
                      placeholder="Max"
                      class="w-20 px-3 py-2 border rounded-warmly-lg"
                    />
                    <span class="text-sm">→ Follow-up every</span>
                    <input
                      type="number"
                      [(ngModel)]="rule.cadence"
                      placeholder="3"
                      class="w-20 px-3 py-2 border rounded-warmly-lg"
                    />
                    <span class="text-sm">days</span>
                    <button 
                      (click)="removeFollowupRule(i)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-warmly-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <app-button variant="ghost" (buttonClick)="addFollowupRule()">
                    + Add Rule
                  </app-button>
                </div>
              </div>
              
              <app-input
                label="Quiet Hours (e.g., 22:00-08:00)"
                placeholder="22:00-08:00"
                [(value)]="personaData.quietHours"
              />
              
              <app-input
                label="Rate Limit (e.g., max 50 messages/hour)"
                placeholder="50/hour"
                [(value)]="personaData.rateLimit"
              />
            </div>
          </div>

          <!-- Step 7: Final -->
          <div *ngIf="currentStep === 7">
            <h2 class="text-xl font-bold text-warmly-text-primary mb-6">7. Final Touches</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-warmly-text-primary mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  [(ngModel)]="personaData.notes"
                  rows="5"
                  placeholder="Any other instructions or context for your AI persona..."
                  class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
                ></textarea>
              </div>
              
              <!-- Summary -->
              <div class="p-6 bg-warmly-bg rounded-warmly-lg">
                <h3 class="font-bold text-warmly-text-primary mb-4">📋 Summary</h3>
                <div class="space-y-2 text-sm">
                  <p><strong>Company:</strong> {{ personaData.companyName || 'Not set' }}</p>
                  <p><strong>Persona:</strong> {{ personaData.personaName || 'Not set' }}</p>
                  <p><strong>Languages:</strong> {{ personaData.languages.join(', ') || 'Not set' }}</p>
                  <p><strong>Tones:</strong> {{ personaData.tones.join(', ') || 'Not set' }}</p>
                  <p><strong>Warmth Threshold:</strong> {{ personaData.warmthThreshold }}</p>
                </div>
              </div>
              
              <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-warmly-lg text-red-700">
                {{ errorMessage() }}
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center pt-6 border-t">
            <app-button 
              *ngIf="currentStep > 1"
              variant="ghost" 
              (buttonClick)="prevStep()"
            >
              ← Previous
            </app-button>
            
            <div class="flex-1"></div>
            
            <app-button 
              *ngIf="currentStep < 7"
              variant="primary" 
              (buttonClick)="nextStep()"
              [disabled]="!canProceed()"
            >
              Next →
            </app-button>
            
            <app-button 
              *ngIf="currentStep === 7"
              variant="primary" 
              (buttonClick)="finish()"
              [disabled]="isLoading() || !canProceed()"
            >
              {{ isLoading() ? 'Creating...' : '✨ Create My AI Persona' }}
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PersonaWizardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private personaService = inject(PersonaService);

  currentStep = 1;
  isLoading = signal(false);
  errorMessage = signal('');

  // Helper inputs
  languagesInput = 'Portuguese';
  favoritePhrasesText = '';
  bannedPhrasesText = '';
  socialProofText = '';
  topProductsText = '';
  diagnosticQuestionsText = '';
  dealTriggersText = '';
  minOrderStr = '';

  availableTones = [
    'Friendly', 'Professional', 'Consultative', 
    'Direct', 'Premium', 'Technical', 'Casual'
  ];

  personaData: PersonaData = {
    companyName: '',
    sector: '',
    speakerRole: 'human',
    personaName: '',
    addressForm: 'você',
    languages: ['Portuguese'],
    tones: [],
    emojiLevel: 'low',
    regionalisms: '',
    favoritePhrases: [],
    bannedPhrases: [],
    companySummary: '',
    socialProof: [],
    complianceToggles: {
      lgpdOptout: true,
      noTotals: false,
      noLinks: false,
      askStateForPricing: false
    },
    mainPriceTable: '',
    regionalPricing: false,
    minOrder: 0,
    negotiationPolicy: '',
    topProducts: [],
    openingMessage: '',
    diagnosticQuestions: [],
    allowImage: true,
    allowAudio: true,
    objections: [],
    dealTriggers: [],
    warmthThreshold: 60,
    followupRanges: [
      { min: 70, max: 100, cadence: 1 },
      { min: 40, max: 69, cadence: 3 },
      { min: 0, max: 39, cadence: 7 }
    ],
    quietHours: '22:00-08:00',
    rateLimit: '50/hour',
    notes: ''
  };

  ngOnInit() {
    // Check if user already has a persona
    if (this.personaService.hasPersona()) {
      this.router.navigate(['/whatsapp']);
    }
    
    // Load draft if exists
    const draft = this.personaService.loadWizardDraft();
    if (draft && draft.currentStep) {
      this.currentStep = draft.currentStep;
      // Load draft data into form
    }
  }

  nextStep() {
    if (this.canProceed()) {
      this.syncTextFields();
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.personaData.companyName && !!this.personaData.personaName;
      case 2:
        return this.personaData.tones.length > 0;
      case 3:
        return !!this.personaData.companySummary;
      default:
        return true;
    }
  }

  toggleTone(tone: string) {
    const idx = this.personaData.tones.indexOf(tone);
    if (idx > -1) {
      this.personaData.tones.splice(idx, 1);
    } else {
      this.personaData.tones.push(tone);
    }
  }

  addObjection() {
    this.personaData.objections.push({ question: '', response: '' });
  }

  removeObjection(index: number) {
    this.personaData.objections.splice(index, 1);
  }

  addFollowupRule() {
    this.personaData.followupRanges.push({ min: 0, max: 100, cadence: 3 });
  }

  removeFollowupRule(index: number) {
    this.personaData.followupRanges.splice(index, 1);
  }

  syncTextFields() {
    this.personaData.languages = this.languagesInput.split(',').map(l => l.trim()).filter(l => l);
    this.personaData.favoritePhrases = this.favoritePhrasesText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.bannedPhrases = this.bannedPhrasesText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.socialProof = this.socialProofText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.topProducts = this.topProductsText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.diagnosticQuestions = this.diagnosticQuestionsText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.dealTriggers = this.dealTriggersText.split('\n').map(l => l.trim()).filter(l => l);
    this.personaData.minOrder = parseInt(this.minOrderStr) || 0;
  }

  async finish() {
    this.syncTextFields();
    this.isLoading.set(true);
    this.errorMessage.set('');

    const user = this.authService.currentUser();
    if (!user) {
      this.errorMessage.set('Not authenticated');
      this.isLoading.set(false);
      return;
    }

    // Convert PersonaData to Persona model
    const persona: Persona = {
      userId: user.uid,
      name: this.personaData.personaName,
      speakerRole: this.personaData.speakerRole,
      company: this.personaData.companyName,
      industry: this.personaData.sector,
      languages: this.personaData.languages,
      addressForm: this.personaData.addressForm,
      tone: this.personaData.tones,
      emojiLevel: this.personaData.emojiLevel,
      regionalisms: this.personaData.regionalisms,
      favoritePhrases: this.personaData.favoritePhrases,
      bannedPhrases: this.personaData.bannedPhrases,
      summary: this.personaData.companySummary,
      socialProof: this.personaData.socialProof,
      compliance: {
        lgpdOptout: this.personaData.complianceToggles.lgpdOptout ? ['opt-out'] : [],
        allowLinks: !this.personaData.complianceToggles.noLinks,
        noTotals: this.personaData.complianceToggles.noTotals,
        regionalPricing: this.personaData.regionalPricing
      },
      pricing: {
        minOrder: this.personaData.minOrder,
        negotiationPolicy: this.personaData.negotiationPolicy
      },
      topProducts: this.personaData.topProducts,
      conversation: {
        opening: this.personaData.openingMessage,
        diagnostics: this.personaData.diagnosticQuestions,
        allowImage: this.personaData.allowImage,
        allowAudio: this.personaData.allowAudio,
        objections: this.personaData.objections.map(o => ({ name: o.question, reply: o.response })),
        dealTriggers: this.personaData.dealTriggers,
        handoffOrder: []
      },
      automation: {
        warmthThreshold: this.personaData.warmthThreshold,
        followups: this.personaData.followupRanges.map(r => ({
          warmthMin: r.min,
          warmthMax: r.max,
          cadenceDays: r.cadence,
          template: ''
        })),
        quietHours: this.personaData.quietHours,
        rateLimit: this.personaData.rateLimit
      },
      createdAt: new Date()
    };

    // Compile persona to system prompt
    const compiled = this.personaService.compilePersona(persona);
    persona.compiled = compiled;

    // Save persona
    this.personaService.savePersona(persona).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.personaService.clearWizardDraft();
        // Redirect to WhatsApp connection
        this.router.navigate(['/whatsapp']);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to create persona: ' + (error?.message || 'Unknown error'));
      }
    });
  }
}

