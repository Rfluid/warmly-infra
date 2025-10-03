import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'custom';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-x-auto rounded-warmly-lg border border-warmly-border bg-white">
      <table class="w-full">
        <!-- Header -->
        <thead class="bg-warmly-bg border-b border-warmly-border">
          <tr>
            <th 
              *ngFor="let column of columns" 
              class="px-6 py-4 text-left text-sm font-semibold text-warmly-text-primary"
              [style.width]="column.width"
              [class.cursor-pointer]="column.sortable"
              (click)="column.sortable && onSort(column.key)"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <svg 
                  *ngIf="column.sortable" 
                  class="w-4 h-4 text-warmly-text-muted"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </div>
            </th>
            <th *ngIf="hasActions" class="px-6 py-4 text-right text-sm font-semibold text-warmly-text-primary">
              Actions
            </th>
          </tr>
        </thead>
        
        <!-- Body -->
        <tbody class="divide-y divide-warmly-border">
          <tr *ngFor="let row of data" class="hover:bg-warmly-bg/50 transition-colors">
            <td 
              *ngFor="let column of columns" 
              class="px-6 py-4 text-sm text-warmly-text-secondary"
            >
              <ng-container [ngSwitch]="column.type || 'text'">
                <span *ngSwitchCase="'text'">{{ row[column.key] }}</span>
                <span *ngSwitchCase="'number'">{{ row[column.key] | number }}</span>
                <span *ngSwitchCase="'date'">{{ row[column.key] | date:'short' }}</span>
                <span *ngSwitchCase="'custom'">
                  <ng-content [select]="'[column-' + column.key + ']'"></ng-content>
                </span>
              </ng-container>
            </td>
            <td *ngIf="hasActions" class="px-6 py-4 text-right">
              <ng-content select="[actions]"></ng-content>
            </td>
          </tr>
          
          <!-- Empty State -->
          <tr *ngIf="!data || data.length === 0">
            <td [attr.colspan]="columns.length + (hasActions ? 1 : 0)" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center gap-3">
                <svg class="w-16 h-16 text-warmly-text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="text-warmly-text-muted">{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() hasActions = false;
  @Input() emptyMessage = 'No data available';
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  onSort(key: string): void {
    this.sortChange.emit({ key, direction: 'asc' });
  }
}

