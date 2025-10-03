import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-floating-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div 
      [class]="sidebarClasses"
      class="fixed left-6 top-6 bottom-6 z-50 transition-all duration-300 glass rounded-3xl shadow-warmly-glass p-4"
    >
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div *ngIf="!collapsed()" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg gradient-warmly flex items-center justify-center">
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <span class="font-semibold text-warmly-text-primary">Warmly</span>
          </div>
          <button
            (click)="toggleCollapsed()"
            class="h-8 w-8 p-0 hover:bg-white/20 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <svg *ngIf="collapsed()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg *ngIf="!collapsed()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-2">
          <a
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="active"
            [class]="getItemClasses()"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <div class="relative">
              <span [innerHTML]="item.icon" class="w-5 h-5"></span>
              <div *ngIf="item.badge" class="absolute -top-1 -right-1 bg-warmly-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {{ item.badge > 99 ? '99+' : item.badge }}
              </div>
            </div>
            <span *ngIf="!collapsed()" class="font-medium">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Footer Status -->
        <div *ngIf="!collapsed()" class="pt-6 border-t border-white/20">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-warmly-success rounded-full animate-pulse"></div>
              <span class="text-sm text-warmly-text-muted">WhatsApp Connected</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-warmly-primary rounded-full"></div>
              <span class="text-sm text-warmly-text-muted">Persona Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .active {
      @apply bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-warmly-fab;
    }
  `]
})
export class FloatingSidebarComponent {
  collapsed = signal(false);

  @Output() collapsedChange = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
    { 
      id: 'ai-manager', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>', 
      label: 'AI Manager', 
      route: '/ai-manager' 
    },
    { 
      id: 'conversations', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>', 
      label: 'Conversations', 
      route: '/conversations',
      badge: 5
    },
    { 
      id: 'leads', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>', 
      label: 'Leads', 
      route: '/leads' 
    },
    { 
      id: 'funnel', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>', 
      label: 'Funnel', 
      route: '/funnel' 
    },
    { 
      id: 'broadcast', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>', 
      label: 'Broadcast', 
      route: '/broadcast' 
    },
    { 
      id: 'settings', 
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>', 
      label: 'Settings', 
      route: '/settings' 
    }
  ];

  get sidebarClasses(): string {
    return this.collapsed() ? 'w-24' : 'w-72';
  }

  getItemClasses(): string {
    return this.collapsed() ? 'justify-center px-3' : '';
  }

  toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
    this.collapsedChange.emit(this.collapsed());
  }
}

