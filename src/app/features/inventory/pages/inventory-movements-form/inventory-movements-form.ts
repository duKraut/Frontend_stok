import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InventoryItem, InventoryService } from '../../services/inventory.service';
import { InventoryMovement, InventoryMovementService } from '../../services/inventory-movement.service';
import { Supplier, SupplierService } from '../../../suppliers/services/supplier.service';

@Component({
  selector: 'app-inventory-movements-form',
  standalone: false,
  templateUrl: './inventory-movements-form.html',
  styleUrl: './inventory-movements-form.css',
})
export class InventoryMovementsForm implements OnChanges, OnInit {
  @Input() mode: 'create' | 'view' = 'create';
  @Input() movimentacao: InventoryMovement | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tipoSelecionado: 'ENTRADA' | 'SAIDA' = 'ENTRADA';
  selectedItemId = '';
  selectedSupplierId = '';
  itens: InventoryItem[] = [];
  suppliers: Supplier[] = [];

  submitted = false;
  isSaving = false;
  errorMessage = '';
  toastLeaving = false;
  showCloseConfirm = false;

  readonly today = new Date().toLocaleDateString('en-CA');

  setores = [
    'TI - Sede',
    'TI - Infra',
    'Administrativo',
    'Financeiro',
    'Almoxarifado',
    'Vendas',
    'Recursos Humanos',
    'Diretoria',
    'Manutenção',
    'Recepção',
    'Copa - Térreo',
    'Copa - 2º Andar',
    'Limpeza - Térreo',
    'Banheiros - 1º Andar',
    'Banheiros - 2º Andar',
  ];

  formData: {
    quantity: number;
    responsible: string;
    date: string;
    sector: string;
    observations: string;
    nfNumber: string;
    nfEmissionDate: string;
    nfAccessKey: string;
    unitValue: number | null;
  } = this.emptyForm();

  get totalValue(): number {
    if (!this.formData.unitValue || !this.formData.quantity) return 0;
    return this.formData.unitValue * this.formData.quantity;
  }

  get selectedItem(): InventoryItem | undefined {
    return this.itens.find(i => i.id === this.selectedItemId);
  }

  get isDirty(): boolean {
    if (this.mode !== 'create') return false;
    return !!(
      this.selectedItemId ||
      this.formData.responsible?.trim() ||
      this.formData.date ||
      this.formData.quantity > 0
    );
  }

  get validationErrors() {
    return {
      item: !this.selectedItemId,
      quantity: !this.formData.quantity || this.formData.quantity <= 0,
      responsible: !this.formData.responsible?.trim(),
      date: !this.formData.date,
      sector: this.tipoSelecionado === 'SAIDA' && !this.formData.sector,
      supplier: this.tipoSelecionado === 'ENTRADA' && !this.selectedSupplierId,
    };
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  constructor(
    private movService: InventoryMovementService,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inventoryService.getAll().subscribe({
      next: (data) => { this.itens = data.filter(i => i.active); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar itens', err)
    });
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = data.filter(s => s.active); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar fornecedores', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.movimentacao && this.mode === 'view') {
      this.tipoSelecionado = this.movimentacao.type;
      this.selectedItemId = this.movimentacao.item?.id ?? '';
      this.formData = {
        quantity: this.movimentacao.quantity ?? 0,
        responsible: this.movimentacao.responsible ?? '',
        date: this.movimentacao.date ?? '',
        sector: this.movimentacao.sector ?? '',
        observations: this.movimentacao.observations ?? '',
        nfNumber: this.movimentacao.nfNumber ?? '',
        nfEmissionDate: this.movimentacao.nfEmissionDate ?? '',
        nfAccessKey: this.movimentacao.nfAccessKey ?? '',
        unitValue: this.movimentacao.unitValue ?? null,
      };
      return;
    }
    if (this.mode === 'create') {
      this.tipoSelecionado = 'ENTRADA';
      this.selectedItemId = '';
      this.selectedSupplierId = '';
      this.submitted = false;
      this.formData = this.emptyForm();
    }
  }

  save(): void {
    if (this.isSaving) return;
    this.submitted = true;
    if (this.hasErrors) return;

    this.isSaving = true;
    const payload: Partial<InventoryMovement> = {
      item: { id: this.selectedItemId },
      type: this.tipoSelecionado,
      quantity: this.formData.quantity,
      responsible: this.formData.responsible,
      date: this.formData.date,
      sector: this.tipoSelecionado === 'SAIDA' ? this.formData.sector : undefined,
      observations: this.formData.observations || undefined,
      nfNumber: this.tipoSelecionado === 'ENTRADA' ? (this.formData.nfNumber || undefined) : undefined,
      nfEmissionDate: this.tipoSelecionado === 'ENTRADA' ? (this.formData.nfEmissionDate || undefined) : undefined,
      nfAccessKey: this.tipoSelecionado === 'ENTRADA' ? (this.formData.nfAccessKey || undefined) : undefined,
      supplierName: this.tipoSelecionado === 'ENTRADA' ? (this.suppliers.find(s => s.id === this.selectedSupplierId)?.name || undefined) : undefined,
      unitValue: this.tipoSelecionado === 'ENTRADA' ? (this.formData.unitValue ?? undefined) : undefined,
      totalValue: this.tipoSelecionado === 'ENTRADA' && this.totalValue > 0 ? this.totalValue : undefined,
    };

    this.movService.create(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.closeDrawer();
      },
      error: (error) => {
        this.isSaving = false;
        this.showError(error);
      }
    });
  }

  attemptClose(): void {
    if (this.isDirty) {
      this.showCloseConfirm = true;
    } else {
      this.closeDrawer();
    }
  }

  confirmClose(): void { this.showCloseConfirm = false; this.closeDrawer(); }
  cancelClose(): void { this.showCloseConfirm = false; }

  closeDrawer(): void {
    this.submitted = false;
    this.showCloseConfirm = false;
    this.close.emit();
  }

  private emptyForm() {
    return {
      quantity: 0, responsible: '', date: '', sector: '',
      observations: '', nfNumber: '', nfEmissionDate: '',
      nfAccessKey: '', unitValue: null as number | null
    };
  }

  private showError(error: any): void {
    this.toastLeaving = false;
    this.errorMessage = error?.error?.message || 'Erro ao registrar movimentação. Tente novamente.';
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.errorMessage = ''; this.toastLeaving = false; this.cdr.detectChanges(); }, 400);
    }, 4000);
  }
}
