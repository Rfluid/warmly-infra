import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AuthService } from '../../core/services/auth.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="p-4 md:p-8 space-y-6 max-w-4xl">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-warmly-text-primary">Settings</h1>
        <p class="text-warmly-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      <!-- Profile -->
      <app-card title="Profile" variant="elevated">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-gradient-warmly flex items-center justify-center text-white text-2xl font-bold">
              {{ getInitials() }}
            </div>
            <div>
              <p class="font-semibold text-warmly-text-primary text-lg">{{ user()?.displayName || user()?.email }}</p>
              <p class="text-sm text-warmly-text-muted">{{ user()?.email }}</p>
            </div>
          </div>

          <div class="pt-4 border-t border-warmly-border">
            <p class="text-sm text-warmly-text-muted mb-2">User ID</p>
            <p class="font-mono text-sm">{{ user()?.uid }}</p>
          </div>
        </div>
      </app-card>

      <!-- WhatsApp Connection -->
      <app-card title="WhatsApp Connection" variant="elevated">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-warmly-text-primary">Connection Status</p>
              <p class="text-sm text-warmly-text-muted mt-1">
                {{ waStatus() === 'connected' ? 'Connected' : 'Disconnected' }}
              </p>
            </div>
            <span [class]="getWAStatusClass()" class="px-4 py-2 rounded-full text-sm font-medium">
              {{ waStatus() === 'connected' ? '✓ Connected' : '✗ Disconnected' }}
            </span>
          </div>

          <div *ngIf="waStatus() === 'connected' && waPhone()" class="p-4 bg-warmly-bg rounded-warmly-lg">
            <p class="text-sm text-warmly-text-muted mb-1">Connected Phone</p>
            <p class="font-semibold text-warmly-text-primary">{{ waPhone() }}</p>
          </div>

          <div class="flex gap-2">
            <app-button 
              *ngIf="waStatus() !== 'connected'" 
              variant="primary" 
              (buttonClick)="reconnectWhatsApp()"
            >
              Connect WhatsApp
            </app-button>
            <app-button 
              *ngIf="waStatus() === 'connected'" 
              variant="danger" 
              (buttonClick)="disconnectWhatsApp()"
            >
              Disconnect
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Notifications -->
      <app-card title="Notifications" variant="elevated">
        <div class="space-y-3">
          <label class="flex items-center justify-between p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
            <div>
              <p class="font-medium text-warmly-text-primary">New Leads</p>
              <p class="text-sm text-warmly-text-muted">Get notified when new leads message you</p>
            </div>
            <input type="checkbox" [(ngModel)]="notifications.newLeads" class="w-5 h-5" />
          </label>

          <label class="flex items-center justify-between p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
            <div>
              <p class="font-medium text-warmly-text-primary">Hot Leads</p>
              <p class="text-sm text-warmly-text-muted">Alert when warmth score exceeds 70</p>
            </div>
            <input type="checkbox" [(ngModel)]="notifications.hotLeads" class="w-5 h-5" />
          </label>

          <label class="flex items-center justify-between p-3 border rounded-warmly-lg cursor-pointer hover:bg-warmly-bg">
            <div>
              <p class="font-medium text-warmly-text-primary">Deal Triggers</p>
              <p class="text-sm text-warmly-text-muted">Notify when buying intent is detected</p>
            </div>
            <input type="checkbox" [(ngModel)]="notifications.dealTriggers" class="w-5 h-5" />
          </label>
        </div>
      </app-card>

      <!-- Data & Privacy -->
      <app-card title="Data & Privacy" variant="elevated">
        <div class="space-y-4">
          <div>
            <p class="font-medium text-warmly-text-primary mb-2">Export Your Data</p>
            <p class="text-sm text-warmly-text-muted mb-3">Download all your leads, conversations, and settings</p>
            <app-button variant="secondary" (buttonClick)="exportData()">Export Data</app-button>
          </div>

          <div class="pt-4 border-t border-warmly-border">
            <p class="font-medium text-warmly-text-primary mb-2">Delete Account</p>
            <p class="text-sm text-warmly-text-muted mb-3">Permanently delete your account and all associated data</p>
            <app-button variant="danger" (buttonClick)="deleteAccount()">Delete Account</app-button>
          </div>
        </div>
      </app-card>

      <!-- Account Actions -->
      <app-card title="Account" variant="elevated">
        <div class="flex gap-2">
          <app-button variant="secondary" (buttonClick)="changePassword()">Change Password</app-button>
          <app-button variant="ghost" (buttonClick)="logout()">Sign Out</app-button>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private waService = inject(WhatsAppService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  user = this.authService.currentUser;
  waStatus = this.waService.status;
  waPhone = this.waService.connectedPhone;

  notifications = {
    newLeads: true,
    hotLeads: true,
    dealTriggers: true
  };

  getInitials(): string {
    const name = this.user()?.displayName || this.user()?.email || 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getWAStatusClass(): string {
    return this.waStatus() === 'connected' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  }

  reconnectWhatsApp() {
    this.router.navigate(['/whatsapp']);
  }

  disconnectWhatsApp() {
    if (confirm('Are you sure you want to disconnect WhatsApp?')) {
      this.waService.disconnect().subscribe(() => {
        this.toastService.success('WhatsApp disconnected');
      });
    }
  }

  exportData() {
    this.toastService.info('Export feature coming soon');
  }

  deleteAccount() {
    if (confirm('This action cannot be undone. Are you absolutely sure?')) {
      if (confirm('Type DELETE to confirm')) {
        this.toastService.info('Account deletion feature coming soon');
      }
    }
  }

  changePassword() {
    this.toastService.info('Password change feature coming soon');
  }

  logout() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.toastService.success('Signed out successfully');
        }
      });
    }
  }
}
