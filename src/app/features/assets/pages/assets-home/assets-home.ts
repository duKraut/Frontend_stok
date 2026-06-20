import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderService } from '../../../../core/services/header';
import { Asset, AssetService } from '../../services/asset.service';
import { AssetsForm } from '../assets-form/assets-form';

type BemFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-assets-home',
  standalone: false,
  templateUrl: './assets-home.html',
  styleUrl: './assets-home.css',
})
export class AssetsHome implements OnInit {
  @ViewChild('bemForm') bemForm?: AssetsForm;

  allAssets: Asset[] = [];
  termoBusca = '';

  activeTab: 'Todos' | 'Excelente' | 'Bom' | 'Regular' | 'Manutenção' | 'Substituir' | 'Baixado' | 'Ativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isBemFormOpen = false;
  bemFormMode: BemFormMode = 'create';
  selectedBem: any = null;

  successMessage = '';
  successLeaving = false;

  get ativosFiltrados() {
    let result = this.allAssets;
    if (this.activeTab === 'Baixado')    result = result.filter(a => !a.active);
    else if (this.activeTab === 'Ativos')     result = result.filter(a => a.active);
    else if (this.activeTab === 'Excelente')  result = result.filter(a => a.active && a.conservationStatus === 'EXCELENTE');
    else if (this.activeTab === 'Bom')        result = result.filter(a => a.active && a.conservationStatus === 'BOM');
    else if (this.activeTab === 'Regular')    result = result.filter(a => a.active && a.conservationStatus === 'REGULAR');
    else if (this.activeTab === 'Manutenção') result = result.filter(a => a.active && a.conservationStatus === 'MANUTENCAO');
    else if (this.activeTab === 'Substituir') result = result.filter(a => a.active && a.conservationStatus === 'SUBSTITUIR');
    if (this.termoBusca) result = result.filter(a => this.match(this.termoBusca, a.name, a.brand, a.model, a.category, a.department, a.responsible, a.tombamento));
    return result;
  }

  private match(term: string, ...fields: (string | number | undefined | null)[]): boolean {
    const t = term.toLowerCase();
    return fields.some(f => f?.toString().toLowerCase().includes(t));
  }

  get totalPaginas() { return Math.ceil(this.ativosFiltrados.length / this.itensPorPagina); }

  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.ativosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  setTab(tab: 'Todos' | 'Excelente' | 'Bom' | 'Regular' | 'Manutenção' | 'Substituir' | 'Baixado' | 'Ativos') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number) { this.paginaAtual = pagina; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreateBem(): void {
    this.bemFormMode = 'create';
    this.selectedBem = null;
    this.isBemFormOpen = true;
  }

  openEditBem(bem: any): void {
    this.bemFormMode = 'edit';
    this.selectedBem = bem;
    this.isBemFormOpen = true;
  }

  openViewBem(bem: any): void {
    this.bemFormMode = 'view';
    this.selectedBem = bem;
    this.isBemFormOpen = true;
  }

  closeBemForm(): void { this.isBemFormOpen = false; }

  backdropClick(): void {
    if (this.bemFormMode === 'view') {
      this.closeBemForm();
    } else {
      this.bemForm?.attemptClose();
    }
  }

  onBemSaved(): void {
    const wasCreate = this.bemFormMode === 'create';
    this.closeBemForm();
    setTimeout(() => this.loadAssets(), 0);

    this.successLeaving = false;
    this.successMessage = wasCreate ? 'Bem cadastrado com sucesso.' : 'Bem atualizado com sucesso.';

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
    this.router.navigate(['/assets/movements']);
  }

  goToHistorico(asset: Asset): void {
    this.router.navigate(['/assets/movements'], {
      queryParams: { assetId: asset.id, assetName: asset.name }
    });
  }

  get canEdit(): boolean { return this.auth.canEdit(); }

  constructor(private headerService: HeaderService, private router: Router, private assetService: AssetService, private cdr: ChangeDetectorRef, private auth: AuthService) {}

  onSearch(event: Event): void {
    this.termoBusca = (event.target as HTMLInputElement).value;
    this.paginaAtual = 1;
  }

  ngOnInit(): void {
    this.headerService.setConfig({ searchPlaceholder: '', showSearch: false, hidden: true });
    this.loadAssets();
  }

  loadAssets(): void {
    this.assetService.getAll().subscribe({
      next: (data) => {
        this.allAssets = data.sort((a, b) => (b.tombamento ?? 0) - (a.tombamento ?? 0));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Erro ao buscar bens', error)
    });
  }
}
