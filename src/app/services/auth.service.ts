import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly HARDCODED_USERS = [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'Administrator' }
  ];

  // Signals instead of BehaviorSubjects
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Public readonly signals
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isLoggedIn = computed(() => this._currentUser() !== null);

  constructor() {
    this.checkStoredAuth();
    
    // Effect to automatically save user to localStorage when it changes
    effect(() => {
      const user = this._currentUser();
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }, { allowSignalWrites: true });
  }

  async login(credentials: LoginCredentials): Promise<User> {
    this._isLoading.set(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = this.HARDCODED_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        const userProfile: User = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };

        this._currentUser.set(userProfile);
        return userProfile;
      } else {
        throw new Error('Invalid username or password');
      }
    } finally {
      this._isLoading.set(false);
    }
  }

  // Keep RxJS version for backward compatibility if needed
  loginRx(credentials: LoginCredentials): Observable<User> {
    const user = this.HARDCODED_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      const userProfile: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      return of(userProfile).pipe(
        delay(1000),
        map(user => {
          this._currentUser.set(user);
          return user;
        })
      );
    } else {
      return throwError(() => new Error('Invalid username or password'));
    }
  }

  logout(): void {
    this._currentUser.set(null);
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this._currentUser.set(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  getDemoCredentials(): { username: string; role: string }[] {
    return this.HARDCODED_USERS.map(user => ({
      username: user.username,
      role: user.role
    }));
  }
} 