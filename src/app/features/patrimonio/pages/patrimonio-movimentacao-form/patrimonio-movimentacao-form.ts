import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

type TipoMov = 'Transferência' | 'Manutenção' | 'Baixa';

@Component({
  selector: 'app-patrimonio-movimentacao-form',
  standalone: false,
  templateUrl: './patrimonio-movimentacao-form.html',
  styleUrl: './patrimonio-movimentacao-form.css',
})
export class PatrimonioMovimentacaoForm implements OnInit {
  @Input() mode: 'create' | 'view' = 'create';
  @Input() movimentacao: any = null;

  @Output() close = new EventEmitter<void>();

  tipoSelecionado: TipoMov = 'Transferência';

  bens = [
    'Notebook Dell Latitude 5420 (Tomb. 1)',
    'Ar Condicionado 12k BTU (Tomb. 2)',
    'Cadeira Ergonômica Pro (Tomb. 3)',
    'Projetor Epson X41 (Tomb. 4)',
    'Servidor PowerEdge R740 (Tomb. 5)',
    'Monitor Dell 24" (Tomb. 6)',
  ];

  departamentos = [
    'TI - Sede', 'TI - Infra', 'Administrativo', 'Financeiro',
    'Almoxarifado', 'Vendas', 'Recursos Humanos', 'Diretoria',
    'Manutenção', 'Recepção'
  ];

  motivosBaixa = [
    'Obsolescência tecnológica',
    'Dano irreparável',
    'Extravio ou furto',
    'Doação',
    'Venda',
    'Perda total (sinistro)',
    'Outro',
  ];

  tiposManutencao = ['Preventiva', 'Corretiva', 'Preditiva'];

  ngOnInit(): void {
    if (this.mode === 'view' && this.movimentacao) {
      this.tipoSelecionado = this.movimentacao.tipo;
    }
  }

  closeDrawer(): void {
    this.close.emit();
  }
}
