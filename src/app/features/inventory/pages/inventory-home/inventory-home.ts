import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../../core/services/header';

type ItemFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-inventory-home',
  standalone: false,
  templateUrl: './inventory-home.html',
  styleUrl: './inventory-home.css',
})
export class InventoryHome implements OnInit {
  todosItens = [
    { id: '1', nome: 'Papel A4 Sulfite 75g', sku: 'SUP-OFF-001', marca: 'Chamex', categoria: 'Escritório', saldo: 5, unid: 'CX', min: 10, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' },
    { id: '2', nome: 'Detergente Líquido 5L', sku: 'CLN-LIQ-042', marca: 'Ypê', categoria: 'Limpeza', saldo: 24, unid: 'UN', min: 5, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { id: '3', nome: 'Cabo HDMI 2.0 3m', sku: 'IT-ACC-119', marca: 'ELG', categoria: 'Informática', saldo: 0, unid: 'UN', min: 2, status: 'ESGOTADO', statusClass: 'danger-outline' },
    { id: '4', nome: 'Lâmpada LED 9W Bivolt', sku: 'MAINT-LIG-004', marca: 'Elgin', categoria: 'Manutenção', saldo: 45, unid: 'UN', min: 12, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { id: '5', nome: 'Café Torrado e Moído 500g', sku: 'KIT-FNB-008', marca: 'Mellita', categoria: 'Copa & Cozinha', saldo: 8, unid: 'PCT', min: 15, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' },
    { id: '6', nome: 'Caneta Esferográfica Azul', sku: 'SUP-OFF-015', marca: 'BIC', categoria: 'Escritório', saldo: 50, unid: 'CX', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { id: '7', nome: 'Desinfetante Pinho 2L', sku: 'CLN-LIQ-055', marca: 'Pinho Sol', categoria: 'Limpeza', saldo: 12, unid: 'UN', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { id: '8', nome: 'Teclado USB Padrão', sku: 'IT-PER-099', marca: 'Multilaser', categoria: 'Informática', saldo: 0, unid: 'UN', min: 5, status: 'ESGOTADO', statusClass: 'danger-outline' },
    { id: '9', nome: 'Fita Crepe 18mm', sku: 'SUP-OFF-088', marca: 'TekBond', categoria: 'Escritório', saldo: 15, unid: 'RL', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { id: '10', nome: 'Sabonete Líquido 1L', sku: 'CLN-LIQ-012', marca: 'Granado', categoria: 'Limpeza', saldo: 3, unid: 'UN', min: 10, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' }
  ];

  activeTab: 'Todos' | 'Em Estoque' | 'Estoque Baixo' | 'Esgotados' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isItemFormOpen = false;
  itemFormMode: ItemFormMode = 'create';
  selectedItem: any = null;

  get itensFiltrados() {
    if (this.activeTab === 'Em Estoque') return this.todosItens.filter(i => i.saldo >= i.min);
    if (this.activeTab === 'Estoque Baixo') return this.todosItens.filter(i => i.saldo > 0 && i.saldo < i.min);
    if (this.activeTab === 'Esgotados') return this.todosItens.filter(i => i.saldo === 0);
    return this.todosItens;
  }

  get totalPaginas() { return Math.ceil(this.itensFiltrados.length / this.itensPorPagina); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  setTab(tab: 'Todos' | 'Em Estoque' | 'Estoque Baixo' | 'Esgotados') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number) { this.paginaAtual = pagina; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreateItem(): void {
    this.itemFormMode = 'create';
    this.selectedItem = null;
    this.isItemFormOpen = true;
  }

  openEditItem(item: any): void {
    this.itemFormMode = 'edit';
    this.selectedItem = item;
    this.isItemFormOpen = true;
  }

  openViewItem(item: any): void {
    this.itemFormMode = 'view';
    this.selectedItem = item;
    this.isItemFormOpen = true;
  }

  closeItemForm(): void { this.isItemFormOpen = false; }

  goToMovimentacoes(): void {
    this.router.navigate(['/inventory/movimentacoes']);
  }

  constructor(private headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar item, marca ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Item',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}
