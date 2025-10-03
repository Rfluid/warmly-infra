import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/ai-manager',
    pathMatch: 'full'
  },
  {
    path: 'ai-manager',
    loadComponent: () => import('./features/ai-manager/ai-manager.component').then(m => m.AIManagerComponent)
  },
  {
    path: 'conversations',
    loadComponent: () => import('./features/conversations/conversations.component').then(m => m.ConversationsComponent)
  },
  {
    path: 'leads',
    loadComponent: () => import('./features/leads/leads.component').then(m => m.LeadsComponent)
  },
  {
    path: 'funnel',
    loadComponent: () => import('./features/funnel/funnel.component').then(m => m.FunnelComponent)
  },
  {
    path: 'broadcast',
    loadComponent: () => import('./features/broadcast/broadcast.component').then(m => m.BroadcastComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '**',
    redirectTo: '/ai-manager'
  }
];
