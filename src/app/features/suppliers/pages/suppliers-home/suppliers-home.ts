import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';
import { SupplierService, Supplier } from '../../services/supplier.service';
import { SuppliersForm } from '../suppliers-form/suppliers-form';

type SupplierFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-suppliers-home',
  standalone: false,
  templateUrl: './suppliers-home.html',
  styleUrl: './suppliers-home.css',
})
export class SuppliersHome implements OnInit {
  @ViewChild('supplierForm') supplierForm?: SuppliersForm;

  allSuppliers: Supplier[] = [];

  activeTab: 'Todos' | 'Ativos' | 'Inativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isSupplierFormOpen = false;
  supplierFormMode: SupplierFormMode = 'create';
  selectedSupplier: any = null;

  successMessage = '';
  successLeaving = false;

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

  backdropClick(): void {
    if (this.supplierFormMode === 'view') {
      this.closeSupplierForm();
    } else {
      this.supplierForm?.attemptClose();
    }
  }

  onSupplierSaved(): void {
    const wasCreate = this.supplierFormMode === 'create';
    this.closeSupplierForm();
    setTimeout(() => this.loadSuppliers(), 0);

    this.successLeaving = false;
    this.successMessage = wasCreate
      ? 'Fornecedor cadastrado com sucesso.'
      : 'Fornecedor atualizado com sucesso.';

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

  getInitials(name: string): string {
    return name.split(' ').filter(w => w.length > 0).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getAvatarClass(category: string): string {
    if (category === 'Outros') return 'avatar-default';
    if (category === 'Representante') return 'avatar-person';
    return 'avatar-company';
  }

  constructor(
    private headerService: HeaderService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
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
        this.allSuppliers = data.sort((a, b) => (b.code ?? 0) - (a.code ?? 0));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar fornecedores', error);
      }
    });
  }
}
