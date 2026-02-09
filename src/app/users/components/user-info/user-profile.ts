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
  applyEach, debounce,
  email,
  form,
  FormField,
  maxLength, pattern,
  required,
  schema, submit, ValidationError,
} from '@angular/forms/signals';
import {RouterLink} from '@angular/router';
import {catchError, EMPTY, firstValueFrom} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'user-info',
  imports: [
    FormField,
    RouterLink,
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
    // debounce(root.name, 500);
    // validateHttp(root.name, {
    //   request: ({value}) => `/api/user/check-username/${value()}`,
    //   onSuccess: (response: any) => {
    //     if (response.taken) {
    //       return {
    //         kind: 'usernameTaken',
    //         message: 'Name is already taken',
    //       };
    //     }
    //     return null;
    //   },
    //   onError: (error) => ({
    //     kind: 'networkError',
    //     message: 'Could not verify username availability',
    //   }),
    // });
  });


  userProfileModel = signal<User>(this.initialFormData);
  userProfileForm = form<User>(this.userProfileModel, this.userProfileSchema);

  constructor() {
    effect(() => {
      this.userService.getUser(this.id()).subscribe(result => this.userProfileModel.set(result as User))
    });
  }

  ngOnInit(): void {
  }


  protected removeAdditionalEmail($index: number) {
    this.userProfileModel.update(profile => ({
      ...profile,
      additionalEmails: profile.additionalEmails.toSpliced($index, 1)
    }));
  }

  protected addAdditionalEmail() {
    this.userProfileModel.update(profile => ({
      ...profile,
      additionalEmails: [...profile.additionalEmails, '']
    }));
  }

  protected updateUserProfile(event: Event) {
    event.preventDefault();
    const userModel = this.userProfileForm().value();
    console.log('Logging in with:', userModel);

    this.userService.updateUser(userModel)

  }



}
