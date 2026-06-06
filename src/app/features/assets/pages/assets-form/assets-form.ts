import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-assets-form',
  standalone: false,
  templateUrl: './assets-form.html',
  styleUrl: './assets-form.css',
})
export class AssetsForm {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() bem: any = null;

  @Output() close = new EventEmitter<void>();

  categorias = [
    'Informática', 'Mobiliário', 'Equipamentos de Escritório', 'Veículos',
    'Eletrônicos', 'Máquinas e Equipamentos', 'Infraestrutura', 'Outros'
  ];

  departamentos = [
    'TI - Sede', 'TI - Infra', 'Administrativo', 'Financeiro',
    'Almoxarifado', 'Vendas', 'Recursos Humanos', 'Diretoria',
    'Manutenção', 'Recepção'
  ];

  metodos = ['Linear', 'Soma dos Dígitos', 'Unidades Produzidas'];

  closeDrawer(): void {
    this.close.emit();
  }
}
