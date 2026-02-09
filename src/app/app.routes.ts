import { Routes } from '@angular/router';
import { UserProfile } from './users/components/user-info/user-profile';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'user', loadComponent: () => import("./users/components/user-list/user-list").then(c => c.UserList)},
  {
    path: 'user/:id',
    loadComponent: () => import("./users/components/user-info/user-profile").then(c => c.UserProfile),
    canDeactivate: [(component: UserProfile) => component.canDeactivate()],
  },
  { path: '**', redirectTo: 'user' },
];
