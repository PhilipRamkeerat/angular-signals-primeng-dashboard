import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Modern functional guard for authenticated routes
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  
  if (isLoggedIn) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

// Modern functional guard for routes that should only be accessible when NOT authenticated
export const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  
  if (!isLoggedIn) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
}; 