import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: false,
  templateUrl: './suppliers-form.html',
  styleUrl: './suppliers-form.css',
})
export class SuppliersForm implements OnChanges {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() supplier: Supplier | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isSaving = false;

  errorMessage = '';

  submitted = false;

  get validationErrors() {
    return {
      name: !this.formData.name.trim(),
      document: !this.formData.document.trim(),
      category: !this.formData.category.trim(),
      email: !this.formData.email.trim() || !this.formData.email.includes('@'),
      phone: !this.formData.phone.trim(),
    };
  }

  readonly categoriesPJ = ['Hardware', 'Serviços', 'Papelaria', 'Limpeza', 'Representante', 'Outros'];
  readonly categoriesPF = ['Representante', 'Outros'];

  get categories(): string[] {
    return this.formData.personType === 'PF' ? this.categoriesPF : this.categoriesPJ;
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  formData = {
    personType: 'PJ' as 'PF' | 'PJ',
    name: '',
    document: '',
    category: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    neighborhood: '',
    active: true
  };

  constructor(private supplierService: SupplierService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.supplier && (this.mode === 'edit' || this.mode === 'view')) {
      this.formData = {
        personType: this.supplier.personType ?? 'PJ',
        name: this.supplier.name,
        document: this.supplier.document,
        category: this.supplier.category,
        contactName: this.supplier.contactName ?? '',
        email: this.supplier.email ?? '',
        phone: this.supplier.phone ?? '',
        address: this.supplier.address ?? '',
        zipCode: this.supplier.zipCode ?? '',
        city : this.supplier.city ?? '',
        neighborhood: this.supplier.neighborhood ?? '',
        active: this.supplier.active
      };
      return;
    }

    if (this.mode === 'create') {
      this.formData = {
        personType: 'PJ',
        name: '',
        document: '',
        category: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        zipCode: '',
        city: '',
        neighborhood: '',
        active: true
      };
    }
  }

  changePersonType(type: 'PF' | 'PJ'): void {
    this.submitted = false;
    this.formData.personType = type;
    this.formData.document = '';
    this.formData.category = '';

    if (type === 'PF') {
      this.formData.contactName = '';
    }
  }

  saveSupplier(): void {
    if (this.isSaving) return;

    this.submitted = true;

    if (this.hasErrors) {
      this.isSaving = false;
      return;
    }

    this.isSaving = true;

    if (this.mode === 'create') {
      this.supplierService.create(this.formData).subscribe({
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
      return;
    }

  if (this.mode === 'edit' && this.supplier?.id) {
    this.supplierService.update(this.supplier.id, this.formData).subscribe({
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
    return;
  }

  this.isSaving = false;
}

  onlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }

  formatDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numbers = this.onlyNumbers(input.value);
    let formatted: string;

    if (this.formData.personType === 'PF') {
      formatted = numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      formatted = numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }

    this.formData.document = formatted;
    input.value = formatted;
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numbers = this.onlyNumbers(input.value).slice(0, 11);
    const formatted = numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');

    this.formData.phone = formatted;
    input.value = formatted;
  }

  formatZipCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numbers = this.onlyNumbers(input.value).slice(0, 8);
    const formatted = numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');

    this.formData.zipCode = formatted;
    input.value = formatted;
  }

  private showError(error: any): void {
    this.errorMessage = error.status === 409
      ? 'Este CNPJ/CPF já está cadastrado.'
      : 'Erro ao salvar. Tente novamente.';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  closeDrawer(): void {
    this.submitted = false;
    this.close.emit();
  }
}