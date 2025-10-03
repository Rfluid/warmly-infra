import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, catchError } from 'rxjs';
import { Persona, PersonaWizardData } from '../models/persona.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  currentPersona = signal<Persona | null>(null);
  wizardData = signal<PersonaWizardData>({});

  private readonly STORAGE_KEY = 'warmly_persona';
  private readonly WIZARD_KEY = 'warmly_wizard_draft';

  constructor() {
    this.loadFromStorage();
  }

  // Check if user has a persona
  hasPersona(): boolean {
    return this.currentPersona() !== null;
  }

  // Load persona from local storage (simulating backend for now)
  loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.currentPersona.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored persona:', e);
      }
    }
  }

  // Save persona
  savePersona(persona: Persona): Observable<Persona> {
    const user = this.authService.currentUser();
    if (!user) {
      return of(persona);
    }

    const fullPersona: Persona = {
      ...persona,
      userId: user.uid,
      updatedAt: new Date()
    };

    // For now, save to localStorage (in production, this would be an API call)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fullPersona));
    this.currentPersona.set(fullPersona);

    return of(fullPersona);
  }

  // Get persona by user ID
  getPersona(): Observable<Persona | null> {
    return of(this.currentPersona());
  }

  // Update persona
  updatePersona(updates: Partial<Persona>): Observable<Persona> {
    const current = this.currentPersona();
    if (!current) {
      throw new Error('No persona to update');
    }

    const updated: Persona = {
      ...current,
      ...updates,
      updatedAt: new Date()
    };

    return this.savePersona(updated);
  }

  // Wizard draft management
  saveWizardDraft(data: PersonaWizardData): void {
    localStorage.setItem(this.WIZARD_KEY, JSON.stringify(data));
    this.wizardData.set(data);
  }

  loadWizardDraft(): PersonaWizardData {
    const stored = localStorage.getItem(this.WIZARD_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.wizardData.set(data);
        return data;
      } catch (e) {
        console.error('Failed to parse wizard draft:', e);
      }
    }
    return {};
  }

  clearWizardDraft(): void {
    localStorage.removeItem(this.WIZARD_KEY);
    this.wizardData.set({});
  }

  // Compile persona data to system prompt
  compilePersona(persona: Partial<Persona>): { yaml: string; systemPrompt: string } {
    // Generate YAML representation
    const yaml = this.generateYAML(persona);
    
    // Generate system prompt
    const systemPrompt = this.generateSystemPrompt(persona);

    return { yaml, systemPrompt };
  }

  private generateYAML(persona: Partial<Persona>): string {
    return `# Warmly AI Persona Configuration
name: ${persona.name || 'Unnamed'}
company: ${persona.company || 'Unknown'}
industry: ${persona.industry || 'General'}
speaker_role: ${persona.speakerRole || 'human'}
languages: ${(persona.languages || []).join(', ')}

tone: ${(persona.tone || []).join(', ')}
emoji_level: ${persona.emojiLevel || 'medium'}

summary: |
  ${persona.summary || 'No summary provided'}

conversation:
  opening: |
    ${persona.conversation?.opening || 'Hello! How can I help you?'}
  
automation:
  warmth_threshold: ${persona.automation?.warmthThreshold || 50}
`;
  }

  private generateSystemPrompt(persona: Partial<Persona>): string {
    const parts: string[] = [];

    // Identity
    parts.push(`You are ${persona.name || 'an AI assistant'} representing ${persona.company || 'our company'}.`);
    
    if (persona.speakerRole === 'brand') {
      parts.push('You speak as the brand itself, using "we" and "our".');
    } else {
      parts.push('You speak as a human representative of the brand.');
    }

    // Tone
    if (persona.tone && persona.tone.length > 0) {
      parts.push(`Your tone is: ${persona.tone.join(', ')}.`);
    }

    // Company info
    if (persona.summary) {
      parts.push(`\nAbout the company: ${persona.summary}`);
    }

    // Conversation rules
    if (persona.conversation) {
      if (persona.conversation.opening) {
        parts.push(`\nDefault greeting: "${persona.conversation.opening}"`);
      }
      
      if (persona.conversation.diagnostics && persona.conversation.diagnostics.length > 0) {
        parts.push(`\nKey diagnostic questions to ask:\n${persona.conversation.diagnostics.map((q, i) => `${i + 1}. ${q}`).join('\n')}`);
      }
    }

    // Compliance
    if (persona.compliance) {
      if (persona.compliance.noTotals) {
        parts.push('\n⚠️ NEVER calculate total prices. Always ask the customer to contact sales for final pricing.');
      }
      if (!persona.compliance.allowLinks) {
        parts.push('⚠️ Do not share external links.');
      }
    }

    return parts.join('\n');
  }

  // AI-powered persona name suggestions
  suggestPersonaNames(wizardData: PersonaWizardData): Observable<string[]> {
    // In production, this would call an AI service
    // For now, generate some contextual suggestions
    const suggestions: string[] = [];
    
    const base = wizardData.company || 'Assistant';
    suggestions.push(`${base} Helper`);
    suggestions.push(`${base} Expert`);
    suggestions.push(`${base} Concierge`);
    suggestions.push(`${base} Guide`);
    suggestions.push(`${base} Specialist`);

    return of(suggestions);
  }
}

