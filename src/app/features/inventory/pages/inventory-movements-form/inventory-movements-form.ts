import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-inventory-movements-form',
  standalone: false,
  templateUrl: './inventory-movements-form.html',
  styleUrl: './inventory-movements-form.css',
})
export class InventoryMovementsForm implements OnInit {
  @Input() mode: 'create' | 'view' = 'create';
  @Input() movimentacao: any = null;

  @Output() close = new EventEmitter<void>();

  tipoSelecionado: 'Entrada' | 'Saída' = 'Entrada';

  itens = [
    'Papel A4 Sulfite 75g (SUP-OFF-001)',
    'Detergente Líquido 5L (CLN-LIQ-042)',
    'Cabo HDMI 2.0 3m (IT-ACC-119)',
    'Lâmpada LED 9W Bivolt (MAINT-LIG-004)',
    'Café Torrado e Moído 500g (KIT-FNB-008)',
    'Caneta Esferográfica Azul (SUP-OFF-015)',
    'Desinfetante Pinho 2L (CLN-LIQ-055)',
    'Fita Crepe 18mm (SUP-OFF-088)',
    'Sabonete Líquido 1L (CLN-LIQ-012)',
  ];

  setores = [
    'TI / Suporte', 'Almoxarifado', 'Administrativo',
    'Copa / Térreo', 'Copa / 2º Andar', 'Limpeza / Térreo',
    'Manutenção', 'Banheiros / 1º Andar', 'Banheiros / 2º Andar',
    'Recepção', 'Diretoria',
  ];

  ngOnInit(): void {
    if (this.mode === 'view' && this.movimentacao) {
      this.tipoSelecionado = this.movimentacao.tipo;
    }
  }

  closeDrawer(): void {
    this.close.emit();
  }
}
