// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const currentUser = authService.currentUserValue;
  
  if (currentUser) {
    // Check if route requires admin role
    if (route.data['role'] && route.data['role'].indexOf(currentUser.role) === -1) {
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};