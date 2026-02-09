import { Routes } from '@angular/router';
import { UserProfile } from './users/components/user-info/user-profile';
import {UserList} from './users/components/user-list/user-list';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'user', component: UserList},
  {
    path: 'user/:id',
    component: UserProfile,
    canDeactivate: [(component: UserProfile) => component.canDeactivate()],
  },
  { path: '**', redirectTo: 'user' },
];
