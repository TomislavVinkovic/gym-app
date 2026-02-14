import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { anonymousGuard } from './core/auth/anonymous-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard')
            .then(m => m.Dashboard),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile')
            .then(m => m.Profile),
        canActivate: [authGuard]
    },


    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
        canActivate: [anonymousGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
        canActivate: [anonymousGuard]
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmail),
        canActivate: [authGuard]
    },
];