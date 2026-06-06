import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-inventory-form',
  standalone: false,
  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.css',
})
export class InventoryForm {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() item: any = null;

  @Output() close = new EventEmitter<void>();

  unidades = ['UN', 'CX', 'PCT', 'KG', 'LT', 'RL', 'M', 'M²', 'PAR', 'FD', 'GL', 'SC'];

  categorias = [
    'Escritório', 'Limpeza', 'Informática', 'Manutenção',
    'Copa & Cozinha', 'Higiene', 'EPI', 'Elétrico', 'Hidráulico', 'Outros'
  ];

  closeDrawer(): void {
    this.close.emit();
  }
}
