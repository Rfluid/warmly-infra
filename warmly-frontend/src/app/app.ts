import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FloatingSidebarComponent } from './layout/floating-sidebar/floating-sidebar.component';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FloatingSidebarComponent],
  template: `
    <!-- Login Route (no sidebar) -->
    <div *ngIf="!isAuthRoute()" class="flex min-h-screen bg-warmly-bg">
      <!-- Sidebar -->
      <app-floating-sidebar />
      
      <!-- Main Content -->
      <main class="flex-1 lg:ml-72 transition-all duration-300">
        <div class="min-h-screen">
          <router-outlet />
        </div>
      </main>
    </div>

    <!-- Auth Routes (login) -->
    <router-outlet *ngIf="isAuthRoute()" />

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <div 
        *ngFor="let toast of toasts()"
        class="flex items-start gap-3 p-4 rounded-warmly-lg shadow-warmly-lg backdrop-blur-md animate-fadeIn"
        [class]="getToastClasses(toast.type)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <svg *ngIf="toast.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
        </div>
        
        <!-- Message -->
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        
        <!-- Close Button -->
        <button 
          (click)="removeToast(toast.id)"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  toasts = this.toastService.toasts;

  isAuthRoute(): boolean {
    return this.router.url.includes('/login');
  }

  getToastClasses(type: 'success' | 'error' | 'warning' | 'info'): string {
    const classes = {
      success: 'bg-green-50 text-green-800 border border-green-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-amber-50 text-amber-800 border border-amber-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200'
    };
    return classes[type];
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }
}
