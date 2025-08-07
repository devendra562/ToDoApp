import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'tasks',
        loadComponent: () => import('./task/pages/task-list/task-list.component').then(m => m.TaskListComponent)
    },
    {
        path: 'task-form',
        loadComponent: () => import('./task/pages/task-form/task-form.component').then(m => m.TaskFormComponent)
    },
    {
        path: 'task-form/:id',
        loadComponent: () => import('./task/pages/task-form/task-form.component').then(m => m.TaskFormComponent)
    },
    {
        path: 'notifications',
        loadComponent: () => import('./layout/notifications/notifications.component').then(m => m.NotificationsComponent)
    }
    
];
