import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="p-8 space-y-6">
      <h1 class="text-3xl font-bold text-warmly-text-primary">Settings</h1>
      
      <app-card variant="elevated" title="General Settings">
        <p class="text-warmly-text-muted mb-4">
          Configure your application preferences and settings.
        </p>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-warmly-bg rounded-warmly-md">
            <div>
              <p class="font-medium text-warmly-text-primary">Email Notifications</p>
              <p class="text-sm text-warmly-text-muted">Receive email updates for new leads</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-4 bg-warmly-bg rounded-warmly-md">
            <div>
              <p class="font-medium text-warmly-text-primary">Dark Mode</p>
              <p class="text-sm text-warmly-text-muted">Switch to dark theme</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warmly-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warmly-primary"></div>
            </label>
          </div>
        </div>
      </app-card>

      <app-card variant="elevated" title="API Configuration">
        <p class="text-warmly-text-muted mb-4">
          Backend connection settings
        </p>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-warmly-text-primary mb-1">API URL</label>
            <input 
              type="text" 
              value="http://localhost:8000"
              class="w-full px-4 py-2 bg-white/50 border border-warmly-border rounded-warmly-md focus:outline-none focus:ring-2 focus:ring-warmly-primary/50"
            />
          </div>
          <app-button variant="primary">Save Settings</app-button>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class SettingsComponent {}

