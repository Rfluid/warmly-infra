import { Injectable, signal } from '@angular/core';
import { Observable, interval, of, delay } from 'rxjs';
import { map, take } from 'rxjs/operators';

export type WhatsAppStatus = 'disconnected' | 'qr' | 'connecting' | 'connected';

export interface WhatsAppSession {
  status: WhatsAppStatus;
  qrDataUrl?: string;
  connectedPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  status = signal<WhatsAppStatus>('disconnected');
  qrCode = signal<string | null>(null);
  connectedPhone = signal<string | null>(null);

  private readonly STORAGE_KEY = 'warmly_wa_status';
  private mockMode = true; // For demo purposes

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.status.set(data.status);
        this.connectedPhone.set(data.connectedPhone);
      } catch (e) {
        console.error('Failed to parse WhatsApp status:', e);
      }
    }
  }

  private saveToStorage(): void {
    const data = {
      status: this.status(),
      connectedPhone: this.connectedPhone()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Get current session status
  getSession(): Observable<WhatsAppSession> {
    return of({
      status: this.status(),
      qrDataUrl: this.qrCode() || undefined,
      connectedPhone: this.connectedPhone() || undefined
    });
  }

  // Initialize connection (shows QR code)
  connect(): Observable<WhatsAppSession> {
    if (this.mockMode) {
      return this.mockConnect();
    }

    // In production, this would make an API call to the backend
    // return this.http.post<WhatsAppSession>(`${this.baseUrl}/api/whatsapp/connect`, {});
    return this.mockConnect();
  }

  // Mock connection flow for demo
  private mockConnect(): Observable<WhatsAppSession> {
    this.status.set('qr');
    
    // Generate a fake QR code (in production, this comes from the backend)
    const fakeQR = this.generateFakeQRCode();
    this.qrCode.set(fakeQR);
    this.saveToStorage();

    // Simulate QR scan after 8 seconds
    setTimeout(() => {
      this.status.set('connecting');
      this.saveToStorage();
      
      setTimeout(() => {
        this.status.set('connected');
        this.connectedPhone.set('+55 11 98765-4321');
        this.qrCode.set(null);
        this.saveToStorage();
      }, 2000);
    }, 8000);

    return of({
      status: 'qr',
      qrDataUrl: fakeQR
    });
  }

  // Disconnect/logout
  disconnect(): Observable<void> {
    this.status.set('disconnected');
    this.qrCode.set(null);
    this.connectedPhone.set(null);
    this.saveToStorage();
    return of(void 0);
  }

  // Check if connected
  isConnected(): boolean {
    return this.status() === 'connected';
  }

  // Generate a fake QR code data URL for demo
  private generateFakeQRCode(): string {
    // This is a simple placeholder QR code SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="40" height="40" fill="black"/>
        <rect x="140" y="20" width="40" height="40" fill="black"/>
        <rect x="20" y="140" width="40" height="40" fill="black"/>
        <rect x="80" y="80" width="40" height="40" fill="black"/>
        <rect x="70" y="30" width="10" height="10" fill="black"/>
        <rect x="110" y="50" width="10" height="10" fill="black"/>
        <rect x="150" y="70" width="10" height="10" fill="black"/>
        <rect x="50" y="110" width="10" height="10" fill="black"/>
        <rect x="130" y="130" width="10" height="10" fill="black"/>
        <rect x="90" y="150" width="10" height="10" fill="black"/>
        <text x="100" y="195" font-size="10" text-anchor="middle" fill="gray">Scan with WhatsApp</text>
      </svg>
    `;
    const encoded = btoa(svg);
    return `data:image/svg+xml;base64,${encoded}`;
  }

  // Watch for status changes (for real-time updates via WebSocket)
  watchStatus(): Observable<WhatsAppStatus> {
    // In production, this would listen to WebSocket events
    // For now, just return current status
    return interval(1000).pipe(
      map(() => this.status()),
      take(1)
    );
  }

  // For testing: manually set connected
  setConnected(): void {
    this.status.set('connected');
    this.connectedPhone.set('+55 11 98765-4321');
    this.qrCode.set(null);
    this.saveToStorage();
  }
}


