import {Component, inject, WritableSignal} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {RouterLink} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {UserCreate} from '../user-create/user-create';

@Component({
  selector: 'user-list',
  imports: [
    RouterLink
  ],
  providers: [
    BsModalService
  ],
  templateUrl: './user-list.html',
})
export class UserList {
  users: WritableSignal<User[]>;
  bsModalRef?: BsModalRef;

  private userService = inject(UserService);
  private modalService = inject(BsModalService);

  constructor() {
    this.users = this.userService.userList;
    this.userService.loadUserList();
  }

  public deleteUser(id: number) {
    this.userService.deleteUser(id);
  }

  public createUser() {
    this.bsModalRef = this.modalService.show(UserCreate);
  }
}
