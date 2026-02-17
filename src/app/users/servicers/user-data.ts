import {inject, Injectable, signal} from '@angular/core';
import {User} from '../models/user';
import {Observable, tap} from 'rxjs';
import {UserApiService} from './user-api';
import {ToastService} from './toast';

@Injectable({providedIn: 'root'})
export class UserService {
  private userApiService = inject(UserApiService);
  private toastService = inject(ToastService);

  public userList = signal<User[]>([]);

  loadUserList(): void {
     this.userApiService.getUserList().subscribe(result => this.userList.set(result));
  }

  deleteUser(id: number): void {
    this.userApiService.deleteUser(id)
      .pipe(
        tap(() => this.toastService.show({message: 'User profile was deleted', classname: 'bg-danger text-light'})),
      )
      .subscribe(()=> {
        this.loadUserList();
      });
  }

  getUser(id: string): Observable<User> {
    return this.userApiService.getUser(id);
  }

  updateUser(user: User): Observable<User> {
    return this.userApiService.updateUser(user).pipe(
      tap(() => this.toastService.show({message: 'User profile updated', classname: 'bg-success text-light'})),
    );
  }

  createUser(user: User): Observable<User> {
    return this.userApiService.createUser(user).pipe(
      tap(() => this.toastService.show({message: 'User profile created', classname: 'bg-success text-light'})),
    );
  }

}
