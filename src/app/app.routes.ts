import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'user', loadComponent: () => import("./users/components/user-list/user-list").then(c => c.UserList)},
  { path: 'user/:id', loadComponent: () => import("./users/components/user-info/user-profile").then(c => c.UserProfile)},
  { path: '**', redirectTo: 'user' },
];
