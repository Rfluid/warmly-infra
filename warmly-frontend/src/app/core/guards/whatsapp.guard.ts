import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

// Mock guard - em produção, checaria status real do WhatsApp
export const whatsappGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Mock: sempre permite (em produção, checaria API)
  const isConnected = true; // TODO: Check real WhatsApp status

  if (!isConnected) {
    router.navigate(['/whatsapp']);
    return false;
  }

  return true;
};


