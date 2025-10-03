import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Automation, BulkMessage } from '../models/automation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private authService = inject(AuthService);

  automations = signal<Automation[]>([]);
  bulkMessages = signal<BulkMessage[]>([]);

  private readonly AUTOMATIONS_KEY = 'warmly_automations';
  private readonly BULK_KEY = 'warmly_bulk_messages';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedAuto = localStorage.getItem(this.AUTOMATIONS_KEY);
    const storedBulk = localStorage.getItem(this.BULK_KEY);
    
    if (storedAuto) {
      try {
        this.automations.set(JSON.parse(storedAuto));
      } catch (e) {
        console.error('Failed to parse automations:', e);
      }
    }

    if (storedBulk) {
      try {
        this.bulkMessages.set(JSON.parse(storedBulk));
      } catch (e) {
        console.error('Failed to parse bulk messages:', e);
      }
    }
  }

  private saveAutomations(): void {
    localStorage.setItem(this.AUTOMATIONS_KEY, JSON.stringify(this.automations()));
  }

  private saveBulkMessages(): void {
    localStorage.setItem(this.BULK_KEY, JSON.stringify(this.bulkMessages()));
  }

  // Automations
  getAutomations(): Observable<Automation[]> {
    return of(this.automations());
  }

  getAutomation(id: string): Observable<Automation | undefined> {
    return of(this.automations().find(a => a.id === id));
  }

  createAutomation(data: Partial<Automation>): Observable<Automation> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Not authenticated');

    const newAutomation: Automation = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      name: data.name || 'New Automation',
      type: data.type || 'warmth_range',
      active: data.active ?? true,
      filters: data.filters || {},
      schedule: data.schedule,
      template: data.template || '',
      attachments: data.attachments || [],
      successCount: 0,
      failCount: 0,
      createdAt: new Date()
    };

    this.automations.update(autos => [...autos, newAutomation]);
    this.saveAutomations();
    return of(newAutomation);
  }

  updateAutomation(id: string, data: Partial<Automation>): Observable<Automation> {
    const autos = this.automations();
    const index = autos.findIndex(a => a.id === id);
    
    if (index === -1) throw new Error('Automation not found');

    const updated = {
      ...autos[index],
      ...data,
      updatedAt: new Date()
    };

    this.automations.update(autos => {
      const newAutos = [...autos];
      newAutos[index] = updated;
      return newAutos;
    });
    
    this.saveAutomations();
    return of(updated);
  }

  deleteAutomation(id: string): Observable<boolean> {
    this.automations.update(autos => autos.filter(a => a.id !== id));
    this.saveAutomations();
    return of(true);
  }

  toggleAutomation(id: string): Observable<Automation> {
    const auto = this.automations().find(a => a.id === id);
    if (!auto) throw new Error('Automation not found');

    return this.updateAutomation(id, { active: !auto.active });
  }

  // Bulk Messages
  getBulkMessages(): Observable<BulkMessage[]> {
    return of(this.bulkMessages());
  }

  createBulkMessage(data: Partial<BulkMessage>): Observable<BulkMessage> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Not authenticated');

    const newBulk: BulkMessage = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      message: data.message || '',
      attachments: data.attachments || [],
      recipientFilters: data.recipientFilters || {},
      estimatedRecipients: data.estimatedRecipients || 0,
      status: 'draft',
      successCount: 0,
      failCount: 0,
      createdAt: new Date()
    };

    this.bulkMessages.update(bulks => [...bulks, newBulk]);
    this.saveBulkMessages();
    return of(newBulk);
  }

  sendBulkMessage(id: string): Observable<BulkMessage> {
    const bulk = this.bulkMessages().find(b => b.id === id);
    if (!bulk) throw new Error('Bulk message not found');

    // Simulate sending
    const updated = {
      ...bulk,
      status: 'sending' as const,
      sentAt: new Date()
    };

    this.bulkMessages.update(bulks => {
      const index = bulks.findIndex(b => b.id === id);
      const newBulks = [...bulks];
      newBulks[index] = updated;
      return newBulks;
    });
    this.saveBulkMessages();

    // Simulate completion after 3 seconds
    setTimeout(() => {
      const finalUpdate = {
        ...updated,
        status: 'sent' as const,
        actualRecipients: updated.estimatedRecipients,
        successCount: updated.estimatedRecipients,
        failCount: 0
      };

      this.bulkMessages.update(bulks => {
        const index = bulks.findIndex(b => b.id === id);
        const newBulks = [...bulks];
        newBulks[index] = finalUpdate;
        return newBulks;
      });
      this.saveBulkMessages();
    }, 3000);

    return of(updated);
  }

  deleteBulkMessage(id: string): Observable<boolean> {
    this.bulkMessages.update(bulks => bulks.filter(b => b.id !== id));
    this.saveBulkMessages();
    return of(true);
  }
}


