import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warmth-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      {{ label }} {{ score }}
    </span>
  `,
  styles: []
})
export class WarmthBadgeComponent {
  @Input() score: number = 0;

  get level(): 'cool' | 'warm' | 'hot' {
    if (this.score <= 39) return 'cool';
    if (this.score <= 69) return 'warm';
    return 'hot';
  }

  get label(): string {
    const labels = {
      cool: 'Cool',
      warm: 'Warm',
      hot: 'Hot'
    };
    return labels[this.level];
  }

  get badgeClasses(): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1';
    const variantClasses = {
      cool: 'bg-blue-100 text-blue-700 border border-blue-200',
      warm: 'bg-orange-100 text-orange-700 border border-orange-200',
      hot: 'bg-red-100 text-red-700 border border-red-200'
    };
    return `${baseClasses} ${variantClasses[this.level]}`;
  }
}

