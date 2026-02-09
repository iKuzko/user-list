import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/user';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserApiService {
  private http = inject(HttpClient);

  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(`/api/user`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`/api/user/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/user/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`/api/user`, user);
  }
}
