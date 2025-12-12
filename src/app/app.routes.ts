import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/events',
    pathMatch: 'full'
  },
  {
    path: 'events',
    loadComponent: () => import('./components/event-list/event-list.component')
      .then(m => m.EventListComponent)
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./components/event-detail/event-detail.component')
      .then(m => m.EventDetailComponent)
  },
  {
    path: 'create-event',
    loadComponent: () => import('./components/create-event/create-event.component')
      .then(m => m.CreateEventComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-event/:id',  // ← ADD THIS LINE
    loadComponent: () => import('./components/create-event/create-event.component')
      .then(m => m.CreateEventComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/events'
  }
];