import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoaderService} from './users/servicers/loader';
import {ToastsList} from './users/components/toasts/toasts-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('easy-morph-test');
  protected readonly loaderService = inject(LoaderService);
}
