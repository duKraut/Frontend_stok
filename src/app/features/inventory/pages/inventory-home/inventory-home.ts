import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  termoBusca = '';

  activeTab: 'Todos' | 'Em Estoque' | 'Estoque Baixo' | 'Esgotados' | 'Ativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isItemFormOpen = false;
  itemFormMode: ItemFormMode = 'create';
  selectedItem: InventoryItem | null = null;

  successMessage = '';
  successLeaving = false;

  get itensFiltrados() {
    let result = this.todosItens;
    if (this.activeTab === 'Ativos')        result = result.filter(i => i.active);
    else if (this.activeTab === 'Em Estoque')    result = result.filter(i => (i.currentStock ?? 0) >= i.minStock && (i.currentStock ?? 0) > 0);
    else if (this.activeTab === 'Estoque Baixo') result = result.filter(i => (i.currentStock ?? 0) > 0 && (i.currentStock ?? 0) < i.minStock);
    else if (this.activeTab === 'Esgotados')     result = result.filter(i => (i.currentStock ?? 0) === 0);
    if (this.termoBusca) result = result.filter(i => this.match(this.termoBusca, i.name, i.brand, i.category, i.location, i.description));
    return result;
  }

  private match(term: string, ...fields: (string | number | undefined | null)[]): boolean {
    const t = term.toLowerCase();
    return fields.some(f => f?.toString().toLowerCase().includes(t));
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

  setTab(tab: 'Todos' | 'Em Estoque' | 'Estoque Baixo' | 'Esgotados' | 'Ativos') {
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

  get canEdit(): boolean { return this.auth.canEdit(); }

  constructor(
    private headerService: HeaderService,
    private inventoryService: InventoryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  onSearch(event: Event): void {
    this.termoBusca = (event.target as HTMLInputElement).value;
    this.paginaAtual = 1;
  }

  ngOnInit(): void {
    this.headerService.setConfig({ searchPlaceholder: '', showSearch: false, hidden: true });
    this.loadItens();
  }

  loadItens(): void {
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.todosItens = data.sort((a, b) => (b.codigo ?? 0) - (a.codigo ?? 0));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar itens', err)
    });
  }
}
