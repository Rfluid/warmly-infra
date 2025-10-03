import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-gate',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-warmly-2xl max-w-lg w-full p-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <span class="text-4xl">📱</span>
          </div>
          <h2 class="text-2xl font-bold text-warmly-text-primary mb-2">Connect Your WhatsApp</h2>
          <p class="text-warmly-text-secondary">
            To use Warmly, you need to connect your WhatsApp account
          </p>
        </div>

        <!-- Status -->
        <div class="mb-6 p-4 rounded-warmly-lg" [class]="getStatusClass()">
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <p class="font-medium">{{ getStatusText() }}</p>
              <p class="text-sm opacity-75">{{ getStatusDescription() }}</p>
            </div>
            <div 
              class="w-3 h-3 rounded-full animate-pulse"
              [class]="status() === 'connected' ? 'bg-green-500' : 'bg-yellow-500'"
            ></div>
          </div>
        </div>

        <!-- QR Code -->
        <div *ngIf="status() === 'qr' || status() === 'connecting'" class="mb-6">
          <div class="border-2 border-dashed border-warmly-border rounded-warmly-lg p-6">
            <div *ngIf="qrCodeUrl()" class="bg-white p-4 rounded-lg">
              <img [src]="qrCodeUrl()" alt="QR Code" class="w-full h-auto" />
            </div>
            <div *ngIf="!qrCodeUrl()" class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin inline-block w-8 h-8 border-4 border-warmly-primary border-t-transparent rounded-full mb-2"></div>
                <p class="text-sm text-warmly-text-muted">Generating QR Code...</p>
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-warmly-lg text-sm">
            <p class="font-medium text-blue-900 mb-2">📲 How to connect:</p>
            <ol class="list-decimal list-inside text-blue-800 space-y-1">
              <li>Open WhatsApp on your phone</li>
              <li>Tap Menu (⋮) > Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Scan this QR code</li>
            </ol>
          </div>
        </div>

        <!-- Mock: Auto-connect after 10 seconds -->
        <div *ngIf="status() === 'disconnected'" class="text-center">
          <p class="text-warmly-text-muted mb-4">Checking WhatsApp connection status...</p>
          <div class="animate-spin inline-block w-8 h-8 border-4 border-warmly-primary border-t-transparent rounded-full"></div>
        </div>

        <!-- Success -->
        <div *ngIf="status() === 'connected'" class="text-center">
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
              <span class="text-3xl">✓</span>
            </div>
            <p class="text-green-700 font-medium">WhatsApp Connected Successfully!</p>
          </div>
          
          <app-button variant="primary" [fullWidth]="true" (buttonClick)="continue()">
            Continue to Warmly →
          </app-button>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-warmly-border text-center text-xs text-warmly-text-muted">
          <p>🔒 Your connection is secure and encrypted</p>
          <p class="mt-1">Warmly never stores your messages</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WhatsAppGateComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private waService = inject(WhatsAppService);

  // Use service signals
  status = computed(() => this.waService.status());
  qrCodeUrl = computed(() => this.waService.qrCode());
  
  private statusSubscription?: Subscription;

  ngOnInit() {
    // Check if already connected
    if (this.waService.isConnected()) {
      this.continue();
      return;
    }

    // Initiate connection
    this.waService.connect().subscribe();
    
    // Watch for connection changes
    this.statusSubscription = interval(1000).subscribe(() => {
      if (this.waService.isConnected()) {
        // Auto-navigate after connection
        setTimeout(() => {
          this.continue();
        }, 2000);
      }
    });
  }

  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
  }

  getStatusClass(): string {
    switch (this.status()) {
      case 'connected':
        return 'bg-green-50 border border-green-200';
      case 'connecting':
      case 'qr':
        return 'bg-yellow-50 border border-yellow-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  }

  getStatusText(): string {
    switch (this.status()) {
      case 'connected':
        return '✓ Connected';
      case 'connecting':
        return '⏳ Connecting...';
      case 'qr':
        return '📱 Scan QR Code';
      default:
        return '🔄 Checking connection...';
    }
  }

  getStatusDescription(): string {
    switch (this.status()) {
      case 'connected':
        return 'Your WhatsApp is now connected to Warmly';
      case 'connecting':
        return 'Establishing secure connection...';
      case 'qr':
        return 'Use WhatsApp to scan the code above';
      default:
        return 'Please wait...';
    }
  }

  continue() {
    this.router.navigate(['/conversations']);
  }
}

