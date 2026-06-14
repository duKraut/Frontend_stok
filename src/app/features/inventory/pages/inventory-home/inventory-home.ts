import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../../core/services/header';
import { InventoryItem, InventoryService } from '../../services/inventory.service';
import { InventoryForm } from '../inventory-form/inventory-form';

type ItemFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-inventory-home',
  standalone: false,
  templateUrl: './inventory-home.html',
  styleUrl: './inventory-home.css',
})
export class InventoryHome implements OnInit {
  @ViewChild('itemForm') itemForm?: InventoryForm;

  todosItens: InventoryItem[] = [];

  activeTab: 'Todos' | 'Em Estoque' | 'Estoque Baixo' | 'Esgotados' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isItemFormOpen = false;
  itemFormMode: ItemFormMode = 'create';
  selectedItem: InventoryItem | null = null;

  successMessage = '';
  successLeaving = false;

  get itensFiltrados() {
    if (this.activeTab === 'Em Estoque') return this.todosItens.filter(i => (i.currentStock ?? 0) >= i.minStock && (i.currentStock ?? 0) > 0);
    if (this.activeTab === 'Estoque Baixo') return this.todosItens.filter(i => (i.currentStock ?? 0) > 0 && (i.currentStock ?? 0) < i.minStock);
    if (this.activeTab === 'Esgotados') return this.todosItens.filter(i => (i.currentStock ?? 0) === 0);
    return this.todosItens;
  }

  get totalEmBaixa() { return this.todosItens.filter(i => (i.currentStock ?? 0) > 0 && (i.currentStock ?? 0) < i.minStock).length; }
  get totalEsgotados() { return this.todosItens.filter(i => (i.currentStock ?? 0) === 0).length; }

  get totalPaginas() { return Math.max(1, Math.ceil(this.itensFiltrados.length / this.itensPorPagina)); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  getStatus(item: InventoryItem): string {
    const stock = item.currentStock ?? 0;
    if (stock === 0) return 'ESGOTADO';
    if (stock < item.minStock) return 'ESTOQUE BAIXO';
    return 'EM ESTOQUE';
  }

  getStatusClass(item: InventoryItem): string {
    const stock = item.currentStock ?? 0;
    if (stock === 0) return 'danger-outline';
    if (stock < item.minStock) return 'warning-outline';
    return 'success-outline';
  }

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

  openEditItem(item: InventoryItem): void {
    this.itemFormMode = 'edit';
    this.selectedItem = item;
    this.isItemFormOpen = true;
  }

  openViewItem(item: InventoryItem): void {
    this.itemFormMode = 'view';
    this.selectedItem = item;
    this.isItemFormOpen = true;
  }

  closeItemForm(): void { this.isItemFormOpen = false; }

  backdropClick(): void {
    if (this.itemFormMode === 'view') {
      this.closeItemForm();
    } else {
      this.itemForm?.attemptClose();
    }
  }

  onItemSaved(): void {
    const wasCreate = this.itemFormMode === 'create';
    this.closeItemForm();
    this.loadItens();

    this.successLeaving = false;
    this.successMessage = wasCreate
      ? 'Item cadastrado com sucesso.'
      : 'Item atualizado com sucesso.';

    setTimeout(() => {
      this.successLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.successMessage = '';
        this.successLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }

  goToMovimentacoes(): void {
    this.router.navigate(['/inventory/movements']);
  }

  goToHistoricoItem(item: InventoryItem): void {
    this.router.navigate(['/inventory/movements'], {
      queryParams: { itemId: item.id, itemName: item.name }
    });
  }

  constructor(
    private headerService: HeaderService,
    private inventoryService: InventoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar item, marca ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Item',
      primaryButtonIcon: 'ph ph-plus'
    });
    this.loadItens();
  }

  loadItens(): void {
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.todosItens = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar itens', err)
    });
  }
}
