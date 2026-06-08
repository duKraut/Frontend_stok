import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InventoryItem, InventoryService } from '../../services/inventory.service';
import { InventoryMovementService } from '../../services/inventory-movement.service';
import { Supplier, SupplierService } from '../../../suppliers/services/supplier.service';

@Component({
  selector: 'app-inventory-form',
  standalone: false,
  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.css',
})
export class InventoryForm implements OnChanges, OnInit {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() item: InventoryItem | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();

  isSaving = false;
  submitted = false;
  errorMessage = '';
  toastLeaving = false;
  showCloseConfirm = false;

  readonly today = new Date().toLocaleDateString('en-CA');

  unidades = ['UN', 'CX', 'PCT', 'KG', 'LT', 'RL', 'M', 'M2', 'PAR', 'FD', 'GL', 'SC'];

  categorias = [
    'Escritório', 'Limpeza', 'Informática', 'Manutenção',
    'Copa & Cozinha', 'Higiene', 'EPI', 'Elétrico', 'Hidráulico', 'Outros'
  ];

  formData = {
    name: '', brand: '', category: '', location: '',
    description: '', unit: '', minStock: 0, active: true
  };

  selectedSupplierId = '';
  suppliers: Supplier[] = [];

  nfData = {
    initialQuantity: 0, nfNumber: '', nfEmissionDate: '',
    unitValue: null as number | null, nfAccessKey: ''
  };

  get totalValue(): number {
    if (!this.nfData.unitValue || !this.nfData.initialQuantity) return 0;
    return this.nfData.unitValue * this.nfData.initialQuantity;
  }

  get isDirty(): boolean {
    if (this.mode === 'view') return false;
    if (this.mode === 'create') {
      return !!(this.formData.name || this.formData.category || this.formData.brand);
    }
    if (this.mode === 'edit' && this.item) {
      return (
        this.formData.name !== (this.item.name ?? '') ||
        this.formData.brand !== (this.item.brand ?? '') ||
        this.formData.category !== (this.item.category ?? '') ||
        this.formData.unit !== (this.item.unit ?? '') ||
        this.formData.minStock !== (this.item.minStock ?? 0) ||
        this.formData.active !== this.item.active
      );
    }
    return false;
  }

  get validationErrors() {
    return {
      name: !this.formData.name.trim(),
      category: !this.formData.category,
      unit: !this.formData.unit,
    };
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  constructor(
    private inventoryService: InventoryService,
    private movementService: InventoryMovementService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = data.filter(s => s.active); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar fornecedores', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item && (this.mode === 'edit' || this.mode === 'view')) {
      this.formData = {
        name: this.item.name,
        brand: this.item.brand ?? '',
        category: this.item.category,
        location: this.item.location ?? '',
        description: this.item.description ?? '',
        unit: this.item.unit,
        minStock: this.item.minStock,
        active: this.item.active
      };
      return;
    }
    if (this.mode === 'create') {
      this.formData = { name: '', brand: '', category: '', location: '', description: '', unit: '', minStock: 0, active: true };
      this.nfData = { initialQuantity: 0, nfNumber: '', nfEmissionDate: '', unitValue: null, nfAccessKey: '' };
      this.selectedSupplierId = '';
      this.submitted = false;
    }
  }

  save(): void {
    if (this.isSaving) return;
    this.submitted = true;
    if (this.hasErrors) return;

    this.isSaving = true;

    if (this.mode === 'create') {
      this.inventoryService.create({ ...this.formData, unit: this.formData.unit as any }).subscribe({
        next: (created) => {
          if (this.nfData.initialQuantity > 0) {
            this.movementService.create({
              item: { id: created.id! },
              type: 'ENTRADA',
              quantity: this.nfData.initialQuantity,
              responsible: 'Cadastro inicial',
              date: this.today,
              nfNumber: this.nfData.nfNumber || undefined,
              nfEmissionDate: this.nfData.nfEmissionDate || undefined,
              supplierName: this.suppliers.find(s => s.id === this.selectedSupplierId)?.name || undefined,
              unitValue: this.nfData.unitValue ?? undefined,
              totalValue: this.totalValue || undefined,
              nfAccessKey: this.nfData.nfAccessKey || undefined,
            }).subscribe({
              next: () => { this.isSaving = false; this.saved.emit(); this.closeDrawer(); },
              error: () => { this.isSaving = false; this.saved.emit(); this.closeDrawer(); }
            });
          } else {
            this.isSaving = false;
            this.saved.emit();
            this.closeDrawer();
          }
        },
        error: (error) => { this.isSaving = false; this.showError(error); }
      });
      return;
    }

    if (this.mode === 'edit' && this.item?.id) {
      this.inventoryService.update(this.item.id, { ...this.formData, unit: this.formData.unit as any }).subscribe({
        next: () => { this.isSaving = false; this.saved.emit(); this.closeDrawer(); },
        error: (error) => { this.isSaving = false; this.showError(error); }
      });
    }
  }

  requestEdit(): void { this.editRequested.emit(); }

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

  private showError(error: any): void {
    this.toastLeaving = false;
    this.errorMessage = error?.error?.message || 'Erro ao salvar. Tente novamente.';
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.errorMessage = ''; this.toastLeaving = false; this.cdr.detectChanges(); }, 400);
    }, 4000);
  }
}
