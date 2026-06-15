import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderService } from '../../../../core/services/header';
import { InventoryMovement, InventoryMovementService } from '../../services/inventory-movement.service';
import { InventoryMovementsForm } from '../inventory-movements-form/inventory-movements-form';

type MovFormMode = 'create' | 'view';

@Component({
  selector: 'app-inventory-movements',
  standalone: false,
  templateUrl: './inventory-movements.html',
  styleUrl: './inventory-movements.css',
})
export class InventoryMovements implements OnInit, OnDestroy {
  @ViewChild('movForm') movForm?: InventoryMovementsForm;

  todasMovimentacoes: InventoryMovement[] = [];

  filtroItemId = '';
  filtroItemName = '';
  termoBusca = '';
  private searchSub?: Subscription;

  activeTab: 'Todos' | 'Entrada' | 'Saída' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isFormOpen = false;
  formMode: MovFormMode = 'create';
  selectedMov: InventoryMovement | null = null;

  readonly today = new Date().toLocaleDateString('en-CA');

  get filtradas() {
    let result = this.todasMovimentacoes;
    if (this.activeTab === 'Entrada') result = result.filter(m => m.type === 'ENTRADA');
    else if (this.activeTab === 'Saída') result = result.filter(m => m.type === 'SAIDA');
    if (this.termoBusca) result = result.filter(m => this.match(this.termoBusca, m.item?.name, m.responsible, m.sector, m.supplierName, m.nfNumber, m.observations));
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

  get totalEntradas() { return this.todasMovimentacoes.filter(m => m.type === 'ENTRADA').length; }
  get totalSaidas() { return this.todasMovimentacoes.filter(m => m.type === 'SAIDA').length; }

  get totalHoje() {
    return this.todasMovimentacoes.filter(m => m.date === this.today).length;
  }

  setTab(tab: 'Todos' | 'Entrada' | 'Saída') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(p: number) { this.paginaAtual = p; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreate() {
    this.formMode = 'create';
    this.selectedMov = null;
    this.isFormOpen = true;
  }

  openView(mov: InventoryMovement) {
    this.formMode = 'view';
    this.selectedMov = mov;
    this.isFormOpen = true;
  }

  closeForm() { this.isFormOpen = false; }

  backdropClick(): void {
    if (this.formMode === 'view') {
      this.closeForm();
    } else {
      this.movForm?.attemptClose();
    }
  }

  onMovSaved(): void {
    this.closeForm();
    this.loadMovements(this.filtroItemId || undefined);
  }

  ngOnDestroy(): void { this.searchSub?.unsubscribe(); }

  loadMovements(itemId?: string): void {
    const obs = itemId
      ? this.movService.getByItem(itemId)
      : this.movService.getAll();

    obs.subscribe({
      next: (data) => {
        this.todasMovimentacoes = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar movimentações', err)
    });
  }

  get canEdit(): boolean { return this.auth.canEdit(); }

  constructor(
    private headerService: HeaderService,
    private movService: InventoryMovementService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar por item, NF ou responsável...',
      showSearch: true,
      primaryButtonLabel: 'Nova Movimentação',
      primaryButtonIcon: 'ph ph-arrows-left-right'
    });
    this.searchSub = this.headerService.search$.subscribe(t => {
      this.termoBusca = t;
      this.paginaAtual = 1;
      this.cdr.detectChanges();
    });

    this.route.queryParams.subscribe(params => {
      this.filtroItemId = params['itemId'] ?? '';
      this.filtroItemName = params['itemName'] ?? '';
      this.loadMovements(this.filtroItemId || undefined);
    });
  }
}
