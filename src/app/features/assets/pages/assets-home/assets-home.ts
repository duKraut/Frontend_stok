import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

  activeTab: 'Todos' | 'Excelente' | 'Bom' | 'Regular' | 'Manutenção' | 'Substituir' | 'Baixado' | 'Ativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isBemFormOpen = false;
  bemFormMode: BemFormMode = 'create';
  selectedBem: any = null;

  successMessage = '';
  successLeaving = false;

  get ativosFiltrados() {
    if (this.activeTab === 'Baixado')    return this.allAssets.filter(a => !a.active);
    if (this.activeTab === 'Ativos')     return this.allAssets.filter(a => a.active);
    if (this.activeTab === 'Excelente')  return this.allAssets.filter(a => a.active && a.conservationStatus === 'EXCELENTE');
    if (this.activeTab === 'Bom')        return this.allAssets.filter(a => a.active && a.conservationStatus === 'BOM');
    if (this.activeTab === 'Regular')    return this.allAssets.filter(a => a.active && a.conservationStatus === 'REGULAR');
    if (this.activeTab === 'Manutenção') return this.allAssets.filter(a => a.active && a.conservationStatus === 'MANUTENCAO');
    if (this.activeTab === 'Substituir') return this.allAssets.filter(a => a.active && a.conservationStatus === 'SUBSTITUIR');
    return this.allAssets;
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

  constructor(private headerService: HeaderService, private router: Router, private assetService: AssetService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar tombamento, descrição ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Bem',
      primaryButtonIcon: 'ph ph-plus'
    });

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
