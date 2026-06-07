import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../../../core/services/header';
import { AssetMovement, AssetMovementService } from '../../services/asset-movement.service';
import { AssetsMovementsForm } from '../assets-movements-form/assets-movements-form';

@Component({
  selector: 'app-assets-movements',
  standalone: false,
  templateUrl: './assets-movements.html',
  styleUrl: './assets-movements.css',
})
export class AssetsMovements implements OnInit {
  @ViewChild('movForm') movForm?: AssetsMovementsForm;

  todasMovimentacoes: AssetMovement[] = [];
  filtroAssetId = '';
  filtroAssetName = '';

  activeTab: 'Todos' | 'Transferência' | 'Manutenção' | 'Estado' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isFormOpen = false;
  formMode: 'create' | 'view' = 'create';
  selectedMov: AssetMovement | null = null;

  successMessage = '';
  successLeaving = false;

  get filtradas() {
    if (this.activeTab === 'Transferência') return this.todasMovimentacoes.filter(m => m.type === 'TRANSFERENCIA');
    if (this.activeTab === 'Manutenção')   return this.todasMovimentacoes.filter(m => m.type === 'MANUTENCAO');
    if (this.activeTab === 'Estado')       return this.todasMovimentacoes.filter(m => m.type === 'ESTADO');
    return this.todasMovimentacoes;
  }

  get totalPaginas() { return Math.max(1, Math.ceil(this.filtradas.length / this.itensPorPagina)); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filtradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  get totalTransferencias() { return this.todasMovimentacoes.filter(m => m.type === 'TRANSFERENCIA').length; }
  get totalManutencoes()    { return this.todasMovimentacoes.filter(m => m.type === 'MANUTENCAO').length; }
  get totalBaixas()         { return this.todasMovimentacoes.filter(m => m.type === 'ESTADO' && m.decommission).length; }

  tipoLabel(mov: any): string {
    if (mov.type === 'TRANSFERENCIA') return 'Transferência';
    if (mov.type === 'MANUTENCAO')   return 'Manutenção';
    return mov.decommission ? 'Baixa' : 'Alt. Estado';
  }

  tipoClass(mov: any): string {
    if (mov.type === 'TRANSFERENCIA') return 'tipo-transferencia';
    if (mov.type === 'MANUTENCAO')   return 'tipo-manutencao';
    return mov.decommission ? 'tipo-baixa' : 'tipo-estado';
  }

  tipoIcon(mov: any): string {
    if (mov.type === 'TRANSFERENCIA') return 'ph ph-swap';
    if (mov.type === 'MANUTENCAO')   return 'ph ph-wrench';
    return mov.decommission ? 'ph ph-trash' : 'ph ph-arrows-clockwise';
  }

  setTab(tab: 'Todos' | 'Transferência' | 'Manutenção' | 'Estado') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(p: number) { this.paginaAtual = p; }
  proximaPagina()  { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreate() {
    this.formMode = 'create';
    this.selectedMov = null;
    this.isFormOpen = true;
  }

  openView(mov: AssetMovement) {
    this.formMode = 'view';
    this.selectedMov = mov;
    this.isFormOpen = true;
  }

  closeForm() { this.isFormOpen = false; }

  backdropClick() {
    if (this.formMode === 'view') {
      this.closeForm();
    }
  }

  onMovSaved(): void {
    this.closeForm();
    setTimeout(() => this.loadMovements(this.filtroAssetId || undefined), 0);

    this.successLeaving = false;
    this.successMessage = 'Movimentação registrada com sucesso.';
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

  constructor(
    private headerService: HeaderService,
    private movService: AssetMovementService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar por bem, tombamento ou responsável...',
      showSearch: true,
      primaryButtonLabel: 'Nova Movimentação',
      primaryButtonIcon: 'ph ph-arrows-left-right'
    });

    this.route.queryParams.subscribe(params => {
      this.filtroAssetId   = params['assetId']   ?? '';
      this.filtroAssetName = params['assetName'] ?? '';
      this.paginaAtual = 1;
      this.loadMovements(this.filtroAssetId || undefined);
      this.cdr.detectChanges();
    });
  }

  loadMovements(assetId?: string): void {
    const req$ = assetId
      ? this.movService.getByAsset(assetId)
      : this.movService.getAll();

    req$.subscribe({
      next: (data) => {
        this.todasMovimentacoes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar movimentações', err)
    });
  }
}
