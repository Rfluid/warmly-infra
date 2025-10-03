import { Injectable, inject, signal, NgZone } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  user,
  User,
  browserLocalPersistence,
  setPersistence
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, BehaviorSubject } from 'rxjs';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  
  currentUser = signal<AuthUser | null>(null);
  isAuthenticated = signal<boolean>(false);
  
  // Track when auth state is loaded
  private authStateLoadedSubject = new BehaviorSubject<boolean>(false);
  authStateLoaded$ = this.authStateLoadedSubject.asObservable();
  
  user$ = user(this.auth);

  constructor() {
    // Ensure local persistence
    setPersistence(this.auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    // Subscribe to auth state changes within NgZone
    this.user$.subscribe((firebaseUser: User | null) => {
      this.ngZone.run(() => {
        if (firebaseUser) {
          this.currentUser.set({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
          this.isAuthenticated.set(true);
        } else {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
        }
        
        // Mark auth state as loaded
        this.authStateLoadedSubject.next(true);
      });
    });
  }

  // Login with email and password
  loginWithEmail(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    );
  }

  // Login with Google
  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(
      signInWithPopup(this.auth, provider)
    );
  }

  // Register new user
  register(email: string, password: string): Observable<any> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    );
  }

  // Logout
  logout(): Observable<void> {
    return from(
      signOut(this.auth).then(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  // Get current user token (for API calls)
  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}


