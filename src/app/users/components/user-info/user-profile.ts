import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  signal,
} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, EMPTY, tap} from 'rxjs';
import {isEqual} from 'lodash';
import {CanComponentDeactivate} from '../../guards/can-deactivate';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Confirmation} from '../confirmation/confirmation';

@Component({
  selector: 'user-info',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './user-profile.html',
  styles: `
    .placeholder {
      &-label {
        height: 1.5rem;
      }
      &-input {
        height: 2rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfile implements OnDestroy, CanComponentDeactivate {
  readonly id: InputSignal<string> = input.required();
  private userService = inject(UserService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private initialUser: User | undefined;
  public isSameUserData = signal(true);

  userProfileFormReactive = this.fb.group({
    id: [0],
    name: ['', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z0-9 -]*$/)
    ]],
    primaryEmail: ['', [Validators.required, Validators.email]],
    additionalEmails: this.fb.array([])
  });
  private formSubscription = this.userProfileFormReactive.valueChanges.subscribe(() => this.checkIsSame());

  get additionalEmails() {
    return this.userProfileFormReactive.get('additionalEmails') as FormArray<FormControl>;
  }

  constructor() {
    effect(() => {
      this.userService.getUser(this.id()).subscribe(result => {
        this.initialUser = result;
        result.additionalEmails.forEach(() => this.addAdditionalEmail());
        this.userProfileFormReactive.patchValue(result);
      })
    });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  protected removeAdditionalEmail($index: number) {
    this.additionalEmails.removeAt($index);
  }

  protected addAdditionalEmail() {
    this.additionalEmails.push(this.fb.control('', [Validators.email]));
  }

  private getUserDataForSave(): User {
    let user = this.userProfileFormReactive.getRawValue();
    return {
      ...user,
      additionalEmails: user.additionalEmails.filter(email => email !== '')
    } as User;
  }
  protected updateUserProfile(event: Event) {
    event.preventDefault();
    const userModel: User = this.getUserDataForSave();
    this.userService.updateUser(userModel)
      .pipe(
        catchError(({error}: HttpErrorResponse) => {
          if (error.error === "NAME_IS_NOT_UNIQUE") {
            const nameField = this.userProfileFormReactive.get('name')!;
            nameField.setErrors({'nameNotUnique': true});
            nameField.markAsTouched();
          }
          return EMPTY
        }),
        tap((user: User) => this.initialUser = user),
        tap(() => this.checkIsSame()),
      )
      .subscribe(() => this.navigateToUserList());
  }

  public navigateToUserList() {
    return this.router.navigate(['/users']);
  }

  public checkIsSame() {
    this.isSameUserData.set(isEqual(this.initialUser, this.getUserDataForSave()));
  }

  public canDeactivate(): Promise<boolean> {
    if (this.isSameUserData()) {
      return Promise.resolve(true);
    }
    let modal = this.modalService.open(Confirmation);
    modal.componentInstance.title = 'Unsaved changes!';
    modal.componentInstance.body = 'Do you want to discard all unsaved changes?';

    return modal.result.then(()=>true, () => false);
  }
}
