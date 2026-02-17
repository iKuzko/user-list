import {Component, inject, WritableSignal} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {RouterLink} from '@angular/router';
import {UserCreate} from '../user-create/user-create';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {Confirmation} from '../confirmation/confirmation';

@Component({
  selector: 'user-list',
  imports: [
    RouterLink
  ],
  providers: [NgbModalConfig, NgbModal],
  templateUrl: './user-list.html',
})
export class UserList {
  users: WritableSignal<User[]>;

  private userService = inject(UserService);
  private modalService = inject(NgbModal);
  private config = inject(NgbModalConfig);

  constructor() {
    this.config.backdrop = 'static';
    this.config.keyboard = false;
    this.users = this.userService.userList;
    this.userService.loadUserList();
  }

  public deleteUser(user: User) {
    let modal = this.modalService.open(Confirmation);
    modal.componentInstance.title = 'Are you sure you want to delete profile?';
    modal.componentInstance.body = `All information associated to ${user.name} profile will be permanently deleted. This operation can not be undone.`;
    modal.result.then(()=>this.userService.deleteUser(user.id), () => null);
  }

  public createUser() {
    this.modalService.open(UserCreate);
  }
}
