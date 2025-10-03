import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <!-- Register Modal -->
    <div *ngIf="showRegister" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="showRegister = false">
      <div class="bg-white rounded-3xl shadow-warmly-2xl p-8 max-w-md w-full" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-warmly-text-primary">Create Account</h2>
          <button (click)="showRegister = false" class="text-warmly-text-muted hover:text-warmly-text-primary">✕</button>
        </div>

        <div *ngIf="errorMessage()" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-warmly-lg text-red-700 text-sm">
          {{ errorMessage() }}
        </div>

        <div class="space-y-4">
          <app-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            [(value)]="registerEmail"
          />
          
          <app-input
            label="Password"
            type="password"
            placeholder="••••••••"
            [(value)]="registerPassword"
          />

          <app-input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            [(value)]="registerPasswordConfirm"
          />

          <app-button
            variant="primary"
            [fullWidth]="true"
            [disabled]="isLoading()"
            (buttonClick)="register()"
          >
            {{ isLoading() ? 'Creating account...' : 'Create Account' }}
          </app-button>
        </div>
      </div>
    </div>

    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-warmly-bg via-white to-warmly-bg/50 p-4">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-warmly mb-4 shadow-warmly-lg">
            <span class="text-4xl font-bold text-white">W</span>
          </div>
          <h1 class="text-4xl font-bold text-warmly-text-primary mb-2">Warmly</h1>
          <p class="text-warmly-text-secondary">Sign in to your account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-warmly-xl p-8 border border-warmly-border">
          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-warmly-lg text-red-700 text-sm">
            {{ errorMessage() }}
          </div>

          <!-- Email/Password Form -->
          <form (ngSubmit)="loginWithEmail()" class="space-y-4 mb-6">
            <app-input
              label="Email"
              type="email"
              placeholder="you@example.com"
              [(value)]="email"
            />
            
            <app-input
              label="Password"
              type="password"
              placeholder="••••••••"
              [(value)]="password"
            />

            <app-button
              variant="primary"
              [fullWidth]="true"
              [disabled]="isLoading()"
              type="submit"
            >
              {{ isLoading() ? 'Signing in...' : 'Sign in' }}
            </app-button>
          </form>

          <!-- Divider -->
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-warmly-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-warmly-text-secondary">Or continue with</span>
            </div>
          </div>

          <!-- Google Sign In -->
          <button
            (click)="loginWithGoogle()"
            [disabled]="isLoading()"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-warmly-border rounded-warmly-lg hover:bg-warmly-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-warmly-text-primary font-medium">Continue with Google</span>
          </button>

          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-warmly-text-secondary">
              Don't have an account?
              <button 
                (click)="showRegister = true"
                class="text-warmly-primary hover:text-warmly-primary-dark font-medium ml-1"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p class="mt-8 text-center text-sm text-warmly-text-secondary">
          © 2025 Warmly. All rights reserved.
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  registerEmail = '';
  registerPassword = '';
  registerPasswordConfirm = '';
  
  showRegister = false;
  isLoading = signal(false);
  errorMessage = signal('');

  loginWithEmail() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginWithEmail(this.email, this.password).subscribe({
      next: () => {
        // Pequeno delay para garantir que o auth state foi atualizado
        setTimeout(() => {
          this.isLoading.set(false);
          this.navigateAfterLogin();
        }, 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // Pequeno delay para garantir que o auth state foi atualizado
        setTimeout(() => {
          this.isLoading.set(false);
          this.navigateAfterLogin();
        }, 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  register() {
    if (!this.registerEmail || !this.registerPassword) {
      this.errorMessage.set('Please fill all fields');
      return;
    }

    if (this.registerPassword !== this.registerPasswordConfirm) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerEmail, this.registerPassword).subscribe({
      next: () => {
        setTimeout(() => {
          this.isLoading.set(false);
          this.navigateAfterLogin();
        }, 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  private navigateAfterLogin() {
    // Sempre redireciona para onboarding primeiro, que vai checar se já tem persona
    this.router.navigate(['/onboarding/persona']);
  }

  private getErrorMessage(error: any): string {
    const code = error?.code || error?.error?.code;
    
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

