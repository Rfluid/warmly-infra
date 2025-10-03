import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-floating-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Overlay -->
    <div 
      *ngIf="isMobileMenuOpen()"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      (click)="toggleMobileMenu()"
    ></div>

    <!-- Sidebar -->
    <aside 
      [class]="sidebarClasses()"
      class="fixed left-0 top-0 h-screen z-50 transition-all duration-300"
    >
      <div class="flex flex-col h-full p-4">
        <!-- Header with Logo -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-warmly flex items-center justify-center shadow-warmly-md flex-shrink-0">
              <span class="text-white text-xl font-bold">W</span>
            </div>
            <div [class]="isCollapsed() && !isMobileMenuOpen() ? 'hidden' : 'block'">
              <h1 class="text-lg font-bold text-warmly-text-primary">Warmly</h1>
              <p class="text-xs text-warmly-text-muted">AI Assistant</p>
            </div>
          </div>
          
          <!-- Mobile Close Button -->
          <button
            class="lg:hidden p-2 hover:bg-warmly-bg rounded-lg transition-colors"
            (click)="toggleMobileMenu()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-2">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="bg-gradient-warmly text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:bg-warmly-bg group"
            (click)="onNavClick()"
          >
            <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
            <div [class]="isCollapsed() && !isMobileMenuOpen() ? 'hidden' : 'block'">
              <span class="font-medium">{{ item.label }}</span>
              <div *ngIf="item.badge" class="text-xs opacity-75">{{ item.badge }}</div>
            </div>
          </a>
        </nav>

        <!-- User Section -->
        <div class="border-t border-warmly-border pt-4 space-y-2">
          <!-- User Info -->
          <div class="flex items-center gap-3 px-4 py-2">
            <div class="w-10 h-10 rounded-full bg-warmly-primary/20 flex items-center justify-center flex-shrink-0">
              <span class="text-warmly-primary font-semibold">
                {{ currentUser()?.displayName?.charAt(0) || currentUser()?.email?.charAt(0) || 'U' }}
              </span>
            </div>
            <div [class]="isCollapsed() && !isMobileMenuOpen() ? 'hidden' : 'block'" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-warmly-text-primary truncate">
                {{ currentUser()?.displayName || currentUser()?.email || 'User' }}
              </p>
              <p class="text-xs text-warmly-text-muted truncate">
                {{ currentUser()?.email || '' }}
              </p>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:bg-red-50 text-red-600 group"
          >
            <span class="text-xl flex-shrink-0">🚪</span>
            <span [class]="isCollapsed() && !isMobileMenuOpen() ? 'hidden' : 'block'" class="font-medium">
              Logout
            </span>
          </button>

          <!-- Desktop Collapse Toggle -->
          <button
            class="hidden lg:flex items-center justify-center w-full py-3 rounded-2xl transition-all hover:bg-warmly-bg"
            (click)="toggleCollapse()"
          >
            <span class="text-xl">{{ isCollapsed() ? '→' : '←' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Menu Button -->
    <button
      class="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white rounded-2xl shadow-warmly-lg"
      (click)="toggleMobileMenu()"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `,
  styles: []
})
export class FloatingSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  currentUser = this.authService.currentUser;

  navItems = [
    { route: '/ai-manager', label: 'AI Manager', icon: '🤖', badge: null },
    { route: '/leads', label: 'Leads', icon: '👥', badge: null },
    { route: '/funnel', label: 'Funnel', icon: '📊', badge: null },
    { route: '/broadcast', label: 'Broadcast', icon: '📢', badge: null },
    // { route: '/conversations', label: 'Conversations', icon: '💬', badge: null },
    { route: '/settings', label: 'Settings', icon: '⚙️', badge: null }
  ];

  sidebarClasses() {
    const baseClasses = 'bg-white/95 backdrop-blur-xl shadow-warmly-2xl border-r border-warmly-border';
    
    // Mobile: full width when open, hidden when closed
    if (this.isMobileMenuOpen()) {
      return `${baseClasses} w-72`;
    }
    
    // Desktop: collapsed or expanded
    const desktopClasses = this.isCollapsed() 
      ? 'hidden lg:block lg:w-20' 
      : 'hidden lg:block lg:w-72';
    
    return `${baseClasses} ${desktopClasses}`;
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  onNavClick() {
    // Close mobile menu when navigating
    if (this.isMobileMenuOpen()) {
      this.toggleMobileMenu();
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
