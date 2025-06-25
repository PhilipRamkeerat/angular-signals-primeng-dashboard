import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
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
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'Administrator' },
    { id: 2, username: 'user1', password: 'user123', email: 'user1@example.com', role: 'User' },
    { id: 3, username: 'demo', password: 'demo123', email: 'demo@example.com', role: 'Demo User' }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    this.checkStoredAuth();
  }

  login(credentials: LoginCredentials): Observable<User> {
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
          this.setCurrentUser(user);
          return user;
        })
      );
    } else {
      return throwError(() => new Error('Invalid username or password'));
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
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