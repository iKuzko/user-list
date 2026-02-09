import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  signal,
} from '@angular/core';
import {User} from '../../models/user';
import {UserService} from '../../servicers/user-data';
import {
  applyEach,
  email,
  form,
  FormField,
  maxLength, pattern,
  required,
  schema,
} from '@angular/forms/signals';
import {Router, RouterLink} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError} from 'rxjs';

@Component({
  selector: 'user-info',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfile {
  readonly id: InputSignal<string> = input.required();
  private userService = inject(UserService);
  private initialFormData: User = {id: -1, name: '', primaryEmail: '', additionalEmails: []};
  private userProfileSchema = schema<User>((root) => {
    required(root.name, {message: 'Name is required'});
    maxLength(root.name, 100, {message: 'Max length is 100'});
    pattern(root.name, /^[a-zA-Z0-9 -]*$/, {message: 'Invalid name'});
    required(root.primaryEmail, {message: 'Primary Email is required'});
    email(root.primaryEmail, { message: 'Please enter valid email address'});
    applyEach(root.additionalEmails, (emailPath) => {
      email(emailPath, { message: 'Please enter valid email address'})
    });
  });


  userProfileModel = signal<User>(this.initialFormData);
  userProfileForm = form<User>(this.userProfileModel, this.userProfileSchema);

  private fb = inject(FormBuilder);
  router = inject(Router);

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
        this.userProfileModel.set(result as User)
        // result.additionalEmails.forEach(email => this.additionalEmails.push(this.fb.control(email, [Validators.email])));
        result.additionalEmails.forEach(email => this.addAdditionalEmail());
        this.userProfileFormReactive.patchValue(result);
      }, (error: HttpErrorResponse) => {
        console.error(error);
      })
    });
  }

  ngOnInit(): void {
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
        return error.error;
      }))
      .subscribe(result => {
        this.navigateToUserList();
      })

  }

  navigateToUserList() {
    return this.router.navigate(['/users']);
  }

}
