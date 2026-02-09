import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal, TemplateRef, ViewChild,
} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, EMPTY, Observable, of, Subject} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

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
export class UserProfile {
  readonly id: InputSignal<string> = input.required();
  private userService = inject(UserService);
  private modalService = inject(BsModalService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public bsModalRef = inject(BsModalRef);
  private confirmationSubject = new Subject<boolean>();

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

  get additionalEmails() {
    return this.userProfileFormReactive.get('additionalEmails') as FormArray<FormControl>;
  }

  constructor() {
    effect(() => {
      this.userService.getUser(this.id()).subscribe(result => {
        result.additionalEmails.forEach(() => this.addAdditionalEmail());
        this.userProfileFormReactive.patchValue(result);
      })
    });
  }

  protected removeAdditionalEmail($index: number) {
    this.additionalEmails.removeAt($index);
  }

  protected addAdditionalEmail() {
    this.additionalEmails.push(this.fb.control('', [Validators.email]));
  }

  protected updateUserProfile(event: Event) {
    event.preventDefault();
    const userModel: User = this.userProfileFormReactive.getRawValue() as User;
    this.userService.updateUser(userModel)
      .pipe(catchError(({error}: HttpErrorResponse) => {
        if (error.error === "NAME_IS_NOT_UNIQUE") {
          const nameField = this.userProfileFormReactive.get('name')!;
          nameField.setErrors({'nameNotUnique': true});
          nameField.markAsTouched();
        }
        return EMPTY
      }))
      .subscribe(() => this.navigateToUserList())

  }

  navigateToUserList() {
    return this.router.navigate(['/users']);
  }

  canDeactivate(): Observable<boolean> {
    if (this.userProfileFormReactive.pristine) {
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
