import { Routes } from '@angular/router';
import { UserProfile } from './users/components/user-info/user-profile';
import { UserList } from './users/components/user-list/user-list';
import { canDeactivateGuard } from './users/guards/can-deactivate';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'user', component: UserList},
  {
    path: 'user/:id',
    component: UserProfile,
    canDeactivate: [canDeactivateGuard],
  },
  { path: '**', redirectTo: 'user' },
];
