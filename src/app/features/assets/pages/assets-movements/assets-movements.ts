import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

type MovFormMode = 'create' | 'view';

@Component({
  selector: 'app-assets-movements',
  standalone: false,
  templateUrl: './assets-movements.html',
  styleUrl: './assets-movements.css',
})
export class AssetsMovements implements OnInit {
  todasMovimentacoes = [
    { id: 'MOV-0028', tipo: 'Transferência', tipoClass: 'tipo-transferencia', bem: 'Notebook Dell Latitude 5420', tombamento: '1', de: 'TI - Sede', para: 'Financeiro', responsavel: 'Ana Paula Ferreira', data: '30/05/2026', os: '—', obs: 'Realocação por solicitação da gerência.' },
    { id: 'MOV-0027', tipo: 'Manutenção', tipoClass: 'tipo-manutencao', bem: 'Ar Condicionado 12k BTU', tombamento: '2', de: 'Vendas', para: 'Vendas', responsavel: 'Bruno Costa', data: '28/05/2026', os: 'OS-0091', obs: 'Manutenção preventiva anual.' },
    { id: 'MOV-0026', tipo: 'Transferência', tipoClass: 'tipo-transferencia', bem: 'Cadeira Ergonômica Pro', tombamento: '3', de: 'Financeiro', para: 'Diretoria', responsavel: 'Carla Ribeiro', data: '27/05/2026', os: '—', obs: '' },
    { id: 'MOV-0025', tipo: 'Baixa', tipoClass: 'tipo-baixa', bem: 'Projetor Epson X41', tombamento: '4', de: 'Adm.', para: '—', responsavel: 'Diego Santana', data: '25/05/2026', os: '—', obs: 'Bem obsoleto. Parecer técnico nº 12/2026.' },
    { id: 'MOV-0024', tipo: 'Manutenção', tipoClass: 'tipo-manutencao', bem: 'Servidor PowerEdge R740', tombamento: '5', de: 'TI - Infra', para: 'TI - Infra', responsavel: 'Felipe Gomes', data: '22/05/2026', os: 'OS-0088', obs: 'Substituição de fonte redundante.' },
    { id: 'MOV-0023', tipo: 'Transferência', tipoClass: 'tipo-transferencia', bem: 'Monitor Dell 24"', tombamento: '6', de: 'TI - Infra', para: 'TI - Sede', responsavel: 'Elisa Lima', data: '20/05/2026', os: '—', obs: '' },
    { id: 'MOV-0022', tipo: 'Baixa', tipoClass: 'tipo-baixa', bem: 'Teclado USB Antigo', tombamento: '12', de: 'Adm.', para: '—', responsavel: 'Carla Ribeiro', data: '18/05/2026', os: '—', obs: 'Descarte por dano irreparável.' },
  ];

  activeTab: 'Todos' | 'Transferência' | 'Manutenção' | 'Baixa' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isFormOpen = false;
  formMode: MovFormMode = 'create';
  selectedMov: any = null;

  get filtradas() {
    if (this.activeTab !== 'Todos') return this.todasMovimentacoes.filter(m => m.tipo === this.activeTab);
    return this.todasMovimentacoes;
  }

  get totalPaginas() { return Math.ceil(this.filtradas.length / this.itensPorPagina); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filtradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  get totalTransferencias() { return this.todasMovimentacoes.filter(m => m.tipo === 'Transferência').length; }
  get totalManutencoes() { return this.todasMovimentacoes.filter(m => m.tipo === 'Manutenção').length; }
  get totalBaixas() { return this.todasMovimentacoes.filter(m => m.tipo === 'Baixa').length; }

  setTab(tab: 'Todos' | 'Transferência' | 'Manutenção' | 'Baixa') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(p: number) { this.paginaAtual = p; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreate() {
    this.formMode = 'create';
    this.selectedMov = null;
    this.isFormOpen = true;
  }

  openView(mov: any) {
    this.formMode = 'view';
    this.selectedMov = mov;
    this.isFormOpen = true;
  }

  closeForm() { this.isFormOpen = false; }

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar por bem, tombamento ou responsável...',
      showSearch: true,
      primaryButtonLabel: 'Nova Movimentação',
      primaryButtonIcon: 'ph ph-arrows-left-right'
    });
  }
}
