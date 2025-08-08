import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // DASHBOARD with children
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./task/pages/task-list/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'task-form',
        loadComponent: () =>
          import('./task/pages/task-form/task-form.component').then((m) => m.TaskFormComponent),
      },
      {
        path: 'task-form/:id',
        loadComponent: () =>
          import('./task/pages/task-form/task-form.component').then((m) => m.TaskFormComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./layout/notifications/notifications.component').then((m) => m.NotificationsComponent),
      },
    ],
  },
];
