import {Component, inject, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirmation',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{title}}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>{{body}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close()">Yes</button>
      <button type="button" class="btn btn-primary" (click)="activeModal.dismiss()">No</button>
    </div>
  `,
})
export class Confirmation {
  activeModal = inject(NgbActiveModal);
  @Input() title: string = '';
  @Input() body: string = '';
}
