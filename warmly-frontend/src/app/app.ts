import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FloatingSidebarComponent } from './layout/floating-sidebar/floating-sidebar.component';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FloatingSidebarComponent],
  template: `
    <div class="min-h-screen relative">
      <app-floating-sidebar (collapsedChange)="onSidebarCollapse($event)" />
      
      <main [class]="mainClasses" class="pt-6 transition-all duration-300">
        <router-outlet />
      </main>
    </div>
  `,
  styles: []
})
export class App {
  sidebarCollapsed = signal(false);

  get mainClasses(): string {
    return this.sidebarCollapsed() ? 'pl-32' : 'pl-80';
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
