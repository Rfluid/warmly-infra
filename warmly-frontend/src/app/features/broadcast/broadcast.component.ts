import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AutomationService } from '../../core/services/automation.service';
import { LeadsService } from '../../core/services/leads.service';
import { Automation, BulkMessage } from '../../core/models/automation.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, ModalComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-warmly-text-primary">Broadcast & Automations</h1>
          <p class="text-warmly-text-secondary mt-1">Send bulk messages and create automated campaigns</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-warmly-border">
        <button
          (click)="activeTab = 'bulk'"
          [class]="activeTab === 'bulk' ? 'border-b-2 border-warmly-primary text-warmly-primary' : 'text-warmly-text-muted'"
          class="px-4 py-2 font-medium"
        >
          Bulk Send
        </button>
        <button
          (click)="activeTab = 'automation'"
          [class]="activeTab === 'automation' ? 'border-b-2 border-warmly-primary text-warmly-primary' : 'text-warmly-text-muted'"
          class="px-4 py-2 font-medium"
        >
          Automations
        </button>
      </div>

      <!-- Bulk Send Tab -->
      <div *ngIf="activeTab === 'bulk'" class="space-y-6">
        <app-card title="Create Bulk Message" variant="elevated">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Message</label>
              <textarea
                [(ngModel)]="bulkForm.message"
                rows="4"
                placeholder="Type your message here..."
                class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Warmth Range</label>
                <div class="flex gap-2 items-center">
                  <input type="number" min="0" max="100" [(ngModel)]="bulkForm.warmthMin" class="w-20 px-3 py-2 border border-warmly-border rounded-warmly-lg" />
                  <span>to</span>
                  <input type="number" min="0" max="100" [(ngModel)]="bulkForm.warmthMax" class="w-20 px-3 py-2 border border-warmly-border rounded-warmly-lg" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Status Filter</label>
                <select [(ngModel)]="bulkForm.status" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="waiting-contact">Waiting Contact</option>
                </select>
              </div>
            </div>

            <div class="p-4 bg-warmly-bg rounded-warmly-lg">
              <p class="font-medium text-warmly-text-primary">Estimated Recipients: {{ estimatedRecipients() }}</p>
              <p class="text-sm text-warmly-text-muted mt-1">Based on current filters</p>
            </div>

            <div class="flex gap-2">
              <app-button variant="secondary" (buttonClick)="previewRecipients()">Preview Recipients</app-button>
              <app-button variant="primary" [disabled]="!bulkForm.message" (buttonClick)="sendBulkMessage()">
                Send to {{ estimatedRecipients() }} Leads
              </app-button>
            </div>
          </div>
        </app-card>

        <!-- Bulk History -->
        <app-card title="Recent Bulk Messages" variant="elevated">
          <div class="space-y-3">
            <div *ngIf="bulkMessages().length === 0" class="text-center py-6 text-warmly-text-muted">
              No bulk messages sent yet
            </div>

            <div *ngFor="let bulk of bulkMessages()" class="p-4 border border-warmly-border rounded-warmly-lg">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <p class="font-medium text-warmly-text-primary">{{ bulk.message.substring(0, 100) }}...</p>
                  <p class="text-sm text-warmly-text-muted mt-1">
                    Sent {{ formatDate(bulk.sentAt!) }} • {{ bulk.actualRecipients }} recipients
                  </p>
                </div>
                <span [class]="getBulkStatusClass(bulk.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ bulk.status }}
                </span>
              </div>
              <div class="flex gap-4 text-sm mt-2">
                <span class="text-green-600">✓ {{ bulk.successCount }} sent</span>
                <span *ngIf="bulk.failCount > 0" class="text-red-600">✗ {{ bulk.failCount }} failed</span>
              </div>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Automations Tab -->
      <div *ngIf="activeTab === 'automation'" class="space-y-6">
        <div class="flex justify-end">
          <app-button variant="primary" (buttonClick)="openCreateAutomation()">+ Create Automation</app-button>
        </div>

        <!-- Automations List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngIf="automations().length === 0" class="col-span-2 text-center py-12 text-warmly-text-muted">
            No automations created yet
          </div>

          <app-card *ngFor="let auto of automations()" [title]="auto.name" variant="elevated">
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [checked]="auto.active" (change)="toggleAutomation(auto.id!)" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
                </label>
                <span class="text-sm font-medium">{{ auto.active ? 'Active' : 'Inactive' }}</span>
              </div>

              <div class="text-sm space-y-1">
                <p><strong>Type:</strong> {{ getAutomationTypeLabel(auto.type) }}</p>
                <p *ngIf="auto.filters.warmthMin !== undefined">
                  <strong>Warmth:</strong> {{ auto.filters.warmthMin }}-{{ auto.filters.warmthMax }}
                </p>
                <p *ngIf="auto.schedule?.cadenceDays">
                  <strong>Frequency:</strong> Every {{ auto.schedule?.cadenceDays }} days
                </p>
              </div>

              <div class="p-3 bg-warmly-bg rounded-warmly-lg text-sm">
                <p class="text-warmly-text-muted">Message:</p>
                <p class="mt-1">{{ auto.template.substring(0, 100) }}...</p>
              </div>

              <div class="flex gap-2 text-xs text-warmly-text-muted">
                <span>✓ {{ auto.successCount }} sent</span>
                <span *ngIf="auto.failCount > 0">✗ {{ auto.failCount }} failed</span>
              </div>

              <div class="flex gap-2">
                <app-button variant="ghost" size="sm" (buttonClick)="editAutomation(auto)">Edit</app-button>
                <app-button variant="ghost" size="sm" (buttonClick)="deleteAutomation(auto.id!)">Delete</app-button>
              </div>
            </div>
          </app-card>
        </div>
      </div>
    </div>

    <!-- Create Automation Modal -->
    <app-modal [isOpen]="showAutomationModal" (closeModal)="closeAutomationModal()" title="Create Automation" size="lg" [hasFooter]="true">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Automation Name</label>
          <input type="text" [(ngModel)]="automationForm.name" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Type</label>
          <select [(ngModel)]="automationForm.type" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg">
            <option value="warmth_range">Warmth Range</option>
            <option value="inactivity">Inactivity</option>
            <option value="drip_sequence">Drip Sequence</option>
          </select>
        </div>

        <div *ngIf="automationForm.type === 'warmth_range'" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Min Warmth</label>
            <input type="number" [(ngModel)]="automationForm.warmthMin" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Max Warmth</label>
            <input type="number" [(ngModel)]="automationForm.warmthMax" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Cadence (days)</label>
          <input type="number" [(ngModel)]="automationForm.cadenceDays" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Message Template</label>
          <textarea [(ngModel)]="automationForm.template" rows="4" class="w-full px-4 py-2 border border-warmly-border rounded-warmly-lg"></textarea>
        </div>
      </div>

      <div footer class="flex gap-3">
        <app-button variant="ghost" (buttonClick)="closeAutomationModal()">Cancel</app-button>
        <app-button variant="primary" (buttonClick)="saveAutomation()">Create</app-button>
      </div>
    </app-modal>
  `,
  styles: []
})
export class BroadcastComponent implements OnInit {
  private automationService = inject(AutomationService);
  private leadsService = inject(LeadsService);
  private toastService = inject(ToastService);

  activeTab: 'bulk' | 'automation' = 'bulk';
  automations = signal<Automation[]>([]);
  bulkMessages = signal<BulkMessage[]>([]);

  bulkForm = {
    message: '',
    warmthMin: 0,
    warmthMax: 100,
    status: ''
  };

  showAutomationModal = false;
  automationForm = {
    name: '',
    type: 'warmth_range' as Automation['type'],
    warmthMin: 0,
    warmthMax: 100,
    cadenceDays: 3,
    template: ''
  };

  ngOnInit() {
    this.loadAutomations();
    this.loadBulkMessages();
  }

  loadAutomations() {
    this.automationService.getAutomations().subscribe({
      next: (autos) => this.automations.set(autos)
    });
  }

  loadBulkMessages() {
    this.automationService.getBulkMessages().subscribe({
      next: (bulks) => this.bulkMessages.set(bulks)
    });
  }

  estimatedRecipients(): number {
    // Calculate based on filters
    const leads = this.leadsService.leads();
    return leads.filter(l => {
      if (l.warmth < this.bulkForm.warmthMin || l.warmth > this.bulkForm.warmthMax) return false;
      if (this.bulkForm.status && l.status !== this.bulkForm.status) return false;
      return true;
    }).length;
  }

  previewRecipients() {
    this.toastService.info(`Will send to ${this.estimatedRecipients()} leads`);
  }

  sendBulkMessage() {
    if (!this.bulkForm.message) {
      this.toastService.error('Please enter a message');
      return;
    }

    const bulkData = {
      message: this.bulkForm.message,
      recipientFilters: {
        warmthMin: this.bulkForm.warmthMin,
        warmthMax: this.bulkForm.warmthMax,
        statuses: this.bulkForm.status ? [this.bulkForm.status] : undefined
      },
      estimatedRecipients: this.estimatedRecipients()
    };

    this.automationService.createBulkMessage(bulkData).subscribe({
      next: (bulk) => {
        this.automationService.sendBulkMessage(bulk.id!).subscribe({
          next: () => {
            this.toastService.success('Bulk message sent successfully');
            this.bulkForm.message = '';
            this.loadBulkMessages();
          }
        });
      }
    });
  }

  openCreateAutomation() {
    this.automationForm = {
      name: '',
      type: 'warmth_range',
      warmthMin: 40,
      warmthMax: 70,
      cadenceDays: 3,
      template: ''
    };
    this.showAutomationModal = true;
  }

  saveAutomation() {
    if (!this.automationForm.name || !this.automationForm.template) {
      this.toastService.error('Please fill all required fields');
      return;
    }

    const autoData: Partial<Automation> = {
      name: this.automationForm.name,
      type: this.automationForm.type,
      filters: {
        warmthMin: this.automationForm.warmthMin,
        warmthMax: this.automationForm.warmthMax
      },
      schedule: {
        cadenceDays: this.automationForm.cadenceDays
      },
      template: this.automationForm.template,
      active: true
    };

    this.automationService.createAutomation(autoData).subscribe({
      next: () => {
        this.toastService.success('Automation created');
        this.closeAutomationModal();
        this.loadAutomations();
      }
    });
  }

  closeAutomationModal() {
    this.showAutomationModal = false;
  }

  toggleAutomation(id: string) {
    this.automationService.toggleAutomation(id).subscribe({
      next: () => {
        this.loadAutomations();
      }
    });
  }

  editAutomation(auto: Automation) {
    this.toastService.info('Edit automation coming soon');
  }

  deleteAutomation(id: string) {
    if (confirm('Delete this automation?')) {
      this.automationService.deleteAutomation(id).subscribe({
        next: () => {
          this.toastService.success('Automation deleted');
          this.loadAutomations();
        }
      });
    }
  }

  getAutomationTypeLabel(type: string): string {
    const labels = {
      'warmth_range': 'Warmth Range',
      'inactivity': 'Inactivity',
      'drip_sequence': 'Drip Sequence'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getBulkStatusClass(status: string): string {
    const classes = {
      'draft': 'bg-gray-100 text-gray-700',
      'scheduled': 'bg-blue-100 text-blue-700',
      'sending': 'bg-yellow-100 text-yellow-700',
      'sent': 'bg-green-100 text-green-700',
      'failed': 'bg-red-100 text-red-700'
    };
    return classes[status as keyof typeof classes] || classes.draft;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
}
