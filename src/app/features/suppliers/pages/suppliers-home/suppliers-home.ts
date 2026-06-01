import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';
import { SupplierService, Supplier } from '../../services/supplier.service';

type SupplierFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-suppliers-home',
  standalone: false,
  templateUrl: './suppliers-home.html',
  styleUrl: './suppliers-home.css',
})
export class SuppliersHome implements OnInit {
  allSuppliers: Supplier[] = [];

  activeTab: 'Todos' | 'Ativos' | 'Inativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isSupplierFormOpen = false;
  supplierFormMode: SupplierFormMode = 'create';
  selectedSupplier: any = null;

  get filteredSuppliers() {
    if (this.activeTab === 'Ativos') return this.allSuppliers.filter(s => s.active === true);
    if (this.activeTab === 'Inativos') return this.allSuppliers.filter(s => s.active === false);
    return this.allSuppliers;
  }

  get totalAtivos() { return this.allSuppliers.filter(s => s.active === true).length; }
  get totalInativos() { return this.allSuppliers.filter(s => s.active === false).length; }
  get totalCategorias() { return new Set(this.allSuppliers.map(s => s.category)).size; }

  get totalPaginas() { return Math.max(1, Math.ceil(this.filteredSuppliers.length / this.itensPorPagina));}

  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filteredSuppliers.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() {
    return Array(this.totalPaginas).fill(1).map((_, i) => i + 1);
  }

  setTab(tab: 'Todos' | 'Ativos' | 'Inativos') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number) { this.paginaAtual = pagina; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreateSupplier(): void {
    this.supplierFormMode = 'create';
    this.selectedSupplier = null;
    this.isSupplierFormOpen = true;
  }

  openEditSupplier(supplier: any): void {
    this.supplierFormMode = 'edit';
    this.selectedSupplier = supplier;
    this.isSupplierFormOpen = true;
  }

  openViewSupplier(supplier: any): void {
    this.supplierFormMode = 'view';
    this.selectedSupplier = supplier;
    this.isSupplierFormOpen = true;
  }

  closeSupplierForm(): void {
    this.isSupplierFormOpen = false;
  }

  getInitials(name: string): string {
    return name.split(' ').filter(w => w.length > 0).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getAvatarClass(category: string): string {
    if (category === 'Informática e TI' || category === 'Papelaria' || category === 'Alimentícia') {
      return 'avatar-company';
    }
    if (category === 'Representante') return 'avatar-person';
    return 'avatar-default';
  }

  constructor(
    private headerService: HeaderService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar Fornecedor, CNPJ ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Fornecedor',
      primaryButtonIcon: 'ph ph-plus'
    });

    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.allSuppliers = data;
        console.log('activeTab:', this.activeTab);
        console.log('filteredSuppliers:', this.filteredSuppliers);
        console.log('itemsDisplayed:', this.itemsDisplayed);
        this.activeTab = 'Todos';
        this.paginaAtual = 1;
      },
      error: (error) => {
        console.error('Erro ao buscar fornecedores', error);
      }
    });
  }
}
