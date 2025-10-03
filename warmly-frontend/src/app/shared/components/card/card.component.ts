import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardVariant = 'default' | 'elevated' | 'glass';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || subtitle" class="mb-4">
        <h3 *ngIf="title" class="text-lg font-semibold text-warmly-text-primary">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-warmly-text-muted mt-1">{{ subtitle }}</p>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding: string = 'p-6';

  get cardClasses(): string {
    const baseClasses = 'rounded-warmly-xl transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-white border border-warmly-border',
      elevated: 'bg-white shadow-warmly-card',
      glass: 'glass shadow-warmly-glass'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${this.padding}`;
  }
}

