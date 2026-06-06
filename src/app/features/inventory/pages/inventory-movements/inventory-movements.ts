import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

type MovFormMode = 'create' | 'view';

@Component({
  selector: 'app-inventory-movements',
  standalone: false,
  templateUrl: './inventory-movements.html',
  styleUrl: './inventory-movements.css',
})
export class InventoryMovements implements OnInit {
  todasMovimentacoes = [
    { id: 'MOV-0041', tipo: 'Entrada', tipoClass: 'tipo-entrada', item: 'Papel A4 Sulfite 75g', sku: 'SUP-OFF-001', qtd: 10, unid: 'CX', responsavel: 'Ana Paula Ferreira', data: '30/05/2026', nf: 'NF-004521', setor: '—', obs: 'Reposição de estoque mensal.' },
    { id: 'MOV-0040', tipo: 'Saída', tipoClass: 'tipo-saida', item: 'Detergente Líquido 5L', sku: 'CLN-LIQ-042', qtd: 3, unid: 'UN', responsavel: 'Bruno Costa', data: '29/05/2026', nf: '—', setor: 'Limpeza / Térreo', obs: 'Distribuição semanal.' },
    { id: 'MOV-0039', tipo: 'Entrada', tipoClass: 'tipo-entrada', item: 'Lâmpada LED 9W Bivolt', sku: 'MAINT-LIG-004', qtd: 50, unid: 'UN', responsavel: 'Elisa Lima', data: '28/05/2026', nf: 'NF-004498', setor: '—', obs: '' },
    { id: 'MOV-0038', tipo: 'Saída', tipoClass: 'tipo-saida', item: 'Café Torrado e Moído 500g', sku: 'KIT-FNB-008', qtd: 5, unid: 'PCT', responsavel: 'Diego Santana', data: '27/05/2026', nf: '—', setor: 'Copa / 2º Andar', obs: '' },
    { id: 'MOV-0037', tipo: 'Entrada', tipoClass: 'tipo-entrada', item: 'Caneta Esferográfica Azul', sku: 'SUP-OFF-015', qtd: 20, unid: 'CX', responsavel: 'Ana Paula Ferreira', data: '26/05/2026', nf: 'NF-004481', setor: '—', obs: 'Compra emergencial.' },
    { id: 'MOV-0036', tipo: 'Saída', tipoClass: 'tipo-saida', item: 'Sabonete Líquido 1L', sku: 'CLN-LIQ-012', qtd: 4, unid: 'UN', responsavel: 'Carla Ribeiro', data: '25/05/2026', nf: '—', setor: 'Banheiros / 1º Andar', obs: '' },
    { id: 'MOV-0035', tipo: 'Saída', tipoClass: 'tipo-saida', item: 'Fita Crepe 18mm', sku: 'SUP-OFF-088', qtd: 2, unid: 'RL', responsavel: 'Felipe Gomes', data: '24/05/2026', nf: '—', setor: 'Manutenção', obs: '' },
    { id: 'MOV-0034', tipo: 'Entrada', tipoClass: 'tipo-entrada', item: 'Desinfetante Pinho 2L', sku: 'CLN-LIQ-055', qtd: 24, unid: 'UN', responsavel: 'Elisa Lima', data: '23/05/2026', nf: 'NF-004462', setor: '—', obs: '' },
  ];

  activeTab: 'Todos' | 'Entrada' | 'Saída' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isFormOpen = false;
  formMode: MovFormMode = 'create';
  selectedMov: any = null;

  get filtradas() {
    if (this.activeTab === 'Entrada') return this.todasMovimentacoes.filter(m => m.tipo === 'Entrada');
    if (this.activeTab === 'Saída') return this.todasMovimentacoes.filter(m => m.tipo === 'Saída');
    return this.todasMovimentacoes;
  }

  get totalPaginas() { return Math.ceil(this.filtradas.length / this.itensPorPagina); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filtradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  get totalEntradas() { return this.todasMovimentacoes.filter(m => m.tipo === 'Entrada').length; }
  get totalSaidas() { return this.todasMovimentacoes.filter(m => m.tipo === 'Saída').length; }

  setTab(tab: 'Todos' | 'Entrada' | 'Saída') {
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
      searchPlaceholder: 'Buscar por item, NF ou responsável...',
      showSearch: true,
      primaryButtonLabel: 'Nova Movimentação',
      primaryButtonIcon: 'ph ph-arrows-left-right'
    });
  }
}
