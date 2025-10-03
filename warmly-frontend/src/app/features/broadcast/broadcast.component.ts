import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="p-8 space-y-6">
      <h1 class="text-3xl font-bold text-warmly-text-primary">Broadcast & Automations</h1>
      
      <div class="flex gap-4 mb-6">
        <button 
          [class]="activeTab === 'bulk' ? 'bg-warmly-primary text-white' : 'bg-white text-warmly-text-primary'"
          (click)="activeTab = 'bulk'"
          class="px-6 py-2 rounded-warmly-md font-medium transition-all"
        >
          Bulk Send
        </button>
        <button 
          [class]="activeTab === 'automations' ? 'bg-warmly-primary text-white' : 'bg-white text-warmly-text-primary'"
          (click)="activeTab = 'automations'"
          class="px-6 py-2 rounded-warmly-md font-medium transition-all"
        >
          Automations
        </button>
      </div>

      <div *ngIf="activeTab === 'bulk'">
        <app-card variant="elevated" title="Bulk Message">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-warmly-text-primary mb-2">Message</label>
              <textarea 
                rows="6"
                placeholder="Type your message... Use variables for personalization"
                class="w-full px-4 py-3 bg-white/50 border border-warmly-border rounded-warmly-md focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-warmly-text-primary mb-2">Target Audience</label>
              <div class="grid grid-cols-3 gap-4">
                <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
                  <option>All Leads</option>
                  <option>By Warmth</option>
                  <option>By Tag</option>
                </select>
                <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
                  <option>Warmth: All</option>
                  <option>Hot (70+)</option>
                  <option>Warm (40-69)</option>
                  <option>Cool (0-39)</option>
                </select>
                <select class="px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md">
                  <option>Last Activity: All</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Inactive 30+ days</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-warmly-bg rounded-warmly-md">
              <div>
                <p class="font-medium text-warmly-text-primary">Estimated Recipients</p>
                <p class="text-sm text-warmly-text-muted">Based on current filters</p>
              </div>
              <span class="text-2xl font-bold text-warmly-primary">147</span>
            </div>

            <div class="flex gap-3">
              <app-button variant="secondary">Preview</app-button>
              <app-button variant="primary">Send Now</app-button>
            </div>
          </div>
        </app-card>
      </div>

      <div *ngIf="activeTab === 'automations'">
        <app-card variant="elevated" title="Automation Rules">
          <div class="space-y-4">
            <p class="text-warmly-text-muted">
              Create automated message sequences based on lead behavior and warmth.
            </p>
            
            <div class="space-y-3">
              <div class="p-4 border border-warmly-border rounded-warmly-md">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-warmly-text-primary">Follow-up for Warm Leads</h4>
                    <p class="text-sm text-warmly-text-muted">Warmth 40-69 • Every 3 days</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
                  </label>
                </div>
              </div>

              <div class="p-4 border border-warmly-border rounded-warmly-md">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-warmly-text-primary">Re-engagement Campaign</h4>
                    <p class="text-sm text-warmly-text-muted">Inactive 30+ days • One-time</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <app-button variant="primary">Create New Automation</app-button>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class BroadcastComponent {
  activeTab = 'bulk';
}

