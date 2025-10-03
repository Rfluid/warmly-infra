import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';
import { LeadsService } from '../../core/services/leads.service';
import { Lead } from '../../core/models/lead.model';
import { ToastService } from '../../core/services/toast.service';

interface Column {
  id: string;
  title: string;
  status: Lead['status'];
  leads: Lead[];
}

@Component({
  selector: 'app-funnel',
  standalone: true,
  imports: [CommonModule, FormsModule, WarmthBadgeComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">Sales Funnel</h1>
          <p class="text-warmly-text-secondary mt-1">Drag & drop leads through your pipeline</p>
        </div>
        <div class="text-sm text-warmly-text-muted">
          Total: {{ getTotalLeads() }} leads
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex gap-4 overflow-x-auto pb-4">
        <div *ngFor="let column of columns()" class="flex-shrink-0 w-80">
          <div class="bg-white rounded-2xl shadow-warmly-lg overflow-hidden h-full flex flex-col">
            <!-- Column Header -->
            <div class="p-4 bg-gradient-to-r from-warmly-bg to-warmly-bg/50 border-b border-warmly-border">
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-warmly-text-primary">{{ column.title }}</h3>
                <span class="px-2 py-1 bg-white rounded-full text-xs font-medium">{{ column.leads.length }}</span>
              </div>
              <div *ngIf="column.leads.length > 0" class="text-xs text-warmly-text-muted">
                Avg Warmth: {{ getAvgWarmth(column.leads) }}
              </div>
            </div>

            <!-- Drop Zone -->
            <div 
              class="flex-1 p-2 space-y-2 overflow-y-auto min-h-[400px]"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event, column.status)"
            >
              <!-- Empty State -->
              <div *ngIf="column.leads.length === 0" class="p-8 text-center text-warmly-text-muted">
                <p class="text-sm">No leads here</p>
                <p class="text-xs mt-1">Drag leads to this column</p>
              </div>

              <!-- Lead Cards -->
              <div
                *ngFor="let lead of column.leads"
                draggable="true"
                (dragstart)="onDragStart($event, lead)"
                (dragend)="onDragEnd($event)"
                class="p-4 bg-white border border-warmly-border rounded-warmly-lg cursor-move hover:shadow-md transition-all"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-warmly-text-primary">{{ lead.name }}</h4>
                  <app-warmth-badge [score]="lead.warmth" size="sm" />
                </div>
                
                <p class="text-sm text-warmly-text-muted mb-2">{{ lead.phone }}</p>
                
                <div *ngIf="getTagKeys(lead.tags).length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span *ngFor="let key of getTagKeys(lead.tags)" 
                    class="px-2 py-1 bg-warmly-primary/10 text-warmly-primary rounded-full text-xs">
                    {{ lead.tags[key] }}
                  </span>
                </div>

                <div *ngIf="lead.lastMsgAt" class="mt-2 text-xs text-warmly-text-muted">
                  Last contact: {{ formatDate(lead.lastMsgAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl shadow-warmly-lg p-6">
          <div class="text-2xl font-bold text-warmly-text-primary">{{ getColumnCount('active') }}</div>
          <div class="text-sm text-warmly-text-muted mt-1">Active Leads</div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-warmly-lg p-6">
          <div class="text-2xl font-bold text-warmly-text-primary">{{ getColumnCount('waiting-contact') }}</div>
          <div class="text-sm text-warmly-text-muted mt-1">Waiting Contact</div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-warmly-lg p-6">
          <div class="text-2xl font-bold text-green-600">{{ getColumnCount('won') }}</div>
          <div class="text-sm text-warmly-text-muted mt-1">Won</div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-warmly-lg p-6">
          <div class="text-2xl font-bold text-warmly-text-primary">{{ getConversionRate() }}%</div>
          <div class="text-sm text-warmly-text-muted mt-1">Conversion Rate</div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FunnelComponent implements OnInit {
  private leadsService = inject(LeadsService);
  private toastService = inject(ToastService);

  columns = signal<Column[]>([]);
  draggedLead: Lead | null = null;

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.leadsService.getLeads().subscribe({
      next: (leads) => {
        this.organizeColumns(leads);
      }
    });
  }

  organizeColumns(leads: Lead[]) {
    const cols: Column[] = [
      {
        id: 'inactive',
        title: 'Inactive',
        status: 'inactive',
        leads: leads.filter(l => l.status === 'inactive')
      },
      {
        id: 'active',
        title: 'Active',
        status: 'active',
        leads: leads.filter(l => l.status === 'active')
      },
      {
        id: 'waiting',
        title: 'Waiting Contact',
        status: 'waiting-contact',
        leads: leads.filter(l => l.status === 'waiting-contact')
      },
      {
        id: 'won',
        title: 'Won',
        status: 'won',
        leads: leads.filter(l => l.status === 'won')
      },
      {
        id: 'lost',
        title: 'Lost',
        status: 'lost',
        leads: leads.filter(l => l.status === 'lost')
      }
    ];

    this.columns.set(cols);
  }

  onDragStart(event: DragEvent, lead: Lead) {
    this.draggedLead = lead;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
  }

  onDragEnd(event: DragEvent) {
    this.draggedLead = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: Lead['status']) {
    event.preventDefault();
    
    if (!this.draggedLead) return;

    const lead = this.draggedLead;
    const oldStatus = lead.status;

    if (oldStatus === newStatus) return;

    // Update lead status
    this.leadsService.updateLead(lead.id!, { status: newStatus }).subscribe({
      next: () => {
        this.toastService.success(`Lead moved to ${newStatus}`);
        this.loadLeads();
      },
      error: () => {
        this.toastService.error('Failed to update lead');
      }
    });
  }

  getAvgWarmth(leads: Lead[]): number {
    if (leads.length === 0) return 0;
    const sum = leads.reduce((acc, l) => acc + l.warmth, 0);
    return Math.round(sum / leads.length);
  }

  getTotalLeads(): number {
    return this.columns().reduce((sum, col) => sum + col.leads.length, 0);
  }

  getColumnCount(status: Lead['status']): number {
    const col = this.columns().find(c => c.status === status);
    return col ? col.leads.length : 0;
  }

  getConversionRate(): number {
    const total = this.getTotalLeads();
    const won = this.getColumnCount('won');
    return total > 0 ? Math.round((won / total) * 100) : 0;
  }

  getTagKeys(tags: Record<string, any>): string[] {
    return Object.keys(tags);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  }
}
