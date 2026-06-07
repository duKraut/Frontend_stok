import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../../core/services/header';
import { Asset, AssetService } from '../../services/asset.servce';

type BemFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-assets-home',
  standalone: false,
  templateUrl: './assets-home.html',
  styleUrl: './assets-home.css',
})
export class AssetsHome implements OnInit {
  allAssets: Asset[] = [];

  activeTab: 'Todos' | 'Excelente' | 'Bom' | 'Manutenção' | 'Substituir' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isBemFormOpen = false;
  bemFormMode: BemFormMode = 'create';
  selectedBem: any = null;

  get ativosFiltrados() {
    if (this.activeTab === 'Excelente')  return this.allAssets.filter(a => a.conservationStatus === 'EXCELENTE');
    if (this.activeTab === 'Bom')        return this.allAssets.filter(a => a.conservationStatus === 'BOM');
    if (this.activeTab === 'Manutenção') return this.allAssets.filter(a => a.conservationStatus === 'MANUTENCAO');
    if (this.activeTab === 'Substituir') return this.allAssets.filter(a => a.conservationStatus === 'SUBSTITUIR');
    return this.allAssets;
  }

  get totalPaginas() { return Math.ceil(this.ativosFiltrados.length / this.itensPorPagina); }

  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.ativosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  setTab(tab: 'Todos' | 'Excelente' | 'Bom' | 'Manutenção' | 'Substituir') {
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

  goToMovimentacoes(): void {
    this.router.navigate(['/assets/movements']);
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
        this.allAssets = data;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Erro ao buscar bens', error)
    });
  }
}
