import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      [class.backdrop-blur-sm]="!blocking"
      [class.backdrop-blur-md]="blocking"
      (click)="onBackdropClick()"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50"></div>
      
      <!-- Modal Content -->
      <div 
        class="relative bg-white rounded-warmly-xl shadow-warmly-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fadeIn"
        [class]="modalClasses"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div *ngIf="title || !blocking" class="flex items-center justify-between p-6 border-b border-warmly-border">
          <div>
            <h2 *ngIf="title" class="text-2xl font-bold text-warmly-text-primary">{{ title }}</h2>
            <p *ngIf="subtitle" class="text-sm text-warmly-text-muted mt-1">{{ subtitle }}</p>
          </div>
          <button 
            *ngIf="!blocking"
            (click)="close()"
            class="text-warmly-text-muted hover:text-warmly-text-primary transition-colors p-1 rounded-lg hover:bg-warmly-bg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-6 overflow-y-auto" [style.max-height]="maxBodyHeight">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div *ngIf="hasFooter" class="flex items-center justify-end gap-3 p-6 border-t border-warmly-border bg-warmly-bg/30">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() blocking = false; // Cannot be closed by clicking backdrop or X
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() hasFooter = false;
  @Output() closeModal = new EventEmitter<void>();

  get modalClasses(): string {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[95vw]'
    };
    return sizeClasses[this.size];
  }

  get maxBodyHeight(): string {
    return this.hasFooter ? 'calc(90vh - 200px)' : 'calc(90vh - 100px)';
  }

  onBackdropClick(): void {
    if (!this.blocking) {
      this.close();
    }
  }

  close(): void {
    if (!this.blocking) {
      this.closeModal.emit();
    }
  }
}


