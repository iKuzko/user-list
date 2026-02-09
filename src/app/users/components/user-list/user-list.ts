import {Component, inject, WritableSignal} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {AsyncPipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'user-list',
  imports: [
    RouterLink
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  users: WritableSignal<User[]>;

  private userService = inject(UserService);

  constructor() {
    this.users = this.userService.userList;
    this.userService.loadUserList();
  }

  public deleteUser(id: number) {
    this.userService.deleteUser(id);
  }
}
