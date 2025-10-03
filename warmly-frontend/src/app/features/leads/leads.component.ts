import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { LeadsService, LeadFilters } from '../../core/services/leads.service';
import { Lead, TagDef } from '../../core/models/lead.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, WarmthBadgeComponent, ModalComponent, InputComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">Leads</h1>
          <p class="text-warmly-text-secondary mt-1">Manage contacts with smart tags</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="ghost" (buttonClick)="exportCSV()">
            Export
          </app-button>
          <app-button variant="secondary" (buttonClick)="showManageTags = true">
            Manage Tags
          </app-button>
          <app-button variant="primary" (buttonClick)="openAddLeadModal()">
            + Add Lead
          </app-button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-warmly-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            placeholder="Search leads..."
            class="px-4 py-2 border border-warmly-border rounded-warmly-lg"
          />
          
          <select [(ngModel)]="warmthFilter" (change)="applyFilters()" class="px-4 py-2 border border-warmly-border rounded-warmly-lg">
            <option value="">All Warmth</option>
            <option value="hot">Hot (70+)</option>
            <option value="warm">Warm (40-69)</option>
            <option value="cool">Cool (0-39)</option>
          </select>
          
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="px-4 py-2 border border-warmly-border rounded-warmly-lg">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="waiting-contact">Waiting Contact</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          <div class="text-sm text-warmly-text-muted self-center">
            Showing {{ filteredLeads().length }} of {{ allLeads().length }} leads
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-warmly-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-warmly-bg border-b border-warmly-border">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Name</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Contact</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Warmth</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Tags</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-warmly-text-primary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-warmly-border">
              <tr *ngIf="filteredLeads().length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="text-warmly-text-muted">
                    <p class="text-lg font-medium mb-2">No leads found</p>
                    <p class="text-sm">Try adjusting your filters or add a new lead</p>
                  </div>
                </td>
              </tr>

              <tr *ngFor="let lead of filteredLeads()" class="hover:bg-warmly-bg/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-medium text-warmly-text-primary">{{ lead.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-warmly-text-secondary">{{ lead.phone }}</div>
                  <div *ngIf="lead.email" class="text-xs text-warmly-text-muted">{{ lead.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <app-warmth-badge [score]="lead.warmth" />
                </td>
                <td class="px-6 py-4">
                  <span [class]="getStatusClass(lead.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ lead.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let key of getTagKeys(lead.tags)" 
                      class="px-2 py-1 bg-warmly-primary/10 text-warmly-primary rounded-full text-xs">
                      {{ key }}: {{ lead.tags[key] }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button (click)="editLead(lead)" class="text-warmly-primary hover:text-warmly-primary-dark">
                      Edit
                    </button>
                    <button (click)="deleteLead(lead.id!)" class="text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Lead Modal -->
    <app-modal [isOpen]="showLeadModal" (closeModal)="closeLeadModal()" title="{{editingLead ? 'Edit' : 'Add'}} Lead" [hasFooter]="true">
      <div class="space-y-4">
        <app-input label="Name" [(value)]="leadForm.name" [required]="true" />
        <app-input label="Phone" [(value)]="leadForm.phone" [required]="true" />
        <app-input label="Email" type="email" [(value)]="leadForm.email" />
        
        <div>
          <label class="block text-sm font-medium mb-2">Warmth Score (0-100)</label>
          <input type="range" min="0" max="100" [(ngModel)]="leadForm.warmth" class="w-full" />
          <div class="text-sm text-warmly-text-muted mt-1">{{ leadForm.warmth }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select [(ngModel)]="leadForm.status" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg">
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="waiting-contact">Waiting Contact</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <!-- Dynamic Tags -->
        <div class="space-y-3">
          <h3 class="font-semibold">Tags</h3>
          <div *ngFor="let tagDef of tagDefs()" class="space-y-2">
            <label class="block text-sm font-medium">{{ tagDef.name }}</label>
            
            <input *ngIf="tagDef.type === 'text'" 
              type="text"
              [(ngModel)]="leadForm.tags[tagDef.id!]"
              [placeholder]="tagDef.description"
              class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
            />
            
            <select *ngIf="tagDef.type === 'select'"
              [(ngModel)]="leadForm.tags[tagDef.id!]"
              class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
            >
              <option value="">Select...</option>
              <option *ngFor="let opt of tagDef.options" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </div>

      <div footer class="flex gap-3">
        <app-button variant="ghost" (buttonClick)="closeLeadModal()">Cancel</app-button>
        <app-button variant="primary" (buttonClick)="saveLead()">Save</app-button>
      </div>
    </app-modal>

    <!-- Manage Tags Modal -->
    <app-modal [isOpen]="showManageTags" (closeModal)="showManageTags = false" title="Manage Smart Tags" size="lg">
      <div class="space-y-4">
        <app-button variant="primary" size="sm" (buttonClick)="addNewTag()">+ Add Tag</app-button>

        <div *ngFor="let tag of tagDefs()" class="p-4 border border-warmly-border rounded-warmly-lg">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h4 class="font-semibold">{{ tag.name }}</h4>
              <p class="text-sm text-warmly-text-muted">{{ tag.description }}</p>
              <p class="text-xs text-warmly-text-muted mt-1">Type: {{ tag.type }}</p>
            </div>
            <button (click)="deleteTag(tag.id!)" class="text-red-600 hover:text-red-700 text-sm">Delete</button>
          </div>
          
          <div *ngIf="tag.options && tag.options.length > 0" class="mt-2">
            <p class="text-xs text-warmly-text-muted">Options:</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span *ngFor="let opt of tag.options" class="px-2 py-1 bg-warmly-bg rounded text-xs">{{ opt }}</span>
            </div>
          </div>
        </div>
      </div>
    </app-modal>
  `,
  styles: []
})
export class LeadsComponent implements OnInit {
  private leadsService = inject(LeadsService);
  private toastService = inject(ToastService);

  allLeads = signal<Lead[]>([]);
  filteredLeads = signal<Lead[]>([]);
  tagDefs = signal<TagDef[]>([]);

  searchQuery = '';
  warmthFilter = '';
  statusFilter = '';

  showLeadModal = false;
  showManageTags = false;
  editingLead: Lead | null = null;

  leadForm = {
    name: '',
    phone: '',
    email: '',
    warmth: 50,
    status: 'active' as Lead['status'],
    tags: {} as Record<string, any>
  };

  ngOnInit() {
    this.loadLeads();
    this.loadTagDefs();
  }

  loadLeads() {
    this.leadsService.getLeads().subscribe({
      next: (leads) => {
        this.allLeads.set(leads);
        this.applyFilters();
      }
    });
  }

  loadTagDefs() {
    this.leadsService.getTagDefs().subscribe({
      next: (tags) => {
        this.tagDefs.set(tags);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allLeads()];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q))
      );
    }

    if (this.warmthFilter) {
      if (this.warmthFilter === 'hot') filtered = filtered.filter(l => l.warmth >= 70);
      else if (this.warmthFilter === 'warm') filtered = filtered.filter(l => l.warmth >= 40 && l.warmth < 70);
      else if (this.warmthFilter === 'cool') filtered = filtered.filter(l => l.warmth < 40);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(l => l.status === this.statusFilter);
    }

    this.filteredLeads.set(filtered);
  }

  openAddLeadModal() {
    this.editingLead = null;
    this.leadForm = {
      name: '',
      phone: '',
      email: '',
      warmth: 50,
      status: 'active',
      tags: {}
    };
    this.showLeadModal = true;
  }

  editLead(lead: Lead) {
    this.editingLead = lead;
    this.leadForm = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      warmth: lead.warmth,
      status: lead.status,
      tags: { ...lead.tags }
    };
    this.showLeadModal = true;
  }

  saveLead() {
    if (!this.leadForm.name || !this.leadForm.phone) {
      this.toastService.error('Name and phone are required');
      return;
    }

    const leadData: Partial<Lead> = {
      name: this.leadForm.name,
      phone: this.leadForm.phone,
      email: this.leadForm.email || undefined,
      warmth: this.leadForm.warmth,
      status: this.leadForm.status,
      tags: this.leadForm.tags
    };

    if (this.editingLead) {
      this.leadsService.updateLead(this.editingLead.id!, leadData).subscribe({
        next: () => {
          this.toastService.success('Lead updated successfully');
          this.closeLeadModal();
          this.loadLeads();
        }
      });
    } else {
      this.leadsService.createLead(leadData).subscribe({
        next: () => {
          this.toastService.success('Lead created successfully');
          this.closeLeadModal();
          this.loadLeads();
        }
      });
    }
  }

  deleteLead(id: string) {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.leadsService.deleteLead(id).subscribe({
        next: () => {
          this.toastService.success('Lead deleted');
          this.loadLeads();
        }
      });
    }
  }

  closeLeadModal() {
    this.showLeadModal = false;
    this.editingLead = null;
  }

  addNewTag() {
    const name = prompt('Tag name:');
    if (!name) return;

    const description = prompt('Description:');
    const typeStr = prompt('Type (text/select/number):') || 'text';
    
    let options: string[] | undefined;
    if (typeStr === 'select') {
      const optionsStr = prompt('Options (comma separated):');
      options = optionsStr?.split(',').map(o => o.trim());
    }

    this.leadsService.createTagDef({
      name,
      description: description || '',
      type: typeStr as any,
      options
    }).subscribe({
      next: () => {
        this.toastService.success('Tag created');
        this.loadTagDefs();
      }
    });
  }

  deleteTag(id: string) {
    if (confirm('Delete this tag? It will be removed from all leads.')) {
      this.leadsService.deleteTagDef(id).subscribe({
        next: () => {
          this.toastService.success('Tag deleted');
          this.loadTagDefs();
        }
      });
    }
  }

  exportCSV() {
    const csv = this.leadsService.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastService.success('CSV exported');
  }

  getStatusClass(status: string): string {
    const classes = {
      'inactive': 'bg-gray-100 text-gray-700',
      'active': 'bg-green-100 text-green-700',
      'waiting-contact': 'bg-yellow-100 text-yellow-700',
      'won': 'bg-blue-100 text-blue-700',
      'lost': 'bg-red-100 text-red-700'
    };
    return classes[status as keyof typeof classes] || classes.inactive;
  }

  getTagKeys(tags: Record<string, any>): string[] {
    return Object.keys(tags);
  }
}
