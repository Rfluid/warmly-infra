import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    children: [
      {
        path: 'persona',
        loadComponent: () => import('./features/onboarding/persona-wizard/persona-wizard.component').then(m => m.PersonaWizardComponent)
      }
    ]
  },
  {
    path: 'whatsapp',
    canActivate: [authGuard],
    loadComponent: () => import('./features/whatsapp/whatsapp-gate/whatsapp-gate.component').then(m => m.WhatsAppGateComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/ai-manager',
        pathMatch: 'full'
      },
      // {
      //   path: 'conversations',
      //   loadComponent: () => import('./features/conversations/conversations.component').then(m => m.ConversationsComponent)
      // },
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
        path: 'ai-manager',
        loadComponent: () => import('./features/ai-manager/ai-manager.component').then(m => m.AIManagerComponent)
      },
      {
        path: 'ai-manager/create',
        loadComponent: () => import('./features/ai-manager/create-warmly-ai/create-warmly-ai.component').then(m => m.CreateWarmlyAIComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/ai-manager'
  }
];
