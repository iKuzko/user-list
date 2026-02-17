import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal, OnDestroy, signal, TemplateRef, ViewChild,
} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import { Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, EMPTY, Observable, of, Subject, tap} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { isEqual } from 'lodash';
import {CanComponentDeactivate} from '../../guards/can-deactivate';

@Component({
  selector: 'user-info',
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    BsModalService
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
  private modalService = inject(BsModalService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private confirmationSubject = new Subject<boolean>();
  private initialUser: User | undefined;
  public isSameUserData = signal(true);
  public bsModalRef = inject(BsModalRef);

  @ViewChild('confirmTemplate') confirmModal!: TemplateRef<any>;

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

  public canDeactivate(): Observable<boolean> {
    if (this.isSameUserData()) {
      return of(true);
    }
    this.bsModalRef = this.modalService.show(this.confirmModal);
    return this.confirmationSubject.asObservable();
  }

  protected confirm() {
    this.confirmationSubject.next(true);
    this.bsModalRef.hide()
  }

  protected decline() {
    this.confirmationSubject.next(false);
    this.bsModalRef.hide()
  }
}
