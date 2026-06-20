import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  termoBusca = '';

  activeTab: 'Todos' | 'Transferência' | 'Manutenção' | 'Estado' | 'Baixas' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isFormOpen = false;
  formMode: 'create' | 'view' = 'create';
  selectedMov: AssetMovement | null = null;

  successMessage = '';
  successLeaving = false;

  get filtradas() {
    let result = this.todasMovimentacoes;
    if (this.activeTab === 'Transferência') result = result.filter(m => m.type === 'TRANSFERENCIA');
    else if (this.activeTab === 'Manutenção') result = result.filter(m => m.type === 'MANUTENCAO');
    else if (this.activeTab === 'Estado')     result = result.filter(m => m.type === 'ESTADO' && !m.decommission);
    else if (this.activeTab === 'Baixas')     result = result.filter(m => m.type === 'ESTADO' && m.decommission);
    if (this.termoBusca) result = result.filter(m => this.match(this.termoBusca, m.asset?.name, m.responsible, m.fromDepartment, m.toDepartment, m.serviceProvider, m.observations));
    return result;
  }

  private match(term: string, ...fields: (string | number | undefined | null)[]): boolean {
    const t = term.toLowerCase();
    return fields.some(f => f?.toString().toLowerCase().includes(t));
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

  setTab(tab: 'Todos' | 'Transferência' | 'Manutenção' | 'Estado' | 'Baixas') {
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
    } else {
      this.movForm?.attemptClose();
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

  get canEdit(): boolean { return this.auth.canEdit(); }

  constructor(
    private headerService: HeaderService,
    private movService: AssetMovementService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  onSearch(event: Event): void {
    this.termoBusca = (event.target as HTMLInputElement).value;
    this.paginaAtual = 1;
  }

  ngOnInit(): void {
    this.headerService.setConfig({ searchPlaceholder: '', showSearch: false, hidden: true });

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
        this.todasMovimentacoes = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar movimentações', err)
    });
  }
}
