import { Injectable, signal } from '@angular/core';
import { DeployedStack } from './warmly-deployment.service';

@Injectable({
  providedIn: 'root'
})
export class DeployedAIsService {
  private readonly STORAGE_KEY = 'warmly_deployed_ais';
  
  deployedAIs = signal<DeployedStack[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const ais = JSON.parse(stored);
        this.deployedAIs.set(ais);
      } catch (e) {
        console.error('Error loading deployed AIs:', e);
        this.deployedAIs.set([]);
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.deployedAIs()));
  }

  addDeployedAI(stack: DeployedStack) {
    const current = this.deployedAIs();
    const existing = current.findIndex(
      s => s.clientId === stack.clientId && s.stackName === stack.stackName
    );

    if (existing >= 0) {
      // Update existing
      current[existing] = stack;
      this.deployedAIs.set([...current]);
    } else {
      // Add new
      this.deployedAIs.set([...current, stack]);
    }

    this.saveToStorage();
  }

  removeDeployedAI(clientId: string, stackName: string) {
    const current = this.deployedAIs();
    const filtered = current.filter(
      s => !(s.clientId === clientId && s.stackName === stackName)
    );
    this.deployedAIs.set(filtered);
    this.saveToStorage();
  }

  getDeployedAI(clientId: string, stackName: string): DeployedStack | undefined {
    return this.deployedAIs().find(
      s => s.clientId === clientId && s.stackName === stackName
    );
  }

  getAllDeployedAIs(): DeployedStack[] {
    return this.deployedAIs();
  }
}


