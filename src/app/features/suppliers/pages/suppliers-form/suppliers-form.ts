import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-suppliers-form',
  standalone: false,
  templateUrl: './suppliers-form.html',
  styleUrl: './suppliers-form.css',
})
export class SuppliersForm {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() supplier: any = null;

  @Output() close = new EventEmitter<void>();

  closeDrawer(): void {
    this.close.emit();
  }
}