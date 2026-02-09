import {Component, inject} from '@angular/core';
import {UserService} from '../../servicers/user-data';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../models/user';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {NgClass} from '@angular/common';

@Component({
  selector: 'user-create',
  imports: [
    ReactiveFormsModule,
    NgClass,
  ],
  template: `
    <div class="modal-header">
      <h4 class="modal-title fs-5" id="exampleModalLabel">Add New User</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="bsModalRef.hide()"></button>
    </div>
    <div class="modal-body">
      <form [formGroup]="createUserProfileForm">
        <div class="mb-3">
          @let name = createUserProfileForm.get('name')!;
          @let invalidName = name.invalid && (name.dirty || name.touched);
          <label for="userName" class="form-label">User Name</label>
          <input type="text"
                 class="form-control"
                 [ngClass]="{'is-invalid': invalidName}"
                 id="userName"
                 formControlName="name">
          @if (invalidName) {
            <div class="validation-message invalid">
              @if (name.hasError('required')) {
                <div>Name is required</div>
              }
              @if (name.hasError('maxlength')) {
                <div>Max length is 100</div>
              }
              @if (name.hasError('pattern')) {
                <div>Invalid name</div>
              }
              @if (name.hasError('nameNotUnique')) {
                <div>Name must be unique. This name is already taken</div>
              }
            </div>
          }
        </div>
        <div class="mb-3">
          @let primaryEmail = createUserProfileForm.get('primaryEmail')!;
          @let invalidPrimaryEmail = primaryEmail.invalid && (primaryEmail.dirty || primaryEmail.touched);

          <label for="primaryEmail" class="form-label">Primary Email</label>
          <input type="email"
                 class="form-control"
                 [ngClass]="{'is-invalid': invalidPrimaryEmail}"
                 id="primaryEmail"
                 formControlName="primaryEmail">
          @if (invalidPrimaryEmail) {
            <div class="validation-message invalid">
              @if (primaryEmail.hasError('required')) {
                <div>Primary Email is required</div>
              }
              @if (primaryEmail.hasError('email')) {
                <div>Please enter valid email address</div>
              }
            </div>
          }
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="bsModalRef.hide()">Close</button>
      <button type="button" class="btn btn-primary"
              (click)="createUserProfile()"
              [disabled]="!createUserProfileForm.valid">Create</button>
    </div>
  `,
  styles: `

  `
})
export class UserCreate {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  public bsModalRef = inject(BsModalRef);

  createUserProfileForm = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z0-9 -]*$/)
    ]],
    primaryEmail: ['', [Validators.required, Validators.email]],
    additionalEmails: this.fb.array([])
  });

  protected createUserProfile() {
    const userModel: User = this.createUserProfileForm.getRawValue() as User;
    this.userService.createUser(userModel)
      .pipe(catchError(({error}: HttpErrorResponse) => {
        if (error.error === "NAME_IS_NOT_UNIQUE") {
          const nameField = this.createUserProfileForm.get('name')!;
          nameField.setErrors({'nameNotUnique': true});
          nameField.markAsTouched();
        }
        return EMPTY;
      }))
      .subscribe(() => {
        this.userService.loadUserList()
        this.bsModalRef.hide();
      })

  }
}
