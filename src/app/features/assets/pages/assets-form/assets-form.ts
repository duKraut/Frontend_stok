import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { AuthService } from '../../../../core/services/auth.service';
import { Asset, AssetService } from '../../services/asset.service';
import { Supplier, SupplierService } from '../../../suppliers/services/supplier.service';
import { UserSummary, UserService } from '../../../configs/services/user.service';

@Component({
  selector: 'app-assets-form',
  standalone: false,
  templateUrl: './assets-form.html',
  styleUrl: './assets-form.css',
})
export class AssetsForm implements OnChanges, OnInit {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() bem: Asset | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();

  submitted = false;
  isSaving = false;
  errorMessage = '';
  toastLeaving = false;
  showCloseConfirm = false;
  readonly today = new Date().toLocaleDateString('en-CA');

  suppliers: Supplier[] = [];
  selectedSupplierId = '';
  supplierDisplay = (s: any) => s.name;

  users: UserSummary[] = [];
  userNameFn = (u: any) => u.fullName;

  get validationErrors() {
    return {
      name:               !this.formData.name?.trim(),
      brand:              !this.formData.brand?.trim(),
      model:              !this.formData.model?.trim(),
      category:           !this.formData.category?.trim(),
      conservationStatus: !this.formData.conservationStatus,
      department:         !this.formData.department?.trim(),
      acquisitionDate:    !this.formData.acquisitionDate,
      acquisitionValue:   this.formData.acquisitionValue == null || this.formData.acquisitionValue <= 0,
      supplier:           !this.selectedSupplierId,
    };
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  get hasUnsavedChanges(): boolean {
    if (this.mode === 'view') return false;
    if (this.mode === 'create') {
      return !!(this.formData.name || this.formData.brand || this.formData.model ||
                this.formData.category || this.formData.acquisitionDate || this.selectedSupplierId);
    }
    if (this.mode === 'edit' && this.bem) {
      return (
        this.formData.name !== (this.bem.name ?? '') ||
        this.formData.brand !== (this.bem.brand ?? '') ||
        this.formData.model !== (this.bem.model ?? '') ||
        this.formData.category !== (this.bem.category ?? '') ||
        this.formData.department !== (this.bem.department ?? '') ||
        this.formData.acquisitionDate !== (this.bem.acquisitionDate ?? '') ||
        this.formData.acquisitionValue !== (this.bem.acquisitionValue ?? 0) ||
        this.formData.active !== this.bem.active ||
        this.selectedSupplierId !== (this.bem.supplier?.id ?? '')
      );
    }
    return false;
  }

  formData: Asset = {
    name: '',
    specs: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: '',
    conservationStatus: 'EXCELENTE',
    department: '',
    location: '',
    responsible: '',
    acquisitionDate: '',
    acquisitionValue: 0,
    nfNumber: '',
    nfEmissionDate: '',
    nfAccessKey: '',
    warrantyUntil: '',
    usefulLifeYears: undefined,
    depreciationRate: undefined,
    residualValue: undefined,
    depreciationMethod: undefined,
    active: true
  };

  categorias = [
    'Informática',
    'Mobiliário',
    'Equipamentos de Escritório',
    'Veículos',
    'Eletrônicos',
    'Máquinas e Equipamentos',
    'Infraestrutura',
    'Outros'
  ];

  departamentos = [
    'TI - Sede',
    'TI - Infra',
    'Administrativo',
    'Financeiro',
    'Almoxarifado',
    'Vendas',
    'Recursos Humanos',
    'Diretoria',
    'Manutenção',
    'Recepção'
  ];

  metodos = [
    { label: 'Linear', value: 'LINEAR' },
    { label: 'Soma dos Dígitos dos Anos', value: 'SOMA_DIGITOS' }
  ];

  get canEdit(): boolean { return this.auth.canEdit(); }
  get canDelete(): boolean { return this.auth.canDelete(); }

  constructor(private assetService: AssetService, private supplierService: SupplierService, private userService: UserService, private cdr: ChangeDetectorRef, private auth: AuthService) {}

  ngOnInit(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = data.filter(s => s.active); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar fornecedores', err)
    });
    this.userService.getActive().subscribe({
      next: (data) => { this.users = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar usuários', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.bem && (this.mode === 'edit' || this.mode === 'view')) {
      this.formData = {
        id: this.bem.id,
        tombamento: this.bem.tombamento,
        name: this.bem.name ?? '',
        specs: this.bem.specs ?? '',
        brand: this.bem.brand ?? '',
        model: this.bem.model ?? '',
        serialNumber: this.bem.serialNumber ?? '',
        category: this.bem.category ?? '',
        conservationStatus: this.bem.conservationStatus ?? 'EXCELENTE',
        department: this.bem.department ?? '',
        location: this.bem.location ?? '',
        responsible: this.bem.responsible ?? '',
        acquisitionDate: this.bem.acquisitionDate ?? '',
        acquisitionValue: this.bem.acquisitionValue ?? 0,
        supplier: this.bem.supplier,
        nfNumber: this.bem.nfNumber ?? '',
        nfEmissionDate: this.bem.nfEmissionDate ?? '',
        nfAccessKey: this.bem.nfAccessKey ?? '',
        warrantyUntil: this.bem.warrantyUntil ?? '',
        usefulLifeYears: this.bem.usefulLifeYears,
        depreciationRate: this.bem.depreciationRate,
        residualValue: this.bem.residualValue,
        depreciationMethod: this.bem.depreciationMethod,
        active: this.bem.active ?? true
      };

      this.selectedSupplierId = this.bem.supplier?.id ?? '';
      return;
    }

    if (this.mode === 'create') {
      this.resetForm();
    }
  }

  saveAsset(): void {
    if (this.isSaving) return;
    this.submitted = true;
    if (this.hasErrors) return;

    this.isSaving = true;
    this.formData.supplier = this.selectedSupplierId
      ? { id: this.selectedSupplierId }
      : null;

    const request$ = this.mode === 'create'
      ? this.assetService.create(this.formData)
      : this.assetService.update(this.bem!.id!, this.formData);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.closeDrawer(true);
      },
      error: (error) => {
        this.isSaving = false;
        this.showError(error);
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.selectedSupplierId = '';
    this.formData = {
      name: '',
      specs: '',
      brand: '',
      model: '',
      serialNumber: '',
      category: '',
      conservationStatus: '' as any,
      department: '',
      location: '',
      responsible: '',
      acquisitionDate: '',
      acquisitionValue: 0,
      nfNumber: '',
      nfEmissionDate: '',
      nfAccessKey: '',
      warrantyUntil: '',
      usefulLifeYears: undefined,
      depreciationRate: undefined,
      residualValue: undefined,
      depreciationMethod: undefined,
      active: true
    };
  }

  requestEdit(): void {
    this.editRequested.emit();
  }

  attemptClose(): void {
    if (this.hasUnsavedChanges) {
      this.showCloseConfirm = true;
    } else {
      this.closeDrawer();
    }
  }

  confirmClose(): void {
    this.showCloseConfirm = false;
    this.closeDrawer();
  }

  cancelClose(): void {
    this.showCloseConfirm = false;
  }

  closeDrawer(skipConfirm = false): void {
    this.submitted = false;
    this.showCloseConfirm = false;
    this.close.emit();
  }

  private showError(error: any): void {
    this.toastLeaving = false;
    this.errorMessage = error?.error?.message || 'Erro ao salvar bem. Tente novamente.';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.errorMessage = '';
        this.toastLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }
}