import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead, TagDef, LeadActivity } from '../models/lead.model';
import { AuthService } from './auth.service';

export interface LeadFilters {
  warmth_min?: number;
  warmth_max?: number;
  tags?: Record<string, any>;
  status?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.apiUrl;

  leads = signal<Lead[]>([]);
  tagDefs = signal<TagDef[]>([]);

  private readonly LEADS_STORAGE_KEY = 'warmly_leads';
  private readonly TAGS_STORAGE_KEY = 'warmly_tag_defs';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedLeads = localStorage.getItem(this.LEADS_STORAGE_KEY);
    const storedTags = localStorage.getItem(this.TAGS_STORAGE_KEY);
    
    if (storedLeads) {
      try {
        this.leads.set(JSON.parse(storedLeads));
      } catch (e) {
        console.error('Failed to parse stored leads:', e);
        this.initializeSampleData();
      }
    } else {
      this.initializeSampleData();
    }

    if (storedTags) {
      try {
        this.tagDefs.set(JSON.parse(storedTags));
      } catch (e) {
        console.error('Failed to parse stored tags:', e);
        this.initializeSampleTags();
      }
    } else {
      this.initializeSampleTags();
    }
  }

  private initializeSampleData(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const sampleLeads: Lead[] = [
      {
        id: '1',
        userId: user.uid,
        name: 'João Silva',
        phone: '11987654321',
        email: 'joao@example.com',
        warmth: 75,
        status: 'active',
        tags: {
          interest: 'high',
          product: 'Premium Plan',
          budget: '10000-50000'
        },
        lastMsgAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        userId: user.uid,
        name: 'Maria Santos',
        phone: '11976543210',
        warmth: 45,
        status: 'waiting-contact',
        tags: {
          interest: 'medium',
          product: 'Basic Plan'
        },
        lastMsgAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        userId: user.uid,
        name: 'Pedro Costa',
        phone: '11965432109',
        email: 'pedro@example.com',
        warmth: 90,
        status: 'won',
        tags: {
          interest: 'high',
          product: 'Enterprise Plan',
          budget: '50000+'
        },
        lastBuyAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    this.leads.set(sampleLeads);
    this.saveToStorage();
  }

  private initializeSampleTags(): void {
    const sampleTags: TagDef[] = [
      {
        id: 'interest',
        name: 'Interest Level',
        description: 'Customer interest level',
        type: 'select',
        options: ['low', 'medium', 'high']
      },
      {
        id: 'product',
        name: 'Product Interest',
        description: 'Which product they are interested in',
        type: 'select',
        options: ['Basic Plan', 'Premium Plan', 'Enterprise Plan']
      },
      {
        id: 'budget',
        name: 'Budget Range',
        description: 'Estimated budget',
        type: 'select',
        options: ['<10000', '10000-50000', '50000+']
      },
      {
        id: 'notes',
        name: 'Notes',
        description: 'Additional notes',
        type: 'text'
      }
    ];

    this.tagDefs.set(sampleTags);
    this.saveTagsToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.LEADS_STORAGE_KEY, JSON.stringify(this.leads()));
  }

  private saveTagsToStorage(): void {
    localStorage.setItem(this.TAGS_STORAGE_KEY, JSON.stringify(this.tagDefs()));
  }

  getLeads(filters?: LeadFilters): Observable<Lead[]> {
    let filtered = [...this.leads()];

    if (filters) {
      if (filters.warmth_min !== undefined) {
        filtered = filtered.filter(l => l.warmth >= filters.warmth_min!);
      }
      if (filters.warmth_max !== undefined) {
        filtered = filtered.filter(l => l.warmth <= filters.warmth_max!);
      }
      if (filters.status) {
        filtered = filtered.filter(l => l.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(l => 
          l.name.toLowerCase().includes(search) ||
          l.phone.includes(search) ||
          (l.email && l.email.toLowerCase().includes(search))
        );
      }
    }

    return of(filtered);
  }

  getLead(id: string): Observable<Lead | undefined> {
    const lead = this.leads().find(l => l.id === id);
    return of(lead);
  }

  createLead(data: Partial<Lead>): Observable<Lead> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Not authenticated');

    const newLead: Lead = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      name: data.name || 'Unknown',
      phone: data.phone || '',
      email: data.email,
      warmth: data.warmth || 50,
      status: data.status || 'active',
      tags: data.tags || {},
      createdAt: new Date()
    };

    this.leads.update(leads => [...leads, newLead]);
    this.saveToStorage();
    return of(newLead);
  }

  updateLead(id: string, data: Partial<Lead>): Observable<Lead> {
    const leads = this.leads();
    const index = leads.findIndex(l => l.id === id);
    
    if (index === -1) throw new Error('Lead not found');

    const updated = {
      ...leads[index],
      ...data,
      updatedAt: new Date()
    };

    this.leads.update(leads => {
      const newLeads = [...leads];
      newLeads[index] = updated;
      return newLeads;
    });
    
    this.saveToStorage();
    return of(updated);
  }

  deleteLead(id: string): Observable<boolean> {
    this.leads.update(leads => leads.filter(l => l.id !== id));
    this.saveToStorage();
    return of(true);
  }

  // Tag Definitions
  getTagDefs(): Observable<TagDef[]> {
    return of(this.tagDefs());
  }

  createTagDef(tag: Partial<TagDef>): Observable<TagDef> {
    const newTag: TagDef = {
      id: Math.random().toString(36).substring(7),
      name: tag.name || 'New Tag',
      description: tag.description || '',
      type: tag.type || 'text',
      options: tag.options,
      createdAt: new Date()
    };

    this.tagDefs.update(tags => [...tags, newTag]);
    this.saveTagsToStorage();
    return of(newTag);
  }

  updateTagDef(id: string, data: Partial<TagDef>): Observable<TagDef> {
    const tags = this.tagDefs();
    const index = tags.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Tag not found');

    const updated = { ...tags[index], ...data };

    this.tagDefs.update(tags => {
      const newTags = [...tags];
      newTags[index] = updated;
      return newTags;
    });
    
    this.saveTagsToStorage();
    return of(updated);
  }

  deleteTagDef(id: string): Observable<boolean> {
    this.tagDefs.update(tags => tags.filter(t => t.id !== id));
    this.saveTagsToStorage();
    return of(true);
  }

  // Bulk operations
  bulkUpdateTags(leadIds: string[], tags: Record<string, any>): Observable<boolean> {
    this.leads.update(leads => 
      leads.map(lead => 
        leadIds.includes(lead.id!) 
          ? { ...lead, tags: { ...lead.tags, ...tags }, updatedAt: new Date() }
          : lead
      )
    );
    this.saveToStorage();
    return of(true);
  }

  bulkDelete(leadIds: string[]): Observable<boolean> {
    this.leads.update(leads => leads.filter(l => !leadIds.includes(l.id!)));
    this.saveToStorage();
    return of(true);
  }

  // Export/Import
  exportToCSV(): string {
    const leads = this.leads();
    const headers = ['Name', 'Phone', 'Email', 'Warmth', 'Status', 'Tags'];
    
    const rows = leads.map(lead => [
      lead.name,
      lead.phone,
      lead.email || '',
      lead.warmth.toString(),
      lead.status,
      JSON.stringify(lead.tags)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
}


