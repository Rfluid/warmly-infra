import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { WarmthBadgeComponent } from '../../shared/components/warmth-badge/warmth-badge.component';

@Component({
  selector: 'app-funnel',
  standalone: true,
  imports: [CommonModule, WarmthBadgeComponent],
  template: `
    <div class="p-8 space-y-6">
      <h1 class="text-3xl font-bold text-warmly-text-primary">Sales Funnel</h1>
      
      <div class="grid grid-cols-5 gap-4">
        <div *ngFor="let column of columns" class="glass rounded-warmly-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-warmly-text-primary">{{ column.name }}</h3>
            <span class="px-2 py-1 bg-warmly-primary/10 text-warmly-primary text-sm rounded-full">{{ column.leads.length }}</span>
          </div>
          
          <div class="space-y-3">
            <div *ngFor="let lead of column.leads" class="bg-white p-3 rounded-warmly-md shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div class="flex items-start gap-2 mb-2">
                <img [src]="lead.avatar" [alt]="lead.name" class="w-8 h-8 rounded-full"/>
                <div class="flex-1">
                  <p class="font-medium text-sm">{{ lead.name }}</p>
                  <p class="text-xs text-warmly-text-muted">{{ lead.company }}</p>
                </div>
              </div>
              <app-warmth-badge [score]="lead.warmth" />
              <p *ngIf="lead.value" class="text-sm text-warmly-text-muted mt-2">{{ lead.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FunnelComponent {
  columns = [
    {
      name: 'Inactive',
      leads: [
        { name: 'John Doe', company: 'Acme', warmth: 25, avatar: 'https://i.pravatar.cc/150?img=4', value: '$5K' }
      ]
    },
    {
      name: 'Active',
      leads: [
        { name: 'Sarah Chen', company: 'TechCorp', warmth: 75, avatar: 'https://i.pravatar.cc/150?img=1', value: '$25K' },
        { name: 'Marcus Rodriguez', company: 'Startup', warmth: 45, avatar: 'https://i.pravatar.cc/150?img=2', value: '$15K' }
      ]
    },
    {
      name: 'Waiting Contact',
      leads: [
        { name: 'Lisa Thompson', company: 'BigCo', warmth: 85, avatar: 'https://i.pravatar.cc/150?img=3', value: '$50K' }
      ]
    },
    {
      name: 'Won',
      leads: []
    },
    {
      name: 'Lost',
      leads: []
    }
  ];
}

