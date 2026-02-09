import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/user';
import {Observable} from 'rxjs';
import {UserApiService} from './user-api';

@Injectable({providedIn: 'root'})
export class UserService {
  private userApiService = inject(UserApiService);

  public userList = signal<User[]>([]);

  loadUserList(): void {
     this.userApiService.getUserList().subscribe(result => this.userList.set(result));
  }

  deleteUser(id: number): void {
    this.userApiService.deleteUser(id).subscribe(()=>{
      this.loadUserList();
    });
  }

  getUser(id: string): Observable<User> {
    return this.userApiService.getUser(id);
  }

  updateUser(user: User): Observable<User> {
    return this.userApiService.updateUser(user);
  }


  //
  // createUser(user: User): Observable<User> {
  //   return this.http.post<User>(`/api/user`, user);
  // }




}
