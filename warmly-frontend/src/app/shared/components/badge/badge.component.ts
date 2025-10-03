import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'warmth';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() warmthScore?: number; // For warmth variant

  get badgeClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    };

    const variantClasses = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-gradient-warmly text-white',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      warmth: this.getWarmthClasses()
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  private getWarmthClasses(): string {
    if (this.warmthScore === undefined) return 'bg-gray-100 text-gray-700';
    
    if (this.warmthScore >= 70) {
      return 'bg-red-100 text-red-700 border border-red-200';
    } else if (this.warmthScore >= 40) {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    } else {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  }
}

