import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  warmth: number;
  tags: string[];
  lastActivity: string;
  avatar: string;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, WarmthBadgeComponent],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">Leads</h1>
          <p class="text-warmly-text-muted mt-1">Manage and track all your leads</p>
        </div>
        <div class="flex gap-3">
          <app-button variant="secondary">Import CSV</app-button>
          <app-button variant="primary">Add Lead</app-button>
        </div>
      </div>

      <app-card variant="elevated">
        <!-- Filters -->
        <div class="flex gap-3 mb-6">
          <input 
            type="text"
            placeholder="Search leads..."
            class="flex-1 px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
            [(ngModel)]="searchQuery"
          />
          <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
            <option>All Tags</option>
            <option>High Priority</option>
            <option>Follow Up</option>
          </select>
          <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
            <option>All Warmth</option>
            <option>Hot (70+)</option>
            <option>Warm (40-69)</option>
            <option>Cool (0-39)</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-warmly-border">
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Name</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Email</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Company</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Warmth</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Tags</th>
                <th class="text-left py-3 px-4 font-semibold text-warmly-text-primary">Last Activity</th>
                <th class="text-right py-3 px-4 font-semibold text-warmly-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lead of filteredLeads()" class="border-b border-warmly-border hover:bg-warmly-bg transition-colors">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <img [src]="lead.avatar" [alt]="lead.name" class="w-8 h-8 rounded-full"/>
                    <span class="font-medium">{{ lead.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-warmly-text-muted">{{ lead.email }}</td>
                <td class="py-4 px-4">{{ lead.company }}</td>
                <td class="py-4 px-4">
                  <app-warmth-badge [score]="lead.warmth" />
                </td>
                <td class="py-4 px-4">
                  <div class="flex gap-1">
                    <span *ngFor="let tag of lead.tags" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {{ tag }}
                    </span>
                  </div>
                </td>
                <td class="py-4 px-4 text-warmly-text-muted text-sm">{{ lead.lastActivity }}</td>
                <td class="py-4 px-4 text-right">
                  <button class="text-warmly-primary hover:text-warmly-primary/80">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class LeadsComponent {
  searchQuery = '';
  
  leads: Lead[] = [
    { id: 1, name: 'Sarah Chen', email: 'sarah@company.com', company: 'TechCorp', warmth: 75, tags: ['Enterprise', 'Hot Lead'], lastActivity: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Marcus Rodriguez', email: 'marcus@startup.io', company: 'Startup Inc', warmth: 45, tags: ['SMB'], lastActivity: '1 day ago', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Lisa Thompson', email: 'lisa@bigco.com', company: 'BigCo', warmth: 85, tags: ['Enterprise', 'Decision Maker'], lastActivity: '30 min ago', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'John Doe', email: 'john@acme.com', company: 'Acme Corp', warmth: 30, tags: ['Follow Up'], lastActivity: '3 days ago', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Emma Wilson', email: 'emma@tech.io', company: 'Tech Solutions', warmth: 60, tags: ['Mid-Market'], lastActivity: '5 hours ago', avatar: 'https://i.pravatar.cc/150?img=5' }
  ];

  filteredLeads() {
    if (!this.searchQuery) return this.leads;
    return this.leads.filter(l => 
      l.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}

