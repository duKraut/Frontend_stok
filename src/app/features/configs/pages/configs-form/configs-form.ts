import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-configs-form',
  standalone: false,
  templateUrl: './configs-form.html',
  styleUrl: './configs-form.css',
})
export class ConfigsForm {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() user: any = null;

  @Output() close = new EventEmitter<void>();

  modules = [
    { key: 'inventory', label: 'Almoxarifado', icon: 'ph ph-archive-box' },
    { key: 'assets', label: 'Patrimônio', icon: 'ph ph-buildings' },
    { key: 'suppliers', label: 'Fornecedores', icon: 'ph ph-handshake' },
    { key: 'reports', label: 'Relatórios', icon: 'ph ph-chart-bar' },
    { key: 'configs', label: 'Configurações', icon: 'ph ph-gear' },
  ];

  closeDrawer(): void {
    this.close.emit();
  }
}
